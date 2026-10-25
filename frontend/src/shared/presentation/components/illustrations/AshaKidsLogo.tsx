import ashaKidsLogo from "@/shared/presentation/assets/ashakids-logo-96.png";
import { LogoVariant } from "@/shared/presentation/theme/brand/logo";
import { LOGO_PX } from "@/shared/presentation/theme/brand/logo";
import { LOGO_TEXT } from "@/shared/presentation/theme/brand/logo";

export function AshaKidsLogo({
  variant = "header",
  showText = true,
  textColor,
}: {
  variant?: LogoVariant;
  showText?: boolean;
  textColor?: string;
}) {
  const size = LOGO_PX[variant];
  return (
    <div className="flex items-center gap-2.5">
      <img
        src={ashaKidsLogo}
        alt={showText ? "" : "Logo de AshaKids"}
        width={size}
        height={size}
        style={{ objectFit: "contain", display: "block", flexShrink: 0 }}
      />
      {showText && (
        <span className={LOGO_TEXT[variant]} style={{ color: textColor ?? "#1C1135" }}>
          AshaKids
        </span>
      )}
    </div>
  );
}
