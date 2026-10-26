import { z } from 'zod';

export const newsletterSubscriptionSchema = z.object({
  email: z.string().email('Correo electrónico no válido'),
});

export type NewsletterSubscriptionDTO = z.infer<typeof newsletterSubscriptionSchema>;

