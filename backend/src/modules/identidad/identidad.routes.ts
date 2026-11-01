import { Router, Request, Response } from 'express';
import { DecolectaService } from '../../infrastructure/decolecta/decolecta.service.js';

export const identidadRouter = Router();

/**
 * GET /api/v1/identidad/dni/:numero
 * Consulta los datos de RENIEC a través de Decolecta para autocompletar formularios.
 */
identidadRouter.get('/dni/:numero', async (req: Request, res: Response) => {
  const numero = String(req.params.numero || '').trim();

  if (!numero || !/^\d{8}$/.test(numero)) {
    res.status(400).json({
      success: false,
      message: 'El número de DNI debe contener exactamente 8 dígitos numéricos.',
    });
    return;
  }

  const result = await DecolectaService.consultarDni(numero);

  if (!result.success) {
    res.status(422).json(result);
    return;
  }

  res.json(result);
});

/**
 * GET /api/v1/identidad/ruc/:numero
 * Consulta los datos fiscales de SUNAT a través de Decolecta para facturación y terapeutas.
 */
identidadRouter.get('/ruc/:numero', async (req: Request, res: Response) => {
  const numero = String(req.params.numero || '').trim();

  if (!numero || !/^\d{11}$/.test(numero)) {
    res.status(400).json({
      success: false,
      message: 'El número de RUC debe contener exactamente 11 dígitos numéricos.',
    });
    return;
  }

  const result = await DecolectaService.consultarRuc(numero);

  if (!result.success) {
    res.status(422).json(result);
    return;
  }

  res.json(result);
});
