import { createRoot } from "react-dom/client";
import { AppProviders } from "@/core/providers/AppProviders";
import App from "@/App";
import "@/Index.css";

createRoot(document.getElementById("root")!).render(
  <AppProviders>
    <App />
  </AppProviders>
);
