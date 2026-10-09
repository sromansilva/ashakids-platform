import ashaKidsLogo from "@/assets/ashakids-logo-final-transparent-1.png";

export function IsotipoWhite({ size = 36 }: { size?: number }) {
  // PNG has real transparency — reads cleanly on dark violet surfaces.
  return (
    <img src={ashaKidsLogo} alt="" width={size} height={size}
      style={{ objectFit: "contain", display: "block", flexShrink: 0 }} />
  );
}
