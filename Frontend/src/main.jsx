import { createRoot } from "react-dom/client";
import "@/app/App.css";
import App from "@/app/App.jsx";
import { SpeedInsights } from '@vercel/speed-insights/react'

createRoot(document.getElementById("root")).render(
  <SpeedInsights>
    <App />
  </SpeedInsights>
);
