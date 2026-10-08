import { useState } from "react";
import { B } from "@/theme/brand/B";
import { View } from "@/types/navigation";

export function useLanding({ go }: { go: (v: View) => void }) {
const [faqOpen, setFaqOpen] = useState<number | null>(null);
const [email, setEmail] = useState("");
const services = [
    {
      icon: "🗣️",
      title: "Terapia del Lenguaje",
      desc: "Mejora la comunicación verbal, pronunciación y comprensión lingüística desde los 3 años. Nuestros especialistas certificados diseñan planes personalizados para cada niño, integrando tecnología y actividades lúdicas que hacen del aprendizaje una aventura.",
      color: B.violet,
      bg: B.violetLight,
    },
  ];
const steps = [
    {
      n: "01",
      icon: "📝",
      title: "Crea tu cuenta",
      desc: "Regístrate en minutos y recibe tu código ASHA para acceder a la plataforma.",
    },
    {
      n: "02",
      icon: "🔍",
      title: "Elige tu terapeuta",
      desc: "Explora perfiles de especialistas certificados y encuentra el ideal para tu hijo.",
    },
    {
      n: "03",
      icon: "🎯",
      title: "Reserva y conecta",
      desc: "Agenda sesiones virtuales. Comienza el camino hacia el desarrollo.",
    },
  ];
const testimonials = [
    {
      name: "Valeria M.",
      child: "Mamá de Lucas, 6 años",
      text: "Poder agendar las sesiones desde el panel y ver las notas del terapeuta después de cada cita nos ayudó a mantenernos organizados y saber en qué actividades enfocarnos en casa.",
      av: "VM",
      color: B.violet,
    },
    {
      name: "Diego R.",
      child: "Papá de Emma, 4 años",
      text: "Las actividades del módulo Mundo ASHA le dan a Emma una rutina de práctica entre sesiones. Nos resulta útil poder comunicarnos con la terapeuta directamente por la plataforma.",
      av: "DR",
      color: B.teal,
    },
    {
      name: "Carolina P.",
      child: "Mamá de Nico, 8 años",
      text: "La agenda virtual nos facilita coordinar horarios sin llamadas de ida y vuelta. El historial de sesiones nos ayuda a recordar qué trabajó el terapeuta en cada cita.",
      av: "CP",
      color: "#EC4899",
    },
  ];
const faqs = [
    {
      q: "¿A partir de qué edad atienden a los niños?",
      a: "Trabajamos con niños desde los 3 años. Nuestros especialistas adaptan cada terapia a la etapa del desarrollo de tu hijo.",
    },
    {
      q: "¿Cómo funcionan las sesiones virtuales?",
      a: "Las sesiones se realizan por Zoom. Al agendar recibís el enlace automáticamente. Solo necesitás internet y una cámara.",
    },
    {
      q: "¿Cuántas sesiones necesita mi hijo?",
      a: "En la evaluación inicial el terapeuta diseñará un plan personalizado con la frecuencia y duración recomendadas.",
    },
    {
      q: "¿Qué paquetes de horas están disponibles?",
      a: "Ofrecemos paquetes de 2, 6 y 10 horas con vigencia de 6 meses. Cada compra incluye factura PDF automática.",
    },
    {
      q: "¿Puedo ver el progreso de mi hijo?",
      a: "Sí. Tras cada sesión el terapeuta escribe notas clínicas visibles desde tu panel, con el historial completo.",
    },
  ];
return { go, faqOpen, setFaqOpen, email, setEmail, services, steps, testimonials, faqs };
}
