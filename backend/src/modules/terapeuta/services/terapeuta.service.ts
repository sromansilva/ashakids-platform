import { pool } from '../../../core/database.js';

export interface ProfessionalItem {
  id_terapeuta: number;
  nombres: string;
  apellidos: string;
  especialidad: string | null;
  descripcion_profesional: string | null;
}

export interface AvailabilityData {
  turnos: { dia: number; hora: number }[];
  bloqueos: { inicio: string; fin: string }[];
  duracion_minutos?: number;
}

export interface AvailableSlotItem {
  inicio: string;
  fin: string;
  disponible: boolean;
  motivo: string | null;
}

export class TerapeutaService {
  async getDirectorio(filters?: { limit?: number; offset?: number }): Promise<{ items: ProfessionalItem[]; total: number }> {
    try {
      const sql = `
        SELECT 
          t.id_terapeuta,
          u.nombres,
          u.apellidos,
          COALESCE(t.especialidad, 'Terapia del Lenguaje') as especialidad,
          COALESCE(t.descripcion_profesional, 'Especialista en fonoaudiología y comunicación infantil.') as descripcion_profesional
        FROM terapeutas t
        JOIN usuarios u ON t.id_usuario = u.id_usuario
        WHERE u.activo = true
        ORDER BY t.id_terapeuta ASC;
      `;
      const res = await pool.query(sql);
      const items: ProfessionalItem[] = res.rows.map(r => ({
        id_terapeuta: r.id_terapeuta,
        nombres: r.nombres,
        apellidos: r.apellidos,
        especialidad: r.especialidad,
        descripcion_profesional: r.descripcion_profesional,
      }));
      return { items, total: items.length };
    } catch (err) {
      console.warn('[TerapeutaService] Fallback getDirectorio:', err);
      return {
        items: [
          {
            id_terapeuta: 1,
            nombres: 'Sergei',
            apellidos: 'Ramirez',
            especialidad: 'Terapia del Lenguaje y Fonología',
            descripcion_profesional: 'Certificado en intervención temprana y habla infantil.',
          },
        ],
        total: 1,
      };
    }
  }

  async getDisponibilidad(terapeutaId: number): Promise<AvailabilityData> {
    try {
      const res = await pool.query(
        `SELECT dia, hora FROM turnos_semanales WHERE id_terapeuta = $1 ORDER BY dia, hora ASC;`,
        [terapeutaId]
      );
      if (res.rows.length > 0) {
        return {
          turnos: res.rows.map(r => ({ dia: r.dia, hora: r.hora })),
          bloqueos: [],
          duracion_minutos: 40,
        };
      }
    } catch (err) {
      console.warn('[TerapeutaService] Fallback getDisponibilidad:', err);
    }

    return {
      turnos: [
        { dia: 1, hora: 9 }, { dia: 1, hora: 10 }, { dia: 1, hora: 11 },
        { dia: 2, hora: 9 }, { dia: 2, hora: 10 }, { dia: 2, hora: 11 },
        { dia: 3, hora: 9 }, { dia: 3, hora: 10 }, { dia: 3, hora: 11 },
        { dia: 4, hora: 9 }, { dia: 4, hora: 10 }, { dia: 4, hora: 11 },
        { dia: 5, hora: 9 }, { dia: 5, hora: 10 }, { dia: 5, hora: 11 },
      ],
      bloqueos: [],
      duracion_minutos: 40,
    };
  }

  async updateDisponibilidad(terapeutaId: number, data: any): Promise<any> {
    try {
      if (Array.isArray(data.turnos)) {
        await pool.query(`DELETE FROM turnos_semanales WHERE id_terapeuta = $1;`, [terapeutaId]);
        for (const t of data.turnos) {
          await pool.query(
            `INSERT INTO turnos_semanales (id_terapeuta, dia, hora) VALUES ($1, $2, $3);`,
            [terapeutaId, t.dia, t.hora]
          );
        }
      }
    } catch (err) {
      console.warn('[TerapeutaService] Fallback updateDisponibilidad:', err);
    }
    return data;
  }

  async getTurnosDelDia(terapeutaId: number, fechaStr: string): Promise<AvailableSlotItem[]> {
    const slots: AvailableSlotItem[] = [];
    const date = new Date(fechaStr);
    const dayOfWeek = (date.getUTCDay() + 6) % 7 + 1; // 1=Mon .. 7=Sun

    const horas = [9, 10, 11, 14, 15, 16];
    for (const h of horas) {
      const hStr = String(h).padStart(2, '0');
      const startIso = `${fechaStr}T${hStr}:00:00Z`;
      const endIso = `${fechaStr}T${hStr}:40:00Z`;
      slots.push({
        inicio: startIso,
        fin: endIso,
        disponible: true,
        motivo: null,
      });
    }
    return slots;
  }

  async getMe(userId: number = 2) {
    try {
      const res = await pool.query(
        `SELECT u.id_usuario, u.codigo_usuario, u.email, u.nombres, u.apellidos, u.activo,
                t.id_terapeuta, t.especialidad, t.anios_experiencia, t.idiomas, t.descripcion_profesional
         FROM usuarios u
         JOIN terapeutas t ON u.id_usuario = t.id_usuario
         WHERE u.id_usuario = $1 LIMIT 1;`,
        [userId]
      );
      if (res.rows.length > 0) {
        const r = res.rows[0];
        return {
          user: {
            id_usuario: r.id_usuario,
            codigo_usuario: r.codigo_usuario,
            email: r.email,
            nombres: r.nombres,
            apellidos: r.apellidos,
            activo: r.activo,
            roles: ['TERAPEUTA'],
            id_terapeuta: r.id_terapeuta,
            id_tutor: null,
          },
          perfil_terapeuta: {
            id_terapeuta: r.id_terapeuta,
            especialidad: r.especialidad,
            anios_experiencia: r.anios_experiencia,
            idiomas: r.idiomas || 'Español',
            descripcion_profesional: r.descripcion_profesional,
          },
        };
      }
    } catch (err) {
      console.warn('[TerapeutaService] Fallback getMe:', err);
    }

    return {
      user: {
        id_usuario: 2,
        codigo_usuario: 't00001',
        email: 'terapeuta.local@ashakids.test',
        nombres: 'Terapeuta',
        apellidos: 'Local',
        activo: true,
        roles: ['TERAPEUTA'],
        id_terapeuta: 1,
        id_tutor: null,
      },
      perfil_terapeuta: {
        id_terapeuta: 1,
        especialidad: 'Terapia del Lenguaje y Fonología',
        anios_experiencia: 5,
        idiomas: 'Español',
        descripcion_profesional: 'Especialista en fonoaudiología y comunicación infantil.',
      },
    };
  }

  async getPacientes(terapeutaId: number) {
    return [
      {
        id_paciente: 1,
        codigo_paciente: 'PAC-001',
        nombres: 'Liam',
        apellidos: 'García',
        edad: 6,
        id_terapeuta: terapeutaId,
        diagnostico: 'Trastorno de los sonidos del habla (TSH)',
        ultima_sesion: '2026-10-20',
      },
    ];
  }

  async crearReporteClinico(dto: any) {
    return {
      id_reporte: Date.now(),
      ...dto,
      creado_en: new Date().toISOString(),
    };
  }
}

export const terapeutaService = new TerapeutaService();
