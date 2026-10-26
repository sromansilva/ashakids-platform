import { Router } from 'express';
import { newsletterService } from './newsletter.service.js';
import { newsletterSubscriptionSchema } from './newsletter.dto.js';
import { settings } from '../../core/config.js';

export const newsletterRouter = Router();

newsletterRouter.post('/suscripciones', async (req, res, next) => {
  try {
    const { email } = newsletterSubscriptionSchema.parse(req.body);
    const result = await newsletterService.subscribe(email);
    res.status(202).json(result);
  } catch (err) {
    next(err);
  }
});

newsletterRouter.get('/confirmar', async (req, res, next) => {
  try {
    const token = String(req.query.token ?? '');
    const ok = await newsletterService.confirm(token);
    const origin = (settings.CORS_ORIGINS[0] || 'http://127.0.0.1:5174').replace(/\/+$/, '');
    res.redirect(`${origin}/?newsletter=${ok ? 'confirmada' : 'invalida'}`);
  } catch (err) {
    next(err);
  }
});

newsletterRouter.get('/baja', async (req, res, next) => {
  try {
    const token = String(req.query.token ?? '');
    const ok = await newsletterService.unsubscribe(token);
    const origin = (settings.CORS_ORIGINS[0] || 'http://127.0.0.1:5174').replace(/\/+$/, '');
    res.redirect(`${origin}/?newsletter=${ok ? 'baja' : 'invalida'}`);
  } catch (err) {
    next(err);
  }
});
