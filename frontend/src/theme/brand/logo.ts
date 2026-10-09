

export type LogoVariant = "header" | "sidebar" | "auth";

export const LOGO_PX: Record<LogoVariant, number> = { header: 44, sidebar: 48, auth: 80 };

export const LOGO_TEXT: Record<LogoVariant, string> = {
  header:  "text-xl font-extrabold tracking-tight",
  sidebar: "text-lg font-extrabold tracking-tight",
  auth:    "text-2xl font-black tracking-tight",
};
