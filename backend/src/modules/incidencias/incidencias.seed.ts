import crypto from 'node:crypto';
import { pool } from '../../core/database.js';

interface TicketSeed {
  ticket: string;
  solicitante: string;
  rol: 'PADRE' | 'TERAPEUTA';
  destino: 'Terapeuta' | 'Administración' | 'Soporte técnico';
  prioridad: 'BAJA' | 'MEDIA' | 'ALTA';
  estado: 'ATENDIDA' | 'LEÍDA' | 'RECIBIDA';
  solicitud: string;
  es_prueba: boolean;
}

export const TICKETS_SPRINT_05: TicketSeed[] = [
  {
    ticket: 'INC-00001',
    solicitante: 'Nicolas Lavado',
    rol: 'PADRE',
    destino: 'Terapeuta',
    prioridad: 'MEDIA',
    estado: 'ATENDIDA',
    solicitud: 'Consultar historial completo de sesiones y reportes evolutivos del hijo.',
    es_prueba: false,
  },
  {
    ticket: 'INC-00002',
    solicitante: 'Sergei Ramirez',
    rol: 'TERAPEUTA',
    destino: 'Administración',
    prioridad: 'ALTA',
    estado: 'LEÍDA',
    solicitud: 'Habilitar permisos de acceso al módulo de analíticas avanzadas para revisar pacientes.',
    es_prueba: false,
  },
  {
    ticket: 'INC-00003',
    solicitante: 'Mauricio Torres',
    rol: 'PADRE',
    destino: 'Administración',
    prioridad: 'BAJA',
    estado: 'ATENDIDA',
    solicitud: 'Actualizar teléfono de contacto y dirección de domicilio del perfil.',
    es_prueba: false,
  },
  {
    ticket: 'INC-00004',
    solicitante: 'PieroT Anticona',
    rol: 'TERAPEUTA',
    destino: 'Soporte técnico',
    prioridad: 'BAJA',
    estado: 'RECIBIDA',
    solicitud: 'Consultar el procedimiento para reservar una cita con un terapeuta específico desde el directorio.',
    es_prueba: false,
  },
  {
    ticket: 'INC-00005',
    solicitante: 'Junior Terapeuta',
    rol: 'TERAPEUTA',
    destino: 'Administración',
    prioridad: 'MEDIA',
    estado: 'LEÍDA',
    solicitud: 'Crear y habilitar la cuenta profesional de un terapeuta asistente.',
    es_prueba: false,
  },
  {
    ticket: 'INC-00006',
    solicitante: 'Piero Anticona',
    rol: 'PADRE',
    destino: 'Administración',
    prioridad: 'ALTA',
    estado: 'ATENDIDA',
    solicitud: 'Restablecer contraseña para ingresar a la sesión programada para hoy.',
    es_prueba: false,
  },
  {
    ticket: 'INC-00007',
    solicitante: 'Sergei Ramirez',
    rol: 'TERAPEUTA',
    destino: 'Soporte técnico',
    prioridad: 'BAJA',
    estado: 'LEÍDA',
    solicitud: 'Consultar cómo generar y descargar un reporte de sesión en PDF firmado.',
    es_prueba: false,
  },
  {
    ticket: 'INC-00008',
    solicitante: 'PIERO ANTICONA',
    rol: 'PADRE',
    destino: 'Administración',
    prioridad: 'MEDIA',
    estado: 'RECIBIDA',
    solicitud: 'Habilitar permisos de mensajería directa con la terapeuta asignada.',
    es_prueba: false,
  },
  {
    ticket: 'INC-00009',
    solicitante: 'PieroT Anticona',
    rol: 'TERAPEUTA',
    destino: 'Soporte técnico',
    prioridad: 'BAJA',
    estado: 'RECIBIDA',
    solicitud: 'Ajustar disponibilidad horaria para habilitar turnos los viernes por la tarde.',
    es_prueba: false,
  },
  {
    ticket: 'INC-00010',
    solicitante: 'jorge curioso',
    rol: 'PADRE',
    destino: 'Terapeuta',
    prioridad: 'BAJA',
    estado: 'ATENDIDA',
    solicitud: 'Consultar progreso de niveles e insignias alcanzadas en Mundo ASHA.',
    es_prueba: false,
  },
  {
    ticket: 'INC-00011',
    solicitante: 'Junior Terapeuta',
    rol: 'TERAPEUTA',
    destino: 'Administración',
    prioridad: 'ALTA',
    estado: 'ATENDIDA',
    solicitud: 'Revocar y desactivar el acceso de un terapeuta que concluyó sus prácticas.',
    es_prueba: false,
  },
  {
    ticket: 'INC-00012',
    solicitante: 'Junior Neyra',
    rol: 'PADRE',
    destino: 'Soporte técnico',
    prioridad: 'MEDIA',
    estado: 'LEÍDA',
    solicitud: 'Configurar notificaciones por correo para confirmaciones y recordatorios de citas.',
    es_prueba: false,
  },
  {
    ticket: 'INC-00013',
    solicitante: 'Anticucho El 3000',
    rol: 'TERAPEUTA',
    destino: 'Administración',
    prioridad: 'BAJA',
    estado: 'RECIBIDA',
    solicitud: 'Consultar el historial de valoraciones y estrellas registradas por los padres.',
    es_prueba: false,
  },
  {
    ticket: 'INC-00014',
    solicitante: 'piero segundo',
    rol: 'PADRE',
    destino: 'Administración',
    prioridad: 'MEDIA',
    estado: 'RECIBIDA',
    solicitud: 'Habilitar acceso para agregar un segundo hijo al núcleo familiar y gestionar sus sesiones.',
    es_prueba: false,
  },
  {
    ticket: 'INC-00015',
    solicitante: 'Sergei Ramirez',
    rol: 'TERAPEUTA',
    destino: 'Administración',
    prioridad: 'BAJA',
    estado: 'RECIBIDA',
    solicitud: 'Actualizar descripción profesional y añadir especialidad de terapia del habla y deglución.',
    es_prueba: false,
  },
  {
    ticket: 'INC-00016',
    solicitante: 'Nicolas Lavado',
    rol: 'PADRE',
    destino: 'Soporte técnico',
    prioridad: 'ALTA',
    estado: 'RECIBIDA',
    solicitud: 'No puedo abrir el enlace de la sesión virtual programada para hoy.',
    es_prueba: true,
  },
  {
    ticket: 'INC-00017',
    solicitante: 'Mauricio Torres',
    rol: 'PADRE',
    destino: 'Terapeuta',
    prioridad: 'BAJA',
    estado: 'RECIBIDA',
    solicitud: 'Necesito que me aclaren qué ejercicios debe practicar mi hijo en casa esta semana.',
    es_prueba: true,
  },
  {
    ticket: 'INC-00018',
    solicitante: 'Piero Anticona',
    rol: 'PADRE',
    destino: 'Terapeuta',
    prioridad: 'MEDIA',
    estado: 'RECIBIDA',
    solicitud: 'El reporte de la última sesión no refleja los avances que conversé con la terapeuta.',
    es_prueba: true,
  },
  {
    ticket: 'INC-00019',
    solicitante: 'jorge curioso',
    rol: 'PADRE',
    destino: 'Terapeuta',
    prioridad: 'BAJA',
    estado: 'RECIBIDA',
    solicitud: 'Solicito cambiar la fecha de la sesión de mi hijo porque tengo un inconveniente de horario.',
    es_prueba: true,
  },
  {
    ticket: 'INC-00020',
    solicitante: 'Junior Neyra',
    rol: 'PADRE',
    destino: 'Terapeuta',
    prioridad: 'BAJA',
    estado: 'RECIBIDA',
    solicitud: 'No comprendo cómo realizar una actividad que indicaron para continuar la terapia en casa.',
    es_prueba: true,
  },
  {
    ticket: 'INC-00021',
    solicitante: 'PIERO ANTICONA',
    rol: 'PADRE',
    destino: 'Terapeuta',
    prioridad: 'ALTA',
    estado: 'RECIBIDA',
    solicitud: 'La sesión aparece como realizada, pero no pude conectarme ni recibir atención.',
    es_prueba: true,
  },
  {
    ticket: 'INC-00022',
    solicitante: 'Mauricio Torres',
    rol: 'PADRE',
    destino: 'Terapeuta',
    prioridad: 'BAJA',
    estado: 'RECIBIDA',
    solicitud: 'Solicito información sobre los objetivos trabajados y los avances observados en la última sesión.',
    es_prueba: true,
  },
  {
    ticket: 'INC-00023',
    solicitante: 'Sergei Ramirez',
    rol: 'TERAPEUTA',
    destino: 'Soporte técnico',
    prioridad: 'ALTA',
    estado: 'RECIBIDA',
    solicitud: 'No puedo ver correctamente la información de uno de mis pacientes.',
    es_prueba: true,
  },
  {
    ticket: 'INC-00024',
    solicitante: 'PieroT Anticona',
    rol: 'TERAPEUTA',
    destino: 'Administración',
    prioridad: 'ALTA',
    estado: 'RECIBIDA',
    solicitud: 'Necesito cambiar mi correo institucional porque ya no puedo entrar al anterior.',
    es_prueba: true,
  },
  {
    ticket: 'INC-00025',
    solicitante: 'Sergei Ramirez',
    rol: 'TERAPEUTA',
    destino: 'Soporte técnico',
    prioridad: 'ALTA',
    estado: 'RECIBIDA',
    solicitud: 'No puedo entrar a la sección de reportes para registrar los resultados de una sesión.',
    es_prueba: true,
  },
  {
    ticket: 'INC-00026',
    solicitante: 'Junior Terapeuta',
    rol: 'TERAPEUTA',
    destino: 'Soporte técnico',
    prioridad: 'MEDIA',
    estado: 'RECIBIDA',
    solicitud: 'La plataforma no guarda los cambios que hago en mi horario disponible.',
    es_prueba: true,
  },
  {
    ticket: 'INC-00027',
    solicitante: 'PieroT Anticona',
    rol: 'TERAPEUTA',
    destino: 'Administración',
    prioridad: 'MEDIA',
    estado: 'RECIBIDA',
    solicitud: 'Solicito desactivar una cuenta duplicada de terapeuta que aparece en el directorio.',
    es_prueba: true,
  },
  {
    ticket: 'INC-00028',
    solicitante: 'Junior Neyra',
    rol: 'PADRE',
    destino: 'Soporte técnico',
    prioridad: 'MEDIA',
    estado: 'RECIBIDA',
    solicitud: 'Los recordatorios de las sesiones no están llegando al correo que registré.',
    es_prueba: true,
  },
  {
    ticket: 'INC-00029',
    solicitante: 'Nicolas Lavado',
    rol: 'PADRE',
    destino: 'Soporte técnico',
    prioridad: 'MEDIA',
    estado: 'RECIBIDA',
    solicitud: 'No puedo enviar un mensaje ni adjuntar el documento que me pidió la terapeuta.',
    es_prueba: true,
  },
  {
    ticket: 'INC-00030',
    solicitante: 'Mauricio Torres',
    rol: 'PADRE',
    destino: 'Administración',
    prioridad: 'ALTA',
    estado: 'RECIBIDA',
    solicitud: 'Vi un ingreso a mi cuenta que no reconozco y solicito que revisen lo ocurrido.',
    es_prueba: true,
  },
];

function inferTipoIncidencia(solicitud: string, destino: string): string {
  const lower = solicitud.toLowerCase();
  if (lower.includes('contraseña') || lower.includes('ingreso a mi cuenta') || lower.includes('correo institucional')) {
    return 'Seguridad y Acceso';
  }
  if (lower.includes('permisos') || lower.includes('habilitar acceso') || lower.includes('crear y habilitar') || lower.includes('revocar') || lower.includes('desactivar')) {
    return 'Cuentas y Permisos';
  }
  if (lower.includes('teléfono') || lower.includes('dirección') || lower.includes('descripción profesional')) {
    return 'Información de Perfil';
  }
  if (lower.includes('sesión') || lower.includes('cita') || lower.includes('horario') || lower.includes('enlace')) {
    return 'Sesiones y Citas';
  }
  if (lower.includes('ejercicios') || lower.includes('reporte') || lower.includes('actividad') || lower.includes('objetivos')) {
    return 'Seguimiento Terapéutico';
  }
  if (lower.includes('mundo asha') || lower.includes('insignias') || lower.includes('juego')) {
    return 'Mundo ASHA';
  }
  if (destino === 'Soporte técnico') {
    return 'Soporte de Plataforma';
  }
  return 'Consulta General';
}

function priorityToInt(p: 'BAJA' | 'MEDIA' | 'ALTA'): number {
  switch (p) {
    case 'ALTA': return 3;
    case 'MEDIA': return 2;
    case 'BAJA': return 1;
    default: return 2;
  }
}

function areaDestinoToCode(destino: string): 'TERAPEUTA' | 'ADMINISTRACION' | 'SOPORTE_TECNICO' {
  if (destino === 'Terapeuta') return 'TERAPEUTA';
  if (destino === 'Soporte técnico') return 'SOPORTE_TECNICO';
  return 'ADMINISTRACION';
}

function normalizeName(name: string): { nombres: string; apellidos: string } {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return { nombres: parts[0], apellidos: 'AshaKids' };
  const nombres = parts.slice(0, parts.length - 1).join(' ');
  const apellidos = parts[parts.length - 1];
  return { nombres, apellidos };
}

export async function seedIncidencias() {
  console.log('[Seed] Invocando seed idempotente de 30 tickets de incidencias...');
  const client = await pool.connect();
  try {
    await client.query('BEGIN;');

    // 1. Obtener o crear usuarios para los solicitantes
    const userCache = new Map<string, number>();

    // Cargar usuarios existentes
    const existingUsers = await client.query('SELECT id_usuario, nombres, apellidos, email FROM usuarios;');
    for (const u of existingUsers.rows) {
      const full = `${u.nombres} ${u.apellidos}`.toLowerCase();
      userCache.set(full, u.id_usuario);
    }

    // Asegurar roles
    const rolesRes = await client.query('SELECT id_rol, nombre_rol FROM roles;');
    const rolesMap = new Map<string, number>();
    for (const r of rolesRes.rows) {
      rolesMap.set(r.nombre_rol, r.id_rol);
    }

    // Asegurar terapeuta por defecto (id_terapeuta 1 o primero disponible)
    const terRes = await client.query('SELECT id_terapeuta FROM terapeutas LIMIT 1;');
    const defaultTerapeutaId = terRes.rows.length > 0 ? terRes.rows[0].id_terapeuta : null;

    // Crear usuarios de seed que no existan aún
    for (const ticket of TICKETS_SPRINT_05) {
      const key = ticket.solicitante.trim().toLowerCase();
      if (!userCache.has(key)) {
        const { nombres, apellidos } = normalizeName(ticket.solicitante);
        const emailSlug = ticket.solicitante.toLowerCase().replace(/[^a-z0-9]/g, '.').replace(/\.+/g, '.');
        const email = `${emailSlug}@ashakids.test`;
        const prefix = ticket.rol === 'TERAPEUTA' ? 't' : 'p';
        const code = `${prefix}${Math.floor(10000 + Math.random() * 89999)}`;
        // Password hash Argon2id para '12345'
        const insertUser = await client.query(`
          INSERT INTO usuarios (nombres, apellidos, codigo_usuario, email, password_hash, activo, fecha_creacion)
          VALUES ($1, $2, $3, $4, '$argon2id$v=19$m=19456,t=2,p=1$gNRBKknzRIzVijb0Q4pUgg$1UVQo8y+sKyaiqUDWgYkOHNx/7Kt61c27XIZm9+2Mcg', true, NOW())
          ON CONFLICT (email) DO UPDATE SET nombres = EXCLUDED.nombres
          RETURNING id_usuario;
        `, [nombres, apellidos, code, email]);
        const id_usuario = insertUser.rows[0].id_usuario;
        userCache.set(key, id_usuario);

        // Asignar rol
        const rolId = rolesMap.get(ticket.rol);
        if (rolId) {
          await client.query(`
            INSERT INTO usuario_roles (id_usuario, id_rol, activo, fecha_asignacion)
            VALUES ($1, $2, true, NOW())
            ON CONFLICT DO NOTHING;
          `, [id_usuario, rolId]);
        }
      }
    }

    // 2. Insertar los 30 tickets
    let insertedCount = 0;
    let existingCount = 0;

    for (const t of TICKETS_SPRINT_05) {
      const id_usuario = userCache.get(t.solicitante.trim().toLowerCase()) || null;
      const area = areaDestinoToCode(t.destino);
      const prioridadInt = priorityToInt(t.prioridad);
      const tipo = inferTipoIncidencia(t.solicitud, t.destino);
      const id_terapeuta = area === 'TERAPEUTA' ? defaultTerapeutaId : null;
      const responsable = area === 'TERAPEUTA' ? 'terapeuta' : area === 'SOPORTE_TECNICO' ? 'soporte_tecnico' : 'admin';

      // UUID determinista basado en ticket
      const envio_id = crypto.createHash('md5').update(`ashakids-${t.ticket}`).digest('hex').replace(
        /^(.{8})(.{4})(.{4})(.{4})(.{12})$/,
        '$1-$2-$3-$4-$5'
      );

      // Idempotente: INSERT ON CONFLICT (ticket) DO NOTHING
      const insertRes = await client.query(`
        INSERT INTO public.incidencias (
          ticket, tipo, solicitud, solicitante, id_usuario, rol_solicitante,
          responsable, prioridad, estado, envio_id, id_terapeuta, area_destino,
          es_prueba, fecha_creacion, fecha_actualizacion
        ) VALUES (
          $1, $2, $3, $4, $5, $6,
          $7, $8, $9, $10, $11, $12,
          $13, NOW() - (INTERVAL '1 day' * (30 - $14::int)), NOW()
        )
        ON CONFLICT (ticket) DO NOTHING
        RETURNING id_incidencia;
      `, [
        t.ticket,
        tipo,
        t.solicitud,
        t.solicitante,
        id_usuario,
        t.rol,
        responsable,
        prioridadInt,
        t.estado,
        envio_id,
        id_terapeuta,
        area,
        t.es_prueba,
        parseInt(t.ticket.replace('INC-', ''), 10) || 1,
      ]);

      if (insertRes.rows.length > 0) {
        insertedCount++;
      } else {
        existingCount++;
      }
    }

    // Sincronizar secuencia de tickets para que los nuevos tickets comiencen en INC-00031
    await client.query(`
      SELECT setval('public.incidencias_ticket_seq', 30, true);
    `);

    await client.query('COMMIT;');
    console.log(`[Seed] Tickets completados. Insertados: ${insertedCount}, Ya existentes: ${existingCount}. Total 30 garantizado.`);
  } catch (err) {
    await client.query('ROLLBACK;');
    console.error('[Seed] Error al sembrar tickets:', err);
    throw err;
  } finally {
    client.release();
  }
}

if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`) {
  seedIncidencias().then(() => pool.end());
}

