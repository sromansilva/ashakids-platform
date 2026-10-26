#!/usr/bin/env bash
# Deploy ASHAKids on Ubuntu EC2 with the production Compose stack and Caddy TLS.

set -Eeuo pipefail

APP_ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$APP_ROOT"

COMPOSE_FILE="docker-compose.ec2.yml"
ENV_FILE=".env.ec2"
PROJECT_NAME="ashakids-ec2"

fail() {
  printf 'ERROR: %s\n' "$*" >&2
  exit 1
}

read_env_value() {
  local key="$1"
  awk -F= -v key="$key" '$1 == key { sub(/^[^=]*=/, ""); print; exit }' "$ENV_FILE"
}

valid_domain() {
  [[ "$1" =~ ^([A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z]{2,63}$ ]]
}

[[ -f "$COMPOSE_FILE" ]] || fail "No encuentro $COMPOSE_FILE en $APP_ROOT."
[[ -f docker/init.sql && -f docker/20-create-app-user.sql ]] || fail "Faltan los scripts de inicialización de PostgreSQL."

if [[ ! -f "$ENV_FILE" ]]; then
  [[ -t 0 ]] || fail "Crea $ENV_FILE desde deploy/ec2.env.example y configura APP_DOMAIN; el dominio es necesario para HTTPS."

  printf 'La aplicación necesita un dominio propio con un registro DNS A hacia esta instancia para activar HTTPS.\n'
  read -r -p 'Dominio (por ejemplo, app.midominio.com): ' APP_DOMAIN_INPUT
  valid_domain "$APP_DOMAIN_INPUT" || fail "Dominio no válido: $APP_DOMAIN_INPUT"

  command -v openssl >/dev/null 2>&1 || fail "Instala openssl para generar secretos de producción."
  umask 077
  cat > "$ENV_FILE" <<EOF
APP_DOMAIN=$APP_DOMAIN_INPUT
APP_DB_USER=ashakids_app
APP_DB_PASSWORD=$(openssl rand -hex 32)
POSTGRES_PASSWORD=$(openssl rand -hex 32)
EOF
  chmod 600 "$ENV_FILE"
  printf 'Creé %s con permisos privados y contraseñas aleatorias. No se sube a Git.\n' "$ENV_FILE"
else
  chmod 600 "$ENV_FILE"
fi

APP_DOMAIN="$(read_env_value APP_DOMAIN)"
APP_DB_USER="$(read_env_value APP_DB_USER)"
APP_DB_PASSWORD="$(read_env_value APP_DB_PASSWORD)"
POSTGRES_PASSWORD="$(read_env_value POSTGRES_PASSWORD)"

valid_domain "$APP_DOMAIN" || fail "APP_DOMAIN debe ser un dominio DNS válido, sin https:// ni rutas."
[[ -n "$APP_DB_USER" && "$APP_DB_USER" != "postgres" ]] || fail "APP_DB_USER debe ser un usuario de aplicación distinto de postgres."
[[ ${#APP_DB_PASSWORD} -ge 20 ]] || fail "APP_DB_PASSWORD debe tener al menos 20 caracteres."
[[ ${#POSTGRES_PASSWORD} -ge 20 ]] || fail "POSTGRES_PASSWORD debe tener al menos 20 caracteres."
[[ "$APP_DB_PASSWORD" != REPLACE_WITH_* && "$POSTGRES_PASSWORD" != REPLACE_WITH_* ]] || fail "Reemplaza los secretos de ejemplo en $ENV_FILE."

if [[ "$(id -u)" -ne 0 ]]; then
  command -v sudo >/dev/null 2>&1 || fail "Ejecuta este script como root o instala sudo."
  SUDO=sudo
else
  SUDO=
fi

if [[ ! -x /usr/bin/apt-get || ! -r /etc/os-release ]]; then
  fail "Este script requiere Ubuntu Server 22.04 o 24.04 LTS."
fi
# shellcheck disable=SC1091
source /etc/os-release
[[ "${ID:-}" == "ubuntu" ]] || fail "Este script requiere Ubuntu Server; detecté ${PRETTY_NAME:-un sistema desconocido}."
[[ "$(dpkg --print-architecture)" == "amd64" ]] || fail "Esta configuración requiere Ubuntu x86_64 (amd64)."

echo "[1/5] Instalando dependencias base..."
$SUDO apt-get update -y
$SUDO apt-get install -y ca-certificates curl gnupg

if ! command -v docker >/dev/null 2>&1 || ! docker compose version >/dev/null 2>&1; then
  echo "[2/5] Instalando Docker Engine y Docker Compose desde el repositorio oficial..."
  $SUDO install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | $SUDO gpg --dearmor --yes -o /etc/apt/keyrings/docker.gpg
  $SUDO chmod a+r /etc/apt/keyrings/docker.gpg
  echo "deb [arch=amd64 signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu ${VERSION_CODENAME} stable" \
    | $SUDO tee /etc/apt/sources.list.d/docker.list >/dev/null
  $SUDO apt-get update -y
  $SUDO apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
else
  echo "[2/5] Docker Engine y Docker Compose ya están instalados."
fi

compose() {
  $SUDO docker compose --project-name "$PROJECT_NAME" --env-file "$ENV_FILE" --file "$COMPOSE_FILE" "$@"
}

echo "[3/5] Validando configuración de producción..."
compose config --quiet

PUBLIC_IP="$(curl --fail --silent --show-error --max-time 10 https://checkip.amazonaws.com | tr -d '[:space:]' || true)"
[[ "$PUBLIC_IP" =~ ^([0-9]{1,3}\.){3}[0-9]{1,3}$ ]] || fail "No pude detectar la IPv4 pública de la instancia."

DNS_IPS="$(getent ahostsv4 "$APP_DOMAIN" 2>/dev/null | awk '{print $1}' | sort -u || true)"
if ! grep -Fxq "$PUBLIC_IP" <<< "$DNS_IPS"; then
  printf '\nEl dominio %s todavía no resuelve a esta instancia.\n' "$APP_DOMAIN"
  printf 'Configura un registro DNS A: %s -> %s\n' "$APP_DOMAIN" "$PUBLIC_IP"
  [[ -t 0 ]] || fail "Cuando el DNS apunte a esta IPv4, vuelve a ejecutar el script."
  read -r -p 'Presiona Enter cuando el registro DNS esté actualizado... ' _
  for attempt in {1..12}; do
    DNS_IPS="$(getent ahostsv4 "$APP_DOMAIN" 2>/dev/null | awk '{print $1}' | sort -u || true)"
    grep -Fxq "$PUBLIC_IP" <<< "$DNS_IPS" && break
    [[ "$attempt" -lt 12 ]] && sleep 10
  done
  grep -Fxq "$PUBLIC_IP" <<< "$DNS_IPS" || fail "El DNS aún no apunta a $PUBLIC_IP. Espera su propagación y ejecuta de nuevo el script."
fi

echo "[4/5] Levantando PostgreSQL 18, la API y Caddy con HTTPS..."
compose up --detach --build --wait --wait-timeout 300

echo "[5/5] Verificando contenedores..."
compose ps

printf '\nDespliegue iniciado.\n'
printf 'Sitio:       https://%s\n' "$APP_DOMAIN"
printf 'Health API:  https://%s/health/ready\n' "$APP_DOMAIN"
printf 'Compose:     docker compose --project-name %s --env-file %s --file %s\n' "$PROJECT_NAME" "$ENV_FILE" "$COMPOSE_FILE"
printf '\nMantén abiertos TCP 80 y 443 en el security group. No expongas TCP 5432.\n'
