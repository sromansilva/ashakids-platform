import { Router, Request, Response, NextFunction } from 'express';
import { juegosService } from './juegos.service.js';

export const juegosRouter = Router();

// GET /api/v1/juegos/catalogo
juegosRouter.get('/catalogo', (_req: Request, res: Response) => {
  const catalogo = juegosService.getCatalogoPublico();
  res.json(catalogo);
});

// GET /api/v1/pacientes/:key/juegos
export async function getProgresoJuegos(req: Request, res: Response, next: NextFunction) {
  try {
    const key = parseInt(String(req.params.key), 10);
    const progreso = await juegosService.getProgresoPaciente(key);
    res.json(progreso);
  } catch (err) {
    next(err);
  }
}

// POST /api/v1/pacientes/:key/juegos/:world/intentos
export async function registrarIntentoJuegos(req: Request, res: Response, next: NextFunction) {
  try {
    const key = parseInt(String(req.params.key), 10);
    const world = String(req.params.world).toUpperCase();
    const resultado = await juegosService.registrarIntento(key, world, req.body);
    res.json(resultado);
  } catch (err) {
    next(err);
  }
}
