
export function downloadPdf(filename: string, title: string, lines: string[]) {
  const text = [title, "═".repeat(48), ...lines, "", "Generado por AshaApp · " + new Date().toLocaleDateString("es")].join("\n");
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
