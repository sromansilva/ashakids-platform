import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import { ChildProvider } from "./context/ChildContext";
import App from "./App";
import "./Index.css";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <AuthProvider>
      <ChildProvider>
        <App />
      </ChildProvider>
    </AuthProvider>
  </BrowserRouter>
);