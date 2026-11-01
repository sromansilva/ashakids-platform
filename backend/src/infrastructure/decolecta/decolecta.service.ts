import { settings } from '../../core/config.js';

export interface DniConsultaResult {
  numero: string;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  apellidos: string;
  nombreCompleto: string;
  fuente: 'DECOLECTA_RENIEC' | 'MOCK_DESARROLLO';
}

export interface DecolectaResponse {
  success: boolean;
  data?: DniConsultaResult;
  message?: string;
}

export interface RucConsultaResult {
  numero: string;
  razonSocial: string;
  estado: string;
  condicion: string;
  direccion: string;
  departamento: string;
  provincia: string;
  distrito: string;
  direccionCompleta: string;
  fuente: 'DECOLECTA_SUNAT' | 'MOCK_DESARROLLO';
}

export interface DecolectaRucResponse {
  success: boolean;
  data?: RucConsultaResult;
  message?: string;
}

function toTitleCase(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export class DecolectaService {
  /**
   * Determina si el servicio de Decolecta cuenta con un token configurado.
   */
  static isConfigured(): boolean {
    return Boolean(settings.DECOLECTA_TOKEN && settings.DECOLECTA_TOKEN.trim().length > 0);
  }

  /**
   * Consulta los datos de una persona por su número de DNI (8 dígitos).
   */
  static async consultarDni(numero: string): Promise<DecolectaResponse> {
    const cleanDni = String(numero || '').trim();

    if (!/^\d{8}$/.test(cleanDni)) {
      return {
        success: false,
        message: 'El número de DNI debe contener exactamente 8 dígitos numéricos.',
      };
    }

    if (!this.isConfigured()) {
      return this.mockConsultaDni(cleanDni);
    }

    try {
      const baseUrl = (settings.DECOLECTA_API_URL || 'https://api.decolecta.com').replace(/\/+$/, '');
      const url = `${baseUrl}/v1/reniec/dni?numero=${encodeURIComponent(cleanDni)}`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const res = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${settings.DECOLECTA_TOKEN.trim()}`,
          Accept: 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (res.status === 404) {
        return {
          success: false,
          message: 'El número de DNI no se encuentra registrado en el padrón de RENIEC.',
        };
      }

      if (res.status === 401 || res.status === 403) {
        console.warn('[DecolectaService] Error de autenticación con Decolecta:', res.status);
        return {
          success: false,
          message: 'El servicio de consulta RENIEC no está autorizado con las credenciales actuales.',
        };
      }

      if (!res.ok) {
        const errorText = await res.text().catch(() => '');
        console.warn(`[DecolectaService] Error HTTP ${res.status}:`, errorText);
        return {
          success: false,
          message: 'Ocurrió un inconveniente al consultar RENIEC. Inténtalo de nuevo o ingresa los datos manualmente.',
        };
      }

      const body = (await res.json()) as {
        numero?: string;
        document_number?: string;
        nombres?: string;
        first_name?: string;
        apellidoPaterno?: string;
        apellidoMaterno?: string;
        first_last_name?: string;
        second_last_name?: string;
        last_name?: string;
        full_name?: string;
        [key: string]: unknown;
      };

      const rawNombres = String(body.first_name || body.nombres || '').trim();
      let rawPaterno = String(body.first_last_name || body.apellidoPaterno || '').trim();
      let rawMaterno = String(body.second_last_name || body.apellidoMaterno || '').trim();

      if (!rawPaterno && body.last_name) {
        const parts = String(body.last_name).trim().split(/\s+/);
        rawPaterno = parts[0] || '';
        rawMaterno = parts.slice(1).join(' ') || '';
      }

      const nombres = toTitleCase(rawNombres);
      const apellidoPaterno = toTitleCase(rawPaterno);
      const apellidoMaterno = toTitleCase(rawMaterno);
      const apellidos = `${apellidoPaterno} ${apellidoMaterno}`.trim();
      const nombreCompleto = `${nombres} ${apellidos}`.trim();

      if (!nombres && !apellidos) {
        return {
          success: false,
          message: 'La respuesta de RENIEC no contiene nombres válidos para este documento.',
        };
      }

      return {
        success: true,
        data: {
          numero: cleanDni,
          nombres,
          apellidoPaterno,
          apellidoMaterno,
          apellidos,
          nombreCompleto,
          fuente: 'DECOLECTA_RENIEC',
        },
      };
    } catch (err: unknown) {
      const isAbort = err instanceof Error && err.name === 'AbortError';
      console.warn('[DecolectaService] Excepción consultando DNI:', isAbort ? 'Timeout' : err);
      return {
        success: false,
        message: isAbort
          ? 'El servicio de RENIEC tardó demasiado en responder. Por favor ingresa los datos manualmente.'
          : 'No se pudo conectar con el servicio de RENIEC en este momento.',
      };
    }
  }

  /**
   * Consulta los datos fiscales de una persona o empresa por su número de RUC (11 dígitos).
   */
  static async consultarRuc(numero: string): Promise<DecolectaRucResponse> {
    const cleanRuc = String(numero || '').trim();

    if (!/^\d{11}$/.test(cleanRuc)) {
      return {
        success: false,
        message: 'El número de RUC debe contener exactamente 11 dígitos numéricos.',
      };
    }

    if (!this.isConfigured()) {
      return this.mockConsultaRuc(cleanRuc);
    }

    try {
      const baseUrl = (settings.DECOLECTA_API_URL || 'https://api.decolecta.com').replace(/\/+$/, '');
      const url = `${baseUrl}/v1/sunat/ruc?numero=${encodeURIComponent(cleanRuc)}`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const res = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${settings.DECOLECTA_TOKEN.trim()}`,
          Accept: 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (res.status === 404) {
        return {
          success: false,
          message: 'El número de RUC no se encuentra registrado en el padrón de la SUNAT.',
        };
      }

      if (res.status === 401 || res.status === 403) {
        console.warn('[DecolectaService] Error de autenticación SUNAT con Decolecta:', res.status);
        return {
          success: false,
          message: 'El servicio de consulta SUNAT no está autorizado con las credenciales actuales.',
        };
      }

      if (!res.ok) {
        return {
          success: false,
          message: 'Ocurrió un inconveniente al consultar SUNAT. Inténtalo de nuevo o ingresa los datos manualmente.',
        };
      }

      const body = (await res.json()) as {
        numero_documento?: string;
        numero?: string;
        razon_social?: string;
        estado?: string;
        condicion?: string;
        direccion?: string;
        distrito?: string;
        provincia?: string;
        departamento?: string;
        [key: string]: unknown;
      };

      const razonSocial = toTitleCase(String(body.razon_social || '').trim());
      const estado = String(body.estado || 'ACTIVO').trim().toUpperCase();
      const condicion = String(body.condicion || 'HABIDO').trim().toUpperCase();
      const direccion = String(body.direccion || '').trim();
      const distrito = toTitleCase(String(body.distrito || '').trim());
      const provincia = toTitleCase(String(body.provincia || '').trim());
      const departamento = toTitleCase(String(body.departamento || '').trim());

      const ubigeoPart = [distrito, provincia, departamento].filter(Boolean).join(', ');
      const direccionCompleta = [direccion, ubigeoPart].filter(Boolean).join(' - ');

      if (!razonSocial) {
        return {
          success: false,
          message: 'La respuesta de SUNAT no contiene una razón social válida para este RUC.',
        };
      }

      return {
        success: true,
        data: {
          numero: cleanRuc,
          razonSocial,
          estado,
          condicion,
          direccion,
          departamento,
          provincia,
          distrito,
          direccionCompleta,
          fuente: 'DECOLECTA_SUNAT',
        },
      };
    } catch (err: unknown) {
      const isAbort = err instanceof Error && err.name === 'AbortError';
      console.warn('[DecolectaService] Excepción consultando RUC:', isAbort ? 'Timeout' : err);
      return {
        success: false,
        message: isAbort
          ? 'El servicio de SUNAT tardó demasiado en responder. Por favor ingresa los datos manualmente.'
          : 'No se pudo conectar con el servicio de SUNAT en este momento.',
      };
    }
  }

  /**
   * Respuesta de simulación para DNI cuando no se ha configurado token.
   */
  private static mockConsultaDni(dni: string): DecolectaResponse {
    const nombresDemo = ['Carlos Alberto', 'María Elena', 'José Luis', 'Ana Sofía', 'Diego Alejandro', 'Lucía Fernanda'];
    const apellidosDemo = ['Sánchez Mendoza', 'Gómez Flores', 'Quispe Huamán', 'Román Silva', 'Castillo Vargas', 'Torres Reyes'];

    const index = parseInt(dni.slice(-2), 10) || 0;
    const nombres = nombresDemo[index % nombresDemo.length];
    const apellidos = apellidosDemo[index % apellidosDemo.length];
    const parts = apellidos.split(' ');

    return {
      success: true,
      data: {
        numero: dni,
        nombres,
        apellidoPaterno: parts[0] || '',
        apellidoMaterno: parts[1] || '',
        apellidos,
        nombreCompleto: `${nombres} ${apellidos}`,
        fuente: 'MOCK_DESARROLLO',
      },
    };
  }

  /**
   * Respuesta de simulación para RUC cuando no se ha configurado token.
   */
  private static mockConsultaRuc(ruc: string): DecolectaRucResponse {
    const empresasDemo = [
      'Clínica Pediátrica San José S.A.C.',
      'Centro Fonoaudiológico Integral E.I.R.L.',
      'Servicios de Salud Infantil del Perú S.A.',
      'Consultoría Terapéutica Familiar S.A.C.',
    ];
    const index = parseInt(ruc.slice(-2), 10) || 0;
    const razonSocial = empresasDemo[index % empresasDemo.length];

    return {
      success: true,
      data: {
        numero: ruc,
        razonSocial,
        estado: 'ACTIVO',
        condicion: 'HABIDO',
        direccion: 'Av. Javier Prado Este 1234',
        departamento: 'Lima',
        provincia: 'Lima',
        distrito: 'San Isidro',
        direccionCompleta: 'Av. Javier Prado Este 1234 - San Isidro, Lima, Lima',
        fuente: 'MOCK_DESARROLLO',
      },
    };
  }
}
