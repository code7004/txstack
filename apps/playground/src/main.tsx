import { RouteRenderer } from "@txstack/route-meta";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import { RouteData } from "./routes";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <RouteRenderer data={RouteData} />
    </BrowserRouter>
  </StrictMode>
);
