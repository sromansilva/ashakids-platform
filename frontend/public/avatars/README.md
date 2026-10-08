# Catálogo de Avatares — ASHAKids

Esta carpeta contiene los recursos gráficos vectoriales (SVG) de los avatares infantiles utilizados en la plataforma ASHAKids.

## Propósito

Los avatares representan visualmente a los niños (pacientes) en la plataforma tanto en la vista del tutor («Centro Familiar», «Mi Camino ASHA», «Mis Hijos») como en el módulo lúdico de Mundo ASHA y en la gestión administrativa.

## Convención de Nombres y Relación con la Base de Datos

1. La tabla `public.pacientes` de PostgreSQL almacena el identificador único del avatar en la columna:
   ```sql
   avatar_nombre VARCHAR(20) NOT NULL DEFAULT 'zorro'
   ```
2. La columna **solo almacena el identificador o slug** (por ejemplo: `zorro`, `panda`, `tortuga`), **nunca la ruta del archivo ni URLs completas**.
3. El archivo gráfico correspondiente en esta carpeta debe nombrarse exactamente:
   ```text
   {avatar_nombre}.svg
   ```
   Ejemplo:
   - Identificador en BD: `zorro` → Archivo: `/avatars/zorro.svg`
   - Identificador en BD: `panda` → Archivo: `/avatars/panda.svg`
   - Identificador en BD: `tortuga` → Archivo: `/avatars/tortuga.svg`

## Catálogo Oficial Inicial de Identificadores Permitidos

| Identificador (`avatar_nombre`) | Nombre Mostrado | Color Temático | Fallback Visual |
| :--- | :--- | :---: | :---: |
| `zorro` *(Predeterminado)* | Zorro Astuto | `#F97316` | 🦊 |
| `oso` | Oso Amigable | `#B45309` | 🐻 |
| `conejo` | Conejo Saltarín | `#EC4899` | 🐰 |
| `panda` | Panda Curioso | `#374151` | 🐼 |
| `leon` | León Valiente | `#EAB308` | 🦁 |
| `koala` | Koala Tranquilo | `#6B7280` | 🐨 |
| `tortuga` | Tortuga Sabia | `#10B981` | 🐢 |
| `buho` | Búho Sabio | `#8B5CF6` | 🦉 |
| `mono` | Mono Juguetón | `#D97706` | 🐵 |
| `pinguino` | Pingüino Feliz | `#0EA5E9` | 🐧 |

## Cómo Agregar Nuevos Avatares sin Modificar el Esquema de Base de Datos

1. **Sin DDL:** No es necesario modificar PostgreSQL ni ejecutar migraciones. La columna `VARCHAR(20)` acepta cualquier slug alfanumérico de hasta 20 caracteres.
2. **Backend:** Agregar el nuevo identificador al conjunto `ALLOWED_AVATARS` en `backend/app/schemas/pacientes.py` o servicio correspondiente.
3. **Frontend:** Agregar el nuevo objeto al catálogo central en `frontend/src/config/avatars.ts` con su nombre amigable, emoji fallback y color temático.
4. **Archivo:** Depositar el archivo `{slug}.svg` en este directorio (`frontend/public/avatars/`).
5. **Fallback:** Si el archivo SVG aún no se ha diseñado o incorporado, los componentes de React mostrarán automáticamente el emoji y color de fondo correspondientes sin romper la interfaz.
