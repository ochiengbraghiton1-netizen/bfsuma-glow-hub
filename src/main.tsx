import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import "./index.css";

// Analytics debugging stays off unless /analytics-debug has been opened in this
// browser tab. Then the recorder survives full page loads for that session.
try {
  if (sessionStorage.getItem("ga4-debug-armed") === "1") {
    import("./lib/analytics-debug").then((m) => m.installRecorder());
  }
} catch {
  /* storage unavailable */
}

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
);
