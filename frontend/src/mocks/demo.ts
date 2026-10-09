import { B } from "@/theme/brand/B";

export const adminUsers = [
  { id: 1, name: "Laura Gómez",      code: "P1234", role: "padre",     email: "laura@email.com",  status: "activo",   date: "15 Ene 2026" },
  { id: 2, name: "Dra. Ana Ruiz",    code: "T0021", role: "terapeuta", email: "ana@asha.com",      status: "activo",   date: "10 Oct 2025" },
  { id: 3, name: "Lic. C. Mendoza",  code: "T0035", role: "terapeuta", email: "carlos@asha.com",   status: "activo",   date: "22 Nov 2025" },
  { id: 4, name: "Jorge Pérez",      code: "P5678", role: "padre",     email: "jorge@email.com",   status: "inactivo", date: "03 Mar 2026" },
  { id: 5, name: "Admin Principal",  code: "A0001", role: "admin",     email: "admin@asha.com",    status: "activo",   date: "01 Ene 2025" },
];

export const appointments = [
  { id: 1, therapist: "Dra. Ana Ruiz",       child: "Mateo Gómez",  date: "30 Jul 2026", time: "10:00", type: "virtual",  status: "confirmada", specialty: "Lenguaje"  },
  { id: 2, therapist: "Lic. Carlos Mendoza", child: "Sofía Gómez",  date: "02 Ago 2026", time: "15:30", type: "virtual",  status: "pendiente",  specialty: "Comprensión" },
  { id: 3, therapist: "Dra. Ana Ruiz",       child: "Mateo Gómez",  date: "06 Ago 2026", time: "10:00", type: "virtual",  status: "confirmada", specialty: "Lenguaje"  },
];

export const kids = [
  { id: 1, name: "Mateo", age: 7, therapist: "Dra. Ana Ruiz",       sessions: 12, progress: 78, emoji: "🦊", bg: "#FEF3C7" },
  { id: 2, name: "Sofía", age: 5, therapist: "Lic. Carlos Mendoza", sessions: 6,  progress: 55, emoji: "🐰", bg: "#EDE9FE" },
];

export const msgs = [
  { id: 1, from: "Dra. Ana Ruiz", text: "¡Hola Laura! Mateo tuvo un excelente avance hoy con los trabalenguas. 🌟", time: "10:30", own: false, av: "AR", color: B.violet },
  { id: 2, from: "Tú",            text: "¡Qué buenas noticias! Él estaba muy emocionado de la sesión.",             time: "10:45", own: true,  av: "LG", color: B.orange },
  { id: 3, from: "Dra. Ana Ruiz", text: "Para la próxima sesión practicá estos ejercicios en casa 📄",              time: "10:47", own: false, av: "AR", color: B.violet },
  { id: 4, from: "Tú",            text: "Perfecto, ¿a qué hora es la próxima cita?",                               time: "11:05", own: true,  av: "LG", color: B.orange },
  { id: 5, from: "Dra. Ana Ruiz", text: "El miércoles 6 de agosto a las 10:00 AM. Te llegará confirmación. 📅",    time: "11:08", own: false, av: "AR", color: B.violet },
];

export const therapists = [
  { id: 1, name: "Dra. Ana Ruiz",       specialty: "Terapia del Lenguaje", rating: 4.9, reviews: 127, experience: "8 años",  av: "AR", color: B.violet,  available: true,  price: 45, tags: ["Lenguaje", "Fonología"] },
  { id: 2, name: "Lic. Carlos Mendoza", specialty: "Terapia del Lenguaje", rating: 4.8, reviews: 98,  experience: "6 años",  av: "CM", color: B.teal,    available: true,  price: 50, tags: ["Comprensión", "Vocabulario"] },
  { id: 3, name: "Dra. María Torres",   specialty: "Terapia del Lenguaje", rating: 4.7, reviews: 84,  experience: "10 años", av: "MT", color: "#EC4899", available: false, price: 55, tags: ["Fluidez", "Pronunciación"] },
  { id: 4, name: "Lic. Pedro Sánchez",  specialty: "Terapia del Lenguaje", rating: 4.9, reviews: 156, experience: "12 años", av: "PS", color: B.orange,  available: true,  price: 48, tags: ["Articulación", "Habla"] },
  { id: 5, name: "Dra. Lucía Vargas",   specialty: "Terapia del Lenguaje", rating: 4.6, reviews: 72,  experience: "5 años",  av: "LV", color: "#06B6D4", available: true,  price: 42, tags: ["Lenguaje", "Comunicación"] },
  { id: 6, name: "Lic. Roberto Díaz",   specialty: "Terapia del Lenguaje", rating: 4.8, reviews: 110, experience: "9 años",  av: "RD", color: "#7C3AED", available: true,  price: 58, tags: ["Fonología", "Articulación"] },
];
