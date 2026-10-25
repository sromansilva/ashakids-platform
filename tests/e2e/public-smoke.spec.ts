import { expect, test } from "@playwright/test";

const publicRoutes = ["/", "/login", "/mundo-asha"];

test.describe("rutas públicas", () => {
  for (const route of publicRoutes) {
    test(`renderiza ${route}`, async ({ page }) => {
      const response = await page.goto(route, { waitUntil: "domcontentloaded" });
      expect(response?.status(), `respuesta HTTP para ${route}`).toBeLessThan(400);
      await expect(page.locator("body")).not.toContainText("Application error");
      await expect(page.locator("body")).not.toContainText("Cannot read properties");
    });
  }
});

test("un usuario de QA puede iniciar sesión cuando se entregan credenciales aisladas", async ({ page }) => {
  test.skip(
    !process.env.E2E_TEST_CODE || !process.env.E2E_TEST_PASSWORD,
    "Configura E2E_TEST_CODE y E2E_TEST_PASSWORD con una cuenta de prueba aislada.",
  );

  await page.goto("/login", { waitUntil: "domcontentloaded" });
  await page.locator("#login-user-code").fill(process.env.E2E_TEST_CODE!);
  await page.locator("#login-password").fill(process.env.E2E_TEST_PASSWORD!);
  await page.getByRole("button", { name: /iniciar sesión/i }).click();

  await expect(page).toHaveURL(new RegExp(process.env.E2E_EXPECTED_PATH || "/padre"));
  await expect(page.locator("body")).not.toContainText("Credenciales incorrectas");
});
