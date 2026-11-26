/**
 * Funciones de sanitización y enmascaramiento de datos personales (PII) para logs y auditoría.
 */

/**
 * Enmascara una dirección de correo electrónico en formato seguro:
 * ej. maria@gmail.com -> ma***@gmail.com, ab@x.org -> a***@x.org.
 */
export function maskEmail(email: string): string {
  const [local = '', domain = ''] = email.trim().toLowerCase().split('@');
  if (!domain) return '***';
  const visible = local.length <= 2 ? local.slice(0, 1) : local.slice(0, 2);
  return `${visible}***@${domain}`;
}
