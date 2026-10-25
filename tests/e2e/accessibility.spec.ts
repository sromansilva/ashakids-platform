import { AxeBuilder } from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("landing pública no tiene violaciones críticas de accesibilidad", async ({ page }, testInfo) => {
  await page.goto("/", { waitUntil: "networkidle" });
  const results = await new AxeBuilder({ page }).analyze();
  await testInfo.attach("axe-results.json", {
    body: JSON.stringify(results, null, 2),
    contentType: "application/json",
  });

  const critical = results.violations.filter((violation) => violation.impact === "critical");
  expect(critical, critical.map((violation) => violation.id).join(", ")).toEqual([]);
});

test("login pública no tiene violaciones críticas de accesibilidad", async ({ page }, testInfo) => {
  await page.goto("/login", { waitUntil: "networkidle" });
  const results = await new AxeBuilder({ page }).analyze();
  await testInfo.attach("axe-login-results.json", {
    body: JSON.stringify(results, null, 2),
    contentType: "application/json",
  });

  const critical = results.violations.filter((violation) => violation.impact === "critical");
  expect(critical, critical.map((violation) => violation.id).join(", ")).toEqual([]);
});
