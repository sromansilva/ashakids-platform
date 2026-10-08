import { createRoot } from "react-dom/client";
import { AppProviders } from "@/app/providers/AppProviders";
import App from "@/App";
import "@/Index.css";

createRoot(document.getElementById("root")!).render(
  <AppProviders>
      <App />
  </AppProviders>
);
