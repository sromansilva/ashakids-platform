import ashaKidsLogo from "@/shared/presentation/assets/ashakids-logo-96.png";

export function Isotipo({ size = 36 }: { size?: number }) {
  return (
    <img src={ashaKidsLogo} alt="" width={size} height={size}
      style={{ objectFit: "contain", display: "block", flexShrink: 0 }} />
  );
}
