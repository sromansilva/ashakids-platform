export const ASHAKIDS_WHATSAPP_NUMBER = "51986309426";

export function getAshaKidsWhatsAppUrl(message: string): string {
  return `https://wa.me/${ASHAKIDS_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export const ACCOUNT_REQUEST_WHATSAPP_URL = getAshaKidsWhatsAppUrl(
  "Hola AshaKids, quisiera solicitar información sobre una cuenta para mi familia.",
);
