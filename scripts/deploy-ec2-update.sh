#!/usr/bin/env bash
# Deploy one already-validated main commit on the ASHAKids EC2 instance.

set -Eeuo pipefail

APP_ROOT="${ASHAKIDS_APP_ROOT:-$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)}"
COMPOSE_FILE="docker-compose.ec2.yml"
ENV_FILE=".env.ec2"
PROJECT_NAME="ashakids-ec2"
TARGET_SHA="${1:-}"

fail() {
  printf 'ERROR: %s\n' "$*" >&2
  exit 1
}

[[ -n "$TARGET_SHA" && "$TARGET_SHA" =~ ^[0-9a-f]{40}$ ]] || fail "Pasa el SHA completo del commit que se va a desplegar."
[[ -d "$APP_ROOT/.git" ]] || fail "No encuentro el repositorio Git en $APP_ROOT."
[[ -f "$APP_ROOT/$ENV_FILE" ]] || fail "No encuentro $ENV_FILE; conserva la configuración de producción antes de desplegar."
[[ -f "$APP_ROOT/$COMPOSE_FILE" ]] || fail "No encuentro $COMPOSE_FILE."

cd "$APP_ROOT"
[[ -z "$(git status --porcelain --untracked-files=no)" ]] || fail "Hay cambios locales rastreados; no los sobrescribiré."
git cat-file -e "${TARGET_SHA}^{commit}" || fail "El commit $TARGET_SHA no está disponible en el repositorio local."
git merge-base --is-ancestor "$TARGET_SHA" origin/main || fail "El commit solicitado no pertenece al historial publicado de main."

PREVIOUS_SHA="$(git rev-parse HEAD)"

if [[ "$(id -u)" -eq 0 ]]; then
  SUDO=()
else
  command -v sudo >/dev/null 2>&1 || fail "Se requiere sudo para ejecutar Docker Compose."
  SUDO=(sudo)
fi

compose() {
  "${SUDO[@]}" docker compose \
    --project-name "$PROJECT_NAME" \
    --env-file "$ENV_FILE" \
    --file "$COMPOSE_FILE" \
    "$@"
}

rollback_on_error() {
  local deploy_status="$1"
  trap - ERR
  set +e

  if [[ "$PREVIOUS_SHA" != "$TARGET_SHA" ]]; then
    printf '\nFalló el despliegue; intentando restaurar el commit anterior %s...\n' "$PREVIOUS_SHA" >&2
    git checkout --detach "$PREVIOUS_SHA" >/dev/null 2>&1
    if [[ "$?" -eq 0 ]] && compose config --quiet && compose up --detach --build --wait --wait-timeout 300; then
      printf 'Se restauró la versión anterior.\n' >&2
      compose ps >&2
    else
      printf 'No se pudo confirmar la restauración automática; revisa los contenedores en EC2.\n' >&2
    fi
  fi

  exit "$deploy_status"
}

trap 'rollback_on_error $?' ERR

git checkout --detach "$TARGET_SHA"
compose config --quiet
compose up --detach --build --wait --wait-timeout 300

compose exec --no-TTY app node --input-type=module -e '
  const response = await fetch("http://127.0.0.1:8000/health/ready");
  const body = await response.json().catch(() => ({}));
  if (!response.ok || body.status !== "ready" || body.database !== "connected") {
    console.error(JSON.stringify({ status: response.status, body }));
    process.exit(1);
  }
  console.log("Health check listo; PostgreSQL conectado.");
'

compose ps
trap - ERR
printf '\nDesplegado: %s\n' "$TARGET_SHA"
