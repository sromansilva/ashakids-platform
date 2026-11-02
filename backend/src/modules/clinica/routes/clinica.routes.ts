import { Router } from 'express';
import { clinicaController } from '../controllers/clinica.controller.js';
import { authenticate, requireRoles } from '../../../core/middleware/auth.middleware.js';

export const clinicaRouter = Router();

clinicaRouter.use(authenticate);

// The ML service is internal to the backend network. Administration can inspect
// health without exposing its container address to browsers.
clinicaRouter.get('/ml/health', requireRoles(['ADMIN']), (req, res, next) =>
  clinicaController.getMlServiceHealth(req, res, next)
);

// Sesiones y valoraciones
clinicaRouter.get('/sesiones', (req, res, next) => clinicaController.getSesiones(req, res, next));
clinicaRouter.post('/sesiones', requireRoles(['ADMIN', 'TERAPEUTA']), (req, res, next) =>
  clinicaController.crearSesion(req, res, next)
);
clinicaRouter.post('/valoraciones', requireRoles(['ADMIN', 'TERAPEUTA']), (req, res, next) =>
  clinicaController.crearValoracion(req, res, next)
);

// Consentimientos Informados para IA (Ley 29733 / HIPAA)
clinicaRouter.get('/consentimientos/:id_paciente', (req, res, next) =>
  clinicaController.getConsentimiento(req, res, next)
);
clinicaRouter.post('/consentimientos', requireRoles(['ADMIN', 'PADRE']), (req, res, next) =>
  clinicaController.registrarConsentimiento(req, res, next)
);

// Predicción Asistida de Tratamiento (Machine Learning / Random Forest)
clinicaRouter.get('/tratamientos/predictor-catalog', requireRoles(['ADMIN', 'TERAPEUTA']), (req, res, next) =>
  clinicaController.getTreatmentPredictionCatalog(req, res, next)
);
clinicaRouter.post('/tratamientos/predecir-plan', requireRoles(['ADMIN', 'TERAPEUTA']), (req, res, next) =>
  clinicaController.predecirPlanTratamiento(req, res, next)
);
clinicaRouter.patch('/tratamientos/predicciones/:id_prediccion/descartar', requireRoles(['ADMIN', 'TERAPEUTA']), (req, res, next) =>
  clinicaController.descartarPrediccionTratamiento(req, res, next)
);

// Evaluaciones Fonológicas (Sin persistencia de audio)
clinicaRouter.get('/evaluaciones-fonologicas/:id_paciente', (req, res, next) =>
  clinicaController.getEvaluacionesFonologicas(req, res, next)
);
clinicaRouter.post('/evaluaciones-fonologicas', requireRoles(['ADMIN', 'TERAPEUTA']), (req, res, next) =>
  clinicaController.registrarEvaluacionFonologica(req, res, next)
);
clinicaRouter.patch('/evaluaciones-fonologicas/:id_evaluacion/revision', requireRoles(['ADMIN', 'TERAPEUTA']), (req, res, next) =>
  clinicaController.revisarEvaluacionFonologica(req, res, next)
);
