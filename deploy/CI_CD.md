# CI/CD de ASHAKids hacia EC2

## Flujo

- Al abrir o actualizar un PR hacia `dev` o `main`, GitHub Actions ejecuta pruebas, chequeo de tipos, compilación de frontend y backend, revisión arquitectónica del frontend y construcción de la imagen Docker.
- El flujo del repositorio es `feat/*` → `dev` → `main`. El PR `dev` → `main` sirve como promoción a producción.
- Abrir un PR no cambia el sitio público. Después de integrar cambios en `main`, GitHub vuelve a ejecutar CI en el commit integrado. El job de despliegue solo se ejecuta si las tres tareas de CI terminan correctamente.
- GitHub asume un rol IAM temporal mediante OIDC y ejecuta un comando de AWS Systems Manager en una única instancia EC2. No se almacenan llaves SSH ni claves AWS de larga duración en GitHub.
- EC2 obtiene el SHA exacto de `main`, construye la aplicación con `docker-compose.ec2.yml`, espera los health checks y confirma que la API puede conectarse a PostgreSQL. Si el despliegue falla, el script intenta restaurar la versión que estaba activa antes.

## Recursos configurados en AWS

- Región: `us-east-2`.
- Instancia: `i-0e35ef609bf0a99ae` (`3.23.46.209`).
- Checkout de producción: `/opt/ashakids-platform`, propiedad de `root`; SSM ejecuta el despliegue con ese usuario.
- Perfil de EC2: rol con `AmazonSSMManagedInstanceCore`, únicamente para que el agente de Systems Manager registre la instancia y reciba Run Commands.
- GitHub Actions: rol OIDC con confianza limitada al repositorio `sromansilva/ashakids-platform` y a `refs/heads/main`.
- Permisos del rol de GitHub: `ssm:SendCommand` limitado al documento `AWS-RunShellScript` y a esa instancia; `ssm:GetCommandInvocation` para leer el resultado del despliegue.

El ARN del rol de GitHub se pasa desde la variable de repositorio `AWS_DEPLOY_ROLE_ARN` para facilitar cambios de cuenta sin publicar credenciales. No es una clave secreta. La variable ya quedó configurada en `sromansilva/ashakids-platform` con el valor `arn:aws:iam::655145562112:role/GitHubActions-AshaKids-Deploy`.

## Configuración de GitHub

La variable `AWS_DEPLOY_ROLE_ARN` ya está creada en **Settings → Secrets and variables → Actions → Variables**. El flujo no necesita GitHub secrets. La instancia debe aparecer como nodo `Online` en **AWS Systems Manager → Fleet Manager**. El perfil EC2 se adjunta una sola vez; después, SSM Agent obtiene credenciales temporales y la acción de GitHub usa OIDC.

## Requisitos de rama

1. Mantén los PRs de funcionalidad dirigidos a `dev`.
2. Integra `dev` en `main` mediante PR cuando el cambio esté aprobado.
3. Espera el CI del commit integrado. El despliegue a producción queda bloqueado si falla `frontend`, `backend` o `container`.
4. Revisa **Actions → CI → deploy-production** y abre `https://3.23.46.209/` después de un despliegue exitoso.

## Operación y seguridad

- No habilites el despliegue en `pull_request` ni uses `pull_request_target`; los PRs no deben recibir permisos de despliegue.
- No abras el puerto SSH para GitHub Actions. SSM usa conexiones salientes de la instancia.
- No guardes credenciales AWS en secretos de GitHub. OIDC entrega credenciales temporales solo al job de `main`.
- Los datos PostgreSQL se mantienen en el volumen Docker `ashakids-pgdata`; el despliegue no elimina volúmenes.
- Si SSM no reporta la instancia `Online`, el job falla antes de cambiar los contenedores. Revisa el perfil de instancia, SSM Agent y la salida HTTPS de la instancia.
