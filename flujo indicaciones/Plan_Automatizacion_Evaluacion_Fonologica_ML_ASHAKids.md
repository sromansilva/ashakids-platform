# Ashakids | Propuesta Funcional y Técnica Actualizada

## Plan Integral de Automatización, Evaluación Fonológica con IA y Pronóstico Terapéutico Predictivo

> **Documento de Arquitectura y Flujo Funcional**  
> *Versión 2.0 • 2 de noviembre de 2026*  
> *Plataforma de Telerehabilitación y Estimulación de Habla y Lenguaje Infantil*

---

## Resumen Ejecutivo

Este documento define el flujo operativo y técnico de **Ashakids**, integrando la atención clínica especializada con dos ramas complementarias de Inteligencia Artificial:
1. **Deep Learning Acústico (Wav2Vec 2.0)**: Evaluación fonológica en tiempo real mediante muestras de audio breves durante la sesión de videollamada.
2. **Machine Learning Predictivo Supervisado (Random Forest / Scikit-Learn)**: Estimación analítica del número de sesiones requeridas y riesgo de deserción en la consulta introductoria, eliminando el valor estático fijado previamente en la base de datos (`sesiones_recomendadas: 12`).

El ciclo terapéutico se completa con la derivación automática de objetivos clínicos hacia las actividades educativas interactivas de los **Cinco Mundos de Ashakids** y el seguimiento objetivo de la evolución del paciente.

---

## Contenido

1. [Registro y acceso del padre de familia](#1-registro-y-acceso-del-padre-de-familia)
2. [Selección de terapeuta y programación de sesiones](#2-selección-de-terapeuta-y-programación-de-sesiones)
3. [Inicio de sesiones mediante Google Meet](#3-inicio-de-sesiones-mediante-google-meet)
4. [Panel de sesión y pruebas fonológicas en tiempo real (Wav2Vec 2.0)](#4-panel-de-sesión-y-pruebas-fonológicas-en-tiempo-real)
5. [Almacenamiento automático y estructurado de resultados](#5-almacenamiento-automático-de-los-resultados)
6. [Finalización de la sesión y generación del reporte clínico](#6-finalización-de-la-sesión-y-generación-del-reporte-clínico)
7. [Generación del plan terapéutico asistido por Machine Learning Predictivo](#7-generación-del-plan-terapéutico-asistido-por-machine-learning-predictivo)
8. [Integración del plan terapéutico con los cinco mundos de Ashakids](#8-integración-del-plan-terapéutico-con-los-cinco-mundos-de-ashakids)
9. [Seguimiento del progreso terapéutico y adherencia](#9-seguimiento-del-progreso-terapéutico)
10. [Privacidad, consentimiento informado y seguridad](#10-privacidad-autorización-y-seguridad)
11. [Arquitectura funcional y tecnológica de la solución](#11-arquitectura-funcional-de-la-solución)
12. [Flujo maestro y objetivo final](#12-objetivo-final)

---

## 1. Registro y acceso del padre de familia

El proceso comienza cuando el tutor o padre de familia visita la landing page de **Ashakids**, conoce las especialidades clínicas (habla, lenguaje, fluidez, voz y motricidad orofacial) y solicita atención o información inicial.

- **Alta y Verificación**: El personal de administración o el flujo asistido registra al padre en la plataforma con validación fiscal y de identidad (DNI en RENIEC vía Decolecta).
- **Activación Segura**: La plataforma emite automáticamente un correo de invitación con un enlace cifrado para crear una contraseña personal e ingresar al Centro Familiar.
- **Perfiles Infantiles Independientes**: Tras iniciar sesión, el padre puede dar de alta a uno o varios hijos. Cada menor cuenta con un expediente clínico, un selector activo en la barra superior, histórico de sesiones, reportes descargables y su progreso en el *Mundo ASHA*.

---

## 2. Selección de terapeuta y programación de sesiones

Cada paciente nuevo debe iniciar obligatoriamente con una **Consulta Introductoria de Evaluación** antes de dar paso a su tratamiento regular.

- **Disponibilidad Clínica Dinámica**: Los terapeutas gestionan sus bloques horarios hábiles semanales desde su agenda (`TerapeutaAgenda.tsx`).
- **Reserva Inteligente**: La familia visualiza el perfil del especialista colegiado, revisa su disponibilidad y reserva la fecha y hora deseada (`BookingDialog.tsx`).
- **Asignación Integral**: El sistema bloquea el horario en la base de datos PostgreSQL, genera el evento y notifica por correo tanto al tutor como al terapeuta, vinculando al paciente, al padre y al especialista responsable.

---

## 3. Inicio de sesiones mediante Google Meet

Ashakids utiliza **Google Meet** como motor oficial de videoconferencia en tiempo real, garantizando máxima fidelidad de audio y compatibilidad multiplataforma sin requerir descargas pesadas.

- **Duración Estándar**: Sesiones programadas de 40 minutos vinculadas al registro de la reserva.
- **Secuencia Temporal Automatizada**:
  - `T - 10 min`: Notificación anticipada en pantalla al terapeuta sobre la cita entrante.
  - `T - 5 min`: Se habilita el botón interactivo **"Iniciar reunión"**.
  - `T = 0 min (Inicio)`: Al pulsar el botón ocurren dos eventos en paralelo:
    1. Se abre la sala de **Google Meet** para la comunicación interpersonal.
    2. Se abre el **"Panel de Sesión y Pruebas Clínicas"** en Ashakids para la gestión terapéutica activa.
  - La finalización real de la sesión la confirma el terapeuta; el sistema no asume cierres arbitrarios por simple cumplimiento del reloj.

```
Cronograma de Sesión Terapéutica (Ejemplo: Cita 3:00 p. m.)
[2:50 p. m.] ── Notificación anticipada al terapeuta
[2:55 p. m.] ── Botón habilitado · Notificación al padre con enlace Meet
[3:00 p. m.] ── Inicio de videoconsulta + Apertura del Panel de Sesión
[3:00-3:40]  ── Intervención clínica y evaluación fonológica interactiva
[3:40 p. m.] ── Cierre confirmado por el terapeuta y pase a reporte clínico
```

---

## 4. Panel de sesión y pruebas fonológicas en tiempo real

Este módulo opera en paralelo a la videollamada de Google Meet y constituye el primer punto de aplicación de Inteligencia Artificial.

### A. Información en Vivo
El terapeuta visualiza:
- Nombre y edad del menor.
- Número de sesión dentro del tratamiento.
- Cronómetro de tiempo restante y estado de conexión.
- Enlace directo de respaldo a Google Meet.

### B. Evaluación Fonológica Asistida por IA (Wav2Vec 2.0)
El terapeuta dispone del componente interactivo de evaluación fonológica:
- **Selección de Fonema Objetivo**: El especialista elige el fonema en conflicto (ej. vibrante múltiple `/rr/`, lateral `/l/`, fricativa `/s/`, sinfones `/pl/`, `/tr/`) y la palabra asociada (*"carro"*, *"ratón"*, *"plato"*, *"zapato"*).
- **Captura Breve y Limpia**: El terapeuta solicita al niño repetir la palabra. El sistema graba una ventana sonora controlada de 2 a 3 segundos del micrófono.
- **Inferencia Acústica Local**: La muestra se procesa en el microservicio `ml-service` (FastAPI + PyTorch) mediante el modelo neuronal **Wav2Vec 2.0**.
- **Indicadores Entregados al Profesional**:
  - Transcripción acústica real detectada (ej. *"calo"* frente a objetivo *"carro"*).
  - Porcentaje de similitud fonética espectral.
  - Tipo de error articulatorio identificado (Sustitución, Omisión o Distorsión).
  - Diagnóstico preliminar de apoyo (ej. *Lambdacismo: Sustitución de vibrante /r/ por lateral /l/*).

> **Aclaración Ética y Clínica**: Los resultados generados por el modelo neuronal actúan como indicadores de apoyo cuantitativo; no sustituyen el criterio ni el diagnóstico formal del profesional colegiado.

---

## 5. Almacenamiento automático de los resultados

Cada prueba completada se indexa de inmediato sin requerir reescritura manual:
- Identificador de la sesión y paciente.
- Fonema y palabra evaluada.
- Porcentaje de similitud y transcripción fonética registrada.
- Número de intentos realizados por el menor.
- Notas rápidas de observación ingresadas durante la interacción.

Las muestras de audio se analizan en memoria volátil protegiendo la identidad del menor; únicamente los datos numéricos y estructurados se almacenan en la base de datos relacional para el expediente histórico.

---

## 6. Finalización de la sesión y generación del reporte clínico

Al pulsar **"Finalizar sesión"**, el sistema abre de manera automática el módulo de confección del informe clínico (`ClinicalReportEditor.tsx`):
- **Datos Administrativos Prellenados**: Nombre del niño, terapeuta, fecha, hora, modalidad y número de sesión.
- **Inserción de Pruebas con 1 Clic**: El botón *"Pegar en el informe"* traslada la transcripción acústica, el fonema y la similitud directamente al cuerpo del reporte.
- **Escala de Ayuda Terapéutica**: Registro estandarizado del nivel de asistencia requerido por el niño (Nivel 1: Autónomo $\rightarrow$ Nivel 5: Ayuda física / verbal continua).
- **Objetivos y Recomendaciones**: Redacción de metas inmediatas y tareas para el hogar.
- **Firma y Emisión**: Guardado como borrador, validación profesional con firma digital y descarga inmediata en formato PDF para la familia.

---

## 7. Generación del plan terapéutico asistido por Machine Learning Predictivo

> **Innovación Clave**: En la Consulta Introductoria, Ashakids reemplaza la asignación estática arbitraria (`sesiones_recomendadas: 12`) por un **Modelo Predictivo de Regresión y Clasificación Supervisada (Random Forest / Scikit-Learn)** alojado en el microservicio ML.

### A. Variables de Entrada (Features del Modelo)
El modelo tabular extrae automáticamente los datos recopilados en la sesión inicial:
1. **Edad cronológica del menor** (meses y años cumplidos).
2. **Diagnóstico clínico preliminar** (ej. Dislalia funcional simple, Trastorno Fonológico, TEL, Retraso simple del habla).
3. **Cantidad de fonemas afectados**: Proveniente de las pruebas cuantitativas de Wav2Vec 2.0 ejecutadas en la sesión (ej. 3 fonemas comprometidos).
4. **Nivel de colaboración y atención**: Extraído del valor estandarizado de ayuda y conducta registrado por el terapeuta (escala 1 a 5).
5. **Frecuencia semanal sugerida**: 1 o 2 sesiones por semana.

### B. Salidas Predictivas del Modelo (Targets)
- **Target 1 (Regresión Supervisada)**: Número estimado de sesiones necesarias para alcanzar los objetivos de alta terapéutica (ej. $14.2 \pm 2$ sesiones).
- **Target 2 (Clasificación de Adherencia)**: Índice de riesgo de deserción o abandono temprano del tratamiento (*Bajo*, *Medio*, *Alto*), permitiendo a la clínica implementar estrategias de acompañamiento familiar preventivo.
- **Índice de Confianza Estadística**: Nivel de certidumbre del modelo basado en la dispersión de casos similares evaluados (ej. *88% de confianza*).

```
   VARIABLES DE ENTRADA (FEATURES)                 MODELO PREDICTIVO ASHAKIDS
┌──────────────────────────────────────┐       ┌─────────────────────────────────┐
│ • Edad: 4 años, 2 meses              │       │  Algoritmo Random Forest        │
│ • Diagnóstico: Dislalia funcional    │──────>│  Regresión + Clasificación      │
│ • Fonemas alterados: 3 (/r/, /s/, /pl/)│     │  Entrenado en cohortes clínicas │
│ • Colaboración en sesión: Nivel 4/5 │       └────────────────┬────────────────┘
│ • Frecuencia: 2 veces/semana         │                        │
└──────────────────────────────────────┘                        ▼
                                               PRONÓSTICO CLÍNICO ESTIMADO
                                              ┌─────────────────────────────────┐
                                              │ Pronóstico: 14 sesiones         │
                                              │ Intervalo: 13 a 16 sesiones     │
                                              │ Riesgo de Deserción: BAJO       │
                                              │ Nivel de Confianza: 88%         │
                                              └─────────────────────────────────┘
```

### C. Supervisión y Aprobación Profesional
El terapeuta visualiza la tarjeta predictiva en su pantalla de formulación del plan (`SessionPlan.tsx`). El profesional puede:
- Aceptar la sugerencia algorítmica con 1 solo clic.
- Ajustar manualmente el número de sesiones si detecta factores contextuales externos (ej. bilingüismo, compromiso auditivo leve).
- Asignar la periodicidad y habilitar el plan para la familia.

---

## 8. Integración del plan terapéutico con los cinco mundos de Ashakids

El plan aprobado no queda como un PDF inerte; se conecta dinámicamente con los **Cinco Mundos Educativos de Mundo ASHA**:

1. **Mundo 1: Isla Mágica (Conciencia Fonológica)**: Discriminación auditiva de contrastes de fonemas.
2. **Mundo 2: Laberinto de Palabras (Articulación y Nombramiento)**: Juegos de repetición y fijación del fonema asignado.
3. **Mundo 3: Canciones y Rimas (Prosodia y Fluidez)**: Ritmo, entonación y coordinación respiratoria.
4. **Mundo 4: Cuentos Interactivos (Comprensión y Morfosintaxis)**: Estructuración de frases y oraciones.
5. **Mundo 5: Adivinanzas (Semántica y Vocabulario)**: Definición, categorización y velocidad de procesamiento.

### Mecanismo de Asignación Personalizada
Si el plan del niño prioriza el fonema `/r/` y la discriminación auditiva:
- El sistema marca con una insignia dorada y desbloquea prioritariamente los niveles de la *Isla Mágica* y el *Laberinto* orientados a vibrantes.
- En el panel del padre se destaca la sección: *"Juegos recomendados por tu terapeuta para esta semana"*.
- Las métricas de participación (tiempo de juego, aciertos e intentos) quedan registradas en el expediente del niño sin interferir con las notas clínicas formales.

---

## 9. Seguimiento del progreso terapéutico

El módulo de evolución clínica (`TerapeutaAnaliticas.tsx` y `FamilyTrackingPanel.tsx`) consolida dos fuentes de datos rigurosamente delimitadas:

1. **Fuente Clínica Primaria (Validada)**:
   - Curva de evolución de inteligibilidad fonológica (porcentaje de acierto en pruebas Wav2Vec por sesión).
   - Cantidad de sesiones ejecutadas frente a la meta proyectada por el modelo de Machine Learning (ej. *Sesión 6 de 14*).
   - Objetivos del plan cumplidos y aprobados por el especialista.
2. **Fuente Lúdica Complementaria**:
   - Frecuencia de práctica en el hogar y niveles completados en los cinco mundos.

> **Regla de Oro Analítica**: La plataforma nunca promedia puntajes de juegos con porcentajes clínicos de pronunciación; ambos se presentan en gráficos diferenciados para no distorsionar la evaluación médica.

---

## 10. Privacidad, autorización y seguridad

Dado que Ashakids atiende a pacientes pediátricos, la plataforma se rige por la **Ley 29733 (Protección de Datos Personales en el Perú)** y estándares internacionales:

- **Consentimiento Informado Digital**: Registro explícito de autorización del tutor legal previo al uso de herramientas asistidas por IA.
- **Inferencia Efímera de Voz**: Las muestras cortas de audio enviadas a Wav2Vec 2.0 se destruyen de la memoria RAM del servidor inmediatamente después de calcular la transcripción acústica. No se almacenan audios ni archivos multimedia permanentes del menor.
- **Meet Desacoplado**: Google Meet se emplea como túnel seguro de comunicación visual; la plataforma no graba la videollamada completa ni interviene el flujo de video ajeno.
- **Control de Acceso Basado en Roles (RBAC)**: Los expedientes, diagnósticos y reportes están estrictamente segregados mediante cookies `HttpOnly` y middleware de autenticación (`ADMIN`, `TERAPEUTA`, `PADRE`).

---

## 11. Arquitectura funcional y tecnológica de la solución

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      CAPA CLIENTE (FRONTEND SPA)                            │
│  React 18 + TypeScript + Vite + Tailwind CSS                                │
│  • Panel Terapeuta: Google Meet + Evaluador Fonológico + Plan Asistido      │
│  • Centro Familiar: Selector de hijos, agenda, tracking y 5 Mundos ASHA     │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ HTTP / REST / JSON (Cookies HttpOnly)
┌──────────────────────────────────────▼──────────────────────────────────────┐
│                    CAPA SERVICIOS BACKEND (EXPRESS TS)                      │
│  Node.js + Express + Drizzle ORM / PostgreSQL                               │
│  • Módulos: auth, agenda, clinica, sesiones, identidad (Decolecta), correo │
│  • Orquestación: Persistencia de reportes, planes, citas y citas Meet       │
└───────────────────┬─────────────────────────────────────┬───────────────────┘
                    │                                     │
┌───────────────────▼──────────────────────┐ ┌────────────▼──────────────────┐
│   MICROSERVICIO MACHINE LEARNING (8001)   │ │      SERVICIOS EXTERNOS       │
│   FastAPI + PyTorch + Scikit-Learn       │ │ • Google Meet / Calendar       │
│   ┌────────────────────────────────────┐ │ │ • Gmail OAuth2 Mailer          │
│   │ IA 1: Wav2Vec 2.0 (Deep Learning)  │ │ │ • Decolecta (RENIEC / SUNAT)   │
│   │ Inferencia fonética acústica local │ │ └────────────────────────────────┘
│   ├────────────────────────────────────┤ │
│   │ IA 2: Random Forest / XGBoost      │ │
│   │ Pronóstico de sesiones y deserción │ │
│   └────────────────────────────────────┘ │
└──────────────────────────────────────────┘
```

---

## 12. Flujo maestro y objetivo final

El propósito de Ashakids es unificar la experiencia del especialista, la familia y el niño en un **bucle clínico y educativo continuo**:

$$\boxed{\text{Consulta Introductoria}} \longrightarrow \boxed{\text{Prueba Fonológica (Wav2Vec)}} \longrightarrow \boxed{\text{Reporte Clínico}}$$
$$\downarrow$$
$$\boxed{\text{Seguimiento y Alta}} \longleftarrow \boxed{\text{Práctica en 5 Mundos}} \longleftarrow \boxed{\text{Plan Asistido con ML Predictivo}}$$

1. **Sesión Inicial**: Diagnóstico clínico y fonético objetivo asistido por Wav2Vec 2.0.
2. **Pronóstico Inteligente**: Generación del plan con cálculo predictivo fundamentado de sesiones (Random Forest).
3. **Tratamiento Lúdico**: Ejercitación en casa conectada directamente a los fonemas en tratamiento a través de los cinco mundos.
4. **Validación y Alta**: Medición continua de avances hasta lograr la correcta articulación y comunicación del niño.

---
*Fin del documento oficial de especificación funcional y técnica.*

