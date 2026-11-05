import type { RequestHandler } from 'express';

/** Support is a separate, restricted workspace, even for accidentally mixed-role accounts. */
export const restrictSupportAccess: RequestHandler = (req, res, next) => {
  if (req.user?.roles.includes('SOPORTE_TECNICO') || req.user?.rol === 'SOPORTE_TECNICO') {
    if (!/^\/(?:soporte(?:\/|$)|auth(?:\/|$)|health\/?$)/.test(req.path)) {
      res.status(403).json({ error: 'Soporte Técnico solo tiene acceso a la atención de incidencias técnicas.' });
      return;
    }
  }
  next();
};
