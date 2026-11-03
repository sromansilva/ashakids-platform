export interface AppointmentReminderPreferences {
  parent_recordatorio: boolean;
  therapist_recordatorio: boolean;
}

export function isReminderRecipientEnabled(
  minutes: 5 | 10,
  preferences: AppointmentReminderPreferences,
) {
  return minutes === 10 ? preferences.therapist_recordatorio : preferences.parent_recordatorio;
}
