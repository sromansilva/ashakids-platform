# Despliegue de ASHAKids en EC2

La configuración de EC2 está en `docker-compose.ec2.yml`. Ejecuta PostgreSQL 18 en una red privada de Docker, la aplicación sirve la SPA y la API en el mismo origen, y Caddy proporciona la entrada HTTP/HTTPS. Caddy obtiene y renueva el certificado TLS. Puedes usar el IPv4 público de la instancia directamente (certificado IP de corta duración) o un dominio propio.

## Requisitos de AWS

- Región asignada al proyecto, confirmada en **AWS Settings → Projects → Overview → Additional Info → Region**.
- Instancia Ubuntu Server 22.04/24.04 LTS x86_64. `t3.small` es la opción recomendada para construir y ejecutar la plataforma; EBS gp3 cifrado de 20 GB.
- Par de claves `.pem` para SSH; restringe TCP 22 a tu IP. Abre TCP 80 y 443 al público. No publiques TCP 5432 ni 8000.
- Si usas un dominio, configura su registro DNS A hacia la IPv4 pública de EC2 antes del despliegue. Si no tienes dominio, el script configura HTTPS directamente para la IP pública.
- Revisa el plan y el gasto estimado en AWS Settings → Billing. La instancia, el almacenamiento y la IPv4 pública pueden generar cargos mientras estén activos.

## Despliegue

Desde tu equipo, conecta por SSH:

```bash
ssh -i "tu-llave.pem" ubuntu@IP_PUBLICA
```

Ya en la terminal de EC2, instala Git y clona la rama que contiene el commit publicado:

```bash
sudo apt-get update && sudo apt-get install -y git
git clone -b feat/sroman https://github.com/sromansilva/ashakids-platform.git
cd ashakids-platform
chmod +x scripts/deploy-ec2.sh
./scripts/deploy-ec2.sh
```

El script instala Docker y Compose si hacen falta, ofrece usar la IPv4 pública o un dominio, genera contraseñas aleatorias de producción y guarda `.env.ec2` con permisos privados. Si eliges un dominio, comprueba que su DNS A apunte a la EC2. Para la IP usa un certificado Let's Encrypt de corta duración que Caddy renueva automáticamente. Si prefieres configurar las variables antes, copia `deploy/ec2.env.example` a `.env.ec2`, completa `APP_HOST`, `TLS_MODE` y los secretos, y vuelve a ejecutar el script.

El primer arranque carga `docker/init.sql` y luego crea el usuario restringido de la aplicación con `docker/20-create-app-user.sql`. Los scripts de inicialización solo corren cuando el volumen PostgreSQL está vacío. El volcado incluido contiene datos ficticios de demostración; sustitúyelos antes de permitir acceso a usuarios reales.

## Comprobación y operación

```bash
sudo docker compose --project-name ashakids-ec2 --env-file .env.ec2 --file docker-compose.ec2.yml ps
sudo docker compose --project-name ashakids-ec2 --env-file .env.ec2 --file docker-compose.ec2.yml logs --tail=100 app caddy postgres
curl -fsS "https://$(grep '^APP_HOST=' .env.ec2 | cut -d= -f2)/health/ready"
```

Antes de producción con datos reales, prueba el inicio/cierre de sesión por HTTPS, los permisos por rol, la separación de datos, y un respaldo con restauración. No guardes credenciales reales en Git ni en archivos del frontend.
