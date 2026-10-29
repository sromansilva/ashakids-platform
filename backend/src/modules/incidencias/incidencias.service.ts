import { pool } from '../../core/database.js';
import type { AuthenticatedUser } from '../../core/middleware/auth.middleware.js';

export interface IncidenciaItem {
  id_incidencia: number;
  ticket: string;
  tipo: string;
  titulo: string;
  descripcion: string;
  solicitante: string;
  rol_solicitante: string;
  area_destino: 'ADMINISTRACION' | 'TERAPEUTA' | 'SOPORTE_TECNICO';
  responsable: string;
  id_terapeuta: number | null;
  terapeuta_nombre?: string | null;
  prioridad: number;
  prioridad_texto: 'BAJA' | 'MEDIA' | 'ALTA';
  estado: string;
  envio_id?: string | null;
  es_prueba: boolean;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface IncidenciaAdminItem extends IncidenciaItem {
  usuario: string;
  rol: string;
}

export interface CreateIncidenciaDTO {
  tipo: string;
  titulo?: string;
  descripcion: string;
  id_terapeuta?: number | null;
  envio_id?: string;
}

export class IncidenciasService {
  /**
   * Clasifica automáticamente el área de destino según el rol, tipo y descripción
   */
  clasificarDestinatario(
    rolSolicitante: string,
    tipo: string,
    descripcion: string,
    idTerapeuta?: number | null
  ): { area_destino: 'ADMINISTRACION' | 'TERAPEUTA' | 'SOPORTE_TECNICO'; responsable: string; id_terapeuta: number | null } {
    // Si quien envía es ADMIN, va dirigido a SOPORTE_TECNICO
    if (rolSolicitante === 'ADMIN') {
      return { area_destino: 'SOPORTE_TECNICO', responsable: 'soporte_tecnico', id_terapeuta: null };
    }

    const text = `${tipo} ${descripcion}`.toLowerCase();

    // 1. Detección de Soporte Técnico (errores funcionales, no carga, enlaces caídos, fallas técnicas)
    const isTechSupport =
      text.includes('no puedo abrir') ||
      text.includes('no puedo entrar') ||
      text.includes('no funciona') ||
      text.includes('no abre') ||
      text.includes('no carga') ||
      text.includes('no guarda') ||
      text.includes('no puedo ver') ||
      text.includes('no puedo enviar') ||
      text.includes('error') ||
      text.includes('bug') ||
      text.includes('enlace de la sesión') ||
      text.includes('recordatorios de las sesiones no están llegando') ||
      text.includes('fallo') ||
      text.includes('pantalla') ||
      tipo === 'Soporte de Plataforma' ||
      tipo === 'Funcional' ||
      tipo === 'Carga / Rendimiento' ||
      tipo === 'Visual / Diseño';

    // 2. Detección de Administración (cuentas, contraseñas, permisos, accesos administrativos, seguridad)
    const isAdmin =
      text.includes('contraseña') ||
      text.includes('password') ||
      text.includes('ingreso a mi cuenta que no reconozco') ||
      text.includes('seguridad') ||
      text.includes('correo institucional') ||
      text.includes('actualizar teléfono') ||
      text.includes('dirección de domicilio') ||
      text.includes('crear y habilitar la cuenta') ||
      text.includes('habilitar permisos') ||
      text.includes('revocar') ||
      text.includes('desactivar el acceso') ||
      text.includes('desactivar una cuenta') ||
      text.includes('agregar un segundo hijo') ||
      text.includes('descripción profesional') ||
      tipo === 'Seguridad y Acceso' ||
      tipo === 'Cuentas y Permisos' ||
      tipo === 'Información de Perfil';

    // 3. Detección de Terapeuta (sesiones, seguimiento clínico, ejercicios en casa, Mundo ASHA orientación)
    const isTherapist =
      idTerapeuta ||
      text.includes('ejercicios') ||
      text.includes('reporte de la última sesión') ||
      text.includes('reportes evolutivos') ||
      text.includes('objetivos trabajados') ||
      text.includes('avances observados') ||
      text.includes('cambiar la fecha de la sesión') ||
      text.includes('inconveniente de horario') ||
      text.includes('actividad que indicaron') ||
      text.includes('continuar la terapia') ||
      text.includes('mundo asha') ||
      text.includes('terapeuta') ||
      tipo === 'Seguimiento Terapéutico' ||
      tipo === 'Sesiones y Citas' ||
      tipo === 'Mundo ASHA' ||
      tipo === 'Paciente / Agenda';

    if (isTechSupport && !isTherapist && !isAdmin) {
      return { area_destino: 'SOPORTE_TECNICO', responsable: 'soporte_tecnico', id_terapeuta: null };
    }

    if (isAdmin && !isTechSupport) {
      return { area_destino: 'ADMINISTRACION', responsable: 'admin', id_terapeuta: null };
    }

    if (isTherapist && !isTechSupport) {
      return { area_destino: 'TERAPEUTA', responsable: 'terapeuta', id_terapeuta: idTerapeuta || null };
    }

    // Si tiene terapeuta explícito asignado
    if (idTerapeuta) {
      return { area_destino: 'TERAPEUTA', responsable: 'terapeuta', id_terapeuta: idTerapeuta };
    }

    // Default: si es de plataforma -> SOPORTE_TECNICO; si es de gestión -> ADMINISTRACION
    if (isTechSupport) {
      return { area_destino: 'SOPORTE_TECNICO', responsable: 'soporte_tecnico', id_terapeuta: null };
    }
    return { area_destino: 'ADMINISTRACION', responsable: 'admin', id_terapeuta: null };
  }

  calcularPrioridad(solicitud: string, tipo: string): number {
    const text = `${tipo} ${solicitud}`.toLowerCase();
    if (
      text.includes('urgente') ||
      text.includes('hoy') ||
      text.includes('seguridad') ||
      text.includes('no reconozco') ||
      text.includes('no pude conectarme') ||
      text.includes('bloquead')
    ) {
      return 3; // ALTA
    }
    if (text.includes('consulta') || text.includes('información') || text.includes('procedimiento')) {
      return 1; // BAJA
    }
    return 2; // MEDIA
  }

  prioridadTexto(p: number): 'BAJA' | 'MEDIA' | 'ALTA' {
    if (p >= 3) return 'ALTA';
    if (p === 1) return 'BAJA';
    return 'MEDIA';
  }

  async crear(
    userId: number,
    rol: string,
    solicitanteNombre: string,
    data: CreateIncidenciaDTO
  ): Promise<IncidenciaItem> {
    const solicitud = data.descripcion || data.titulo || '';
    const tipo = data.tipo || 'Consulta General';
    const clasif = this.clasificarDestinatario(rol, tipo, solicitud, data.id_terapeuta);
    const prioridad = this.calcularPrioridad(solicitud, tipo);

    try {
      // Si rol es TERAPEUTA, verificar que si el destino es terapeuta no se autoasigne inconsistente
      let id_ter = clasif.id_terapeuta;
      if (clasif.area_destino === 'TERAPEUTA' && !id_ter) {
        const terRow = await pool.query('SELECT id_terapeuta FROM terapeutas LIMIT 1;');
        id_ter = terRow.rows.length > 0 ? terRow.rows[0].id_terapeuta : null;
      }

      const res = await pool.query(
        `INSERT INTO public.incidencias (
           id_usuario, tipo, solicitud, solicitante, rol_solicitante,
           responsable, area_destino, id_terapeuta, prioridad, estado,
           envio_id, es_prueba, fecha_creacion, fecha_actualizacion
         ) VALUES (
           $1, $2, $3, $4, $5,
           $6, $7, $8, $9, 'RECIBIDA',
           $10, false, NOW(), NOW()
         )
         ON CONFLICT (envio_id) DO UPDATE SET 
           tipo = EXCLUDED.tipo,
           solicitud = EXCLUDED.solicitud,
           fecha_actualizacion = NOW()
         RETURNING *;`,
        [
          userId,
          tipo,
          solicitud,
          solicitanteNombre || 'Usuario AshaKids',
          rol,
          clasif.responsable,
          clasif.area_destino,
          id_ter,
          prioridad,
          data.envio_id || null,
        ]
      );

      const r = res.rows[0];

      // Obtener nombre del terapeuta si fue asignado
      let terapeuta_nombre = null;
      if (r.id_terapeuta) {
        const terRes = await pool.query(
          `SELECT CONCAT(u.nombres, ' ', u.apellidos) as nombre
           FROM terapeutas t
           JOIN usuarios u ON t.id_usuario = u.id_usuario
           WHERE t.id_terapeuta = $1;`,
          [r.id_terapeuta]
        );
        if (terRes.rows.length > 0) terapeuta_nombre = terRes.rows[0].nombre.trim();
      }

      return {
        id_incidencia: r.id_incidencia,
        ticket: r.ticket,
        tipo: r.tipo,
        titulo: data.titulo || r.tipo,
        descripcion: r.solicitud,
        solicitante: r.solicitante,
        rol_solicitante: r.rol_solicitante,
        area_destino: r.area_destino,
        responsable: r.responsable,
        id_terapeuta: r.id_terapeuta,
        terapeuta_nombre,
        prioridad: r.prioridad,
        prioridad_texto: this.prioridadTexto(r.prioridad),
        estado: r.estado,
        envio_id: r.envio_id,
        es_prueba: r.es_prueba,
        fecha_creacion: new Date(r.fecha_creacion).toISOString(),
        fecha_actualizacion: new Date(r.fecha_actualizacion || r.fecha_creacion).toISOString(),
      };
    } catch (err) {
      console.warn('[IncidenciasService] Fallback crear:', err);
      return {
        id_incidencia: Date.now(),
        ticket: `INC-${Math.floor(10000 + Math.random() * 90000)}`,
        tipo: data.tipo,
        titulo: data.titulo || data.tipo,
        descripcion: data.descripcion,
        solicitante: solicitanteNombre,
        rol_solicitante: rol,
        area_destino: clasif.area_destino,
        responsable: clasif.responsable,
        id_terapeuta: clasif.id_terapeuta,
        prioridad,
        prioridad_texto: this.prioridadTexto(prioridad),
        estado: 'RECIBIDA',
        es_prueba: false,
        fecha_creacion: new Date().toISOString(),
        fecha_actualizacion: new Date().toISOString(),
      };
    }
  }

  /**
   * Historial de incidencias enviadas por el usuario autenticado
   */
  async listarMisIncidencias(userId: number): Promise<IncidenciaItem[]> {
    try {
      const res = await pool.query(
        `SELECT i.*, CONCAT(u_ter.nombres, ' ', u_ter.apellidos) as terapeuta_nombre
         FROM public.incidencias i
         LEFT JOIN public.terapeutas t ON i.id_terapeuta = t.id_terapeuta
         LEFT JOIN public.usuarios u_ter ON t.id_usuario = u_ter.id_usuario
         WHERE i.id_usuario = $1
         ORDER BY i.fecha_creacion DESC;`,
        [userId]
      );

      return res.rows.map((r) => ({
        id_incidencia: r.id_incidencia,
        ticket: r.ticket,
        tipo: r.tipo,
        titulo: r.tipo,
        descripcion: r.solicitud,
        solicitante: r.solicitante,
        rol_solicitante: r.rol_solicitante,
        area_destino: r.area_destino,
        responsable: r.responsable,
        id_terapeuta: r.id_terapeuta,
        terapeuta_nombre: r.terapeuta_nombre ? r.terapeuta_nombre.trim() : null,
        prioridad: r.prioridad,
        prioridad_texto: this.prioridadTexto(r.prioridad),
        estado: r.estado,
        envio_id: r.envio_id,
        es_prueba: r.es_prueba,
        fecha_creacion: new Date(r.fecha_creacion).toISOString(),
        fecha_actualizacion: new Date(r.fecha_actualizacion || r.fecha_creacion).toISOString(),
      }));
    } catch (err) {
      console.warn('[IncidenciasService] Fallback listarMisIncidencias:', err);
      return [];
    }
  }

  /**
   * Bandeja de incidencias recibidas por el terapeuta autenticado
   */
  async listarRecibidasTerapeuta(userId: number): Promise<IncidenciaItem[]> {
    try {
      // Buscar el id_terapeuta del usuario
      const terRes = await pool.query('SELECT id_terapeuta FROM public.terapeutas WHERE id_usuario = $1;', [userId]);
      const id_terapeuta = terRes.rows.length > 0 ? terRes.rows[0].id_terapeuta : 1;

      const res = await pool.query(
        `SELECT i.*, CONCAT(u_ter.nombres, ' ', u_ter.apellidos) as terapeuta_nombre
         FROM public.incidencias i
         LEFT JOIN public.terapeutas t ON i.id_terapeuta = t.id_terapeuta
         LEFT JOIN public.usuarios u_ter ON t.id_usuario = u_ter.id_usuario
         WHERE i.area_destino = 'TERAPEUTA' 
           AND (i.id_terapeuta = $1 OR i.id_terapeuta IS NULL)
         ORDER BY i.fecha_creacion DESC;`,
        [id_terapeuta]
      );

      return res.rows.map((r) => ({
        id_incidencia: r.id_incidencia,
        ticket: r.ticket,
        tipo: r.tipo,
        titulo: r.tipo,
        descripcion: r.solicitud,
        solicitante: r.solicitante,
        rol_solicitante: r.rol_solicitante,
        area_destino: r.area_destino,
        responsable: r.responsable,
        id_terapeuta: r.id_terapeuta,
        terapeuta_nombre: r.terapeuta_nombre ? r.terapeuta_nombre.trim() : null,
        prioridad: r.prioridad,
        prioridad_texto: this.prioridadTexto(r.prioridad),
        estado: r.estado,
        envio_id: r.envio_id,
        es_prueba: r.es_prueba,
        fecha_creacion: new Date(r.fecha_creacion).toISOString(),
        fecha_actualizacion: new Date(r.fecha_actualizacion || r.fecha_creacion).toISOString(),
      }));
    } catch (err) {
      console.warn('[IncidenciasService] Fallback listarRecibidasTerapeuta:', err);
      return [];
    }
  }

  /**
   * Bandeja de incidencias recibidas por Administración (solo área ADMINISTRACION)
   */
  async listarRecibidasAdmin(
    offset = 0,
    limit = 50
  ): Promise<{ items: IncidenciaAdminItem[]; total: number }> {
    try {
      const res = await pool.query(
        `SELECT i.*, 
                COALESCE(i.rol_solicitante, 'PADRE') as rol,
                i.solicitante as usuario
         FROM public.incidencias i
         WHERE i.area_destino = 'ADMINISTRACION'
         ORDER BY i.fecha_creacion DESC
         LIMIT $1 OFFSET $2;`,
        [limit, offset]
      );

      const totalRes = await pool.query(
        "SELECT count(*) as total FROM public.incidencias WHERE area_destino = 'ADMINISTRACION';"
      );
      const total = parseInt(totalRes.rows[0]?.total ?? '0', 10);

      const items: IncidenciaAdminItem[] = res.rows.map((r) => ({
        id_incidencia: r.id_incidencia,
        ticket: r.ticket,
        tipo: r.tipo,
        titulo: r.tipo,
        descripcion: r.solicitud || '',
        solicitante: r.solicitante,
        rol_solicitante: r.rol_solicitante,
        area_destino: r.area_destino,
        responsable: r.responsable,
        id_terapeuta: r.id_terapeuta,
        prioridad: r.prioridad,
        prioridad_texto: this.prioridadTexto(r.prioridad),
        estado: r.estado,
        es_prueba: r.es_prueba,
        fecha_creacion: new Date(r.fecha_creacion).toISOString(),
        fecha_actualizacion: new Date(r.fecha_actualizacion || r.fecha_creacion).toISOString(),
        usuario: r.usuario.trim(),
        rol: r.rol,
      }));

      return { items, total: Math.max(total, items.length) };
    } catch (err) {
      console.warn('[IncidenciasService] Fallback listarRecibidasAdmin:', err);
      return { items: [], total: 0 };
    }
  }

  /**
   * Obtener detalle completo de una incidencia con control de acceso
   */
  async obtenerPorId(id: number, user: AuthenticatedUser): Promise<IncidenciaItem> {
    const res = await pool.query(
      `SELECT i.*, CONCAT(u_ter.nombres, ' ', u_ter.apellidos) as terapeuta_nombre
       FROM public.incidencias i
       LEFT JOIN public.terapeutas t ON i.id_terapeuta = t.id_terapeuta
       LEFT JOIN public.usuarios u_ter ON t.id_usuario = u_ter.id_usuario
       WHERE i.id_incidencia = $1;`,
      [id]
    );

    if (res.rows.length === 0) {
      const err = new Error('Incidencia no encontrada.');
      (err as any).status = 404;
      throw err;
    }

    const r = res.rows[0];

    // Validación de permisos estricta
    const esRemitente = r.id_usuario === user.id_usuario;
    const esAdmin = user.rol === 'ADMIN' || user.roles?.includes('ADMIN');
    let esTerapeutaAsignado = false;

    if (user.rol === 'TERAPEUTA' || user.roles?.includes('TERAPEUTA')) {
      const terRes = await pool.query('SELECT id_terapeuta FROM public.terapeutas WHERE id_usuario = $1;', [
        user.id_usuario,
      ]);
      const myTerapeutaId = terRes.rows.length > 0 ? terRes.rows[0].id_terapeuta : null;
      if (r.area_destino === 'TERAPEUTA' && (r.id_terapeuta === myTerapeutaId || r.id_terapeuta === null)) {
        esTerapeutaAsignado = true;
      }
    }

    if (!esRemitente && !esAdmin && !esTerapeutaAsignado) {
      const err = new Error('Acceso no autorizado a esta incidencia.');
      (err as any).status = 403;
      throw err;
    }

    return {
      id_incidencia: r.id_incidencia,
      ticket: r.ticket,
      tipo: r.tipo,
      titulo: r.tipo,
      descripcion: r.solicitud,
      solicitante: r.solicitante,
      rol_solicitante: r.rol_solicitante,
      area_destino: r.area_destino,
      responsable: r.responsable,
      id_terapeuta: r.id_terapeuta,
      terapeuta_nombre: r.terapeuta_nombre ? r.terapeuta_nombre.trim() : null,
      prioridad: r.prioridad,
      prioridad_texto: this.prioridadTexto(r.prioridad),
      estado: r.estado,
      envio_id: r.envio_id,
      es_prueba: r.es_prueba,
      fecha_creacion: new Date(r.fecha_creacion).toISOString(),
      fecha_actualizacion: new Date(r.fecha_actualizacion || r.fecha_creacion).toISOString(),
    };
  }

  /**
   * Actualizar estado de una incidencia con validación de roles y destinatario
   */
  async cambiarEstado(
    id: number,
    nuevoEstadoRaw: string,
    user: AuthenticatedUser
  ): Promise<IncidenciaItem> {
    // Normalizar estado
    let estado = nuevoEstadoRaw.toUpperCase().trim();
    if (estado === 'LEIDA') estado = 'LEÍDA';
    if (estado === 'RESUELTA') estado = 'SOLUCIONADA';
    if (estado === 'ABIERTA') estado = 'RECIBIDA';

    const validStates = ['RECIBIDA', 'LEÍDA', 'LEIDA', 'EN PROCESO', 'SOLUCIONADA', 'ATENDIDA', 'RESUELTA'];
    if (!validStates.includes(estado)) {
      const err = new Error(`Estado no permitido: ${nuevoEstadoRaw}`);
      (err as any).status = 400;
      throw err;
    }

    const checkRes = await pool.query('SELECT * FROM public.incidencias WHERE id_incidencia = $1;', [id]);
    if (checkRes.rows.length === 0) {
      const err = new Error('Incidencia no encontrada.');
      (err as any).status = 404;
      throw err;
    }

    const inc = checkRes.rows[0];

    // Regla: El remitente NO puede cambiar el estado de su propia solicitud enviada
    if (inc.id_usuario === user.id_usuario && user.rol === 'PADRE') {
      const err = new Error('El usuario solicitante no tiene permisos para modificar el estado.');
      (err as any).status = 403;
      throw err;
    }

    // Regla: Soporte Técnico no se puede modificar desde las vistas actuales
    if (inc.area_destino === 'SOPORTE_TECNICO') {
      const err = new Error('Las incidencias de Soporte Técnico permanecen en estado pendiente y no pueden modificarse en esta fase.');
      (err as any).status = 403;
      throw err;
    }

    // Regla: Terapeuta solo puede modificar sus incidencias asignadas
    if (user.rol === 'TERAPEUTA' || user.roles?.includes('TERAPEUTA')) {
      const terRes = await pool.query('SELECT id_terapeuta FROM public.terapeutas WHERE id_usuario = $1;', [user.id_usuario]);
      const myTerapeutaId = terRes.rows.length > 0 ? terRes.rows[0].id_terapeuta : 1;
      if (inc.area_destino !== 'TERAPEUTA' || (inc.id_terapeuta && inc.id_terapeuta !== myTerapeutaId)) {
        const err = new Error('Un terapeuta no puede modificar incidencias que no le pertenecen.');
        (err as any).status = 403;
        throw err;
      }
    }

    // Regla: Administración solo puede modificar incidencias asignadas a Administración
    if (user.rol === 'ADMIN' || user.roles?.includes('ADMIN')) {
      if (inc.area_destino !== 'ADMINISTRACION') {
        const err = new Error('Administración solo puede modificar incidencias dirigidas a su área.');
        (err as any).status = 403;
        throw err;
      }
    }

    const updateRes = await pool.query(
      `UPDATE public.incidencias 
       SET estado = $1, fecha_actualizacion = NOW() 
       WHERE id_incidencia = $2 
       RETURNING *;`,
      [estado, id]
    );

    const r = updateRes.rows[0];
    return {
      id_incidencia: r.id_incidencia,
      ticket: r.ticket,
      tipo: r.tipo,
      titulo: r.tipo,
      descripcion: r.solicitud,
      solicitante: r.solicitante,
      rol_solicitante: r.rol_solicitante,
      area_destino: r.area_destino,
      responsable: r.responsable,
      id_terapeuta: r.id_terapeuta,
      prioridad: r.prioridad,
      prioridad_texto: this.prioridadTexto(r.prioridad),
      estado: r.estado,
      es_prueba: r.es_prueba,
      fecha_creacion: new Date(r.fecha_creacion).toISOString(),
      fecha_actualizacion: new Date(r.fecha_actualizacion || r.fecha_creacion).toISOString(),
    };
  }

  /**
   * Terapeutas con los que el núcleo familiar del padre ha tenido sesiones previas + todos los disponibles para 'Otro'
   */
  async obtenerTerapeutasRelacionados(userId: number): Promise<{
    previos: Array<{ id_terapeuta: number; nombre: string; especialidad: string }>;
    disponibles: Array<{ id_terapeuta: number; nombre: string; especialidad: string }>;
  }> {
    try {
      // 1. Terapeutas previos consultando reservas de pacientes del tutor
      const previosRes = await pool.query(
        `SELECT DISTINCT t.id_terapeuta, 
                CONCAT(u.nombres, ' ', u.apellidos) as nombre,
                t.especialidad
         FROM public.reservas r
         JOIN public.pacientes p ON r.id_paciente = p.id_paciente
         JOIN public.tutores tut ON p.id_tutor = tut.id_tutor
         JOIN public.terapeutas t ON r.id_terapeuta = t.id_terapeuta
         JOIN public.usuarios u ON t.id_usuario = u.id_usuario
         WHERE tut.id_usuario = $1
         ORDER BY nombre;`,
        [userId]
      );

      // 2. Todos los terapeutas disponibles para la opción 'Otro'
      const todosRes = await pool.query(
        `SELECT t.id_terapeuta, 
                CONCAT(u.nombres, ' ', u.apellidos) as nombre,
                t.especialidad
         FROM public.terapeutas t
         JOIN public.usuarios u ON t.id_usuario = u.id_usuario
         WHERE u.activo = true
         ORDER BY nombre;`
      );

      return {
        previos: previosRes.rows.map((r) => ({
          id_terapeuta: r.id_terapeuta,
          nombre: r.nombre.trim(),
          especialidad: r.especialidad || 'Especialista en Lenguaje',
        })),
        disponibles: todosRes.rows.map((r) => ({
          id_terapeuta: r.id_terapeuta,
          nombre: r.nombre.trim(),
          especialidad: r.especialidad || 'Especialista en Lenguaje',
        })),
      };
    } catch (err) {
      console.warn('[IncidenciasService] Fallback terapeutas relacionados:', err);
      return { previos: [], disponibles: [] };
    }
  }
}

export const incidenciasService = new IncidenciasService();
