import http from "k6/http";
import { check } from "k6";

const target = __ENV.K6_BASE_URL || "http://127.0.0.1:8000";
const allowLoad = __ENV.K6_ALLOW_LOAD_TEST === "true";
const allowProduction = __ENV.K6_ALLOW_PRODUCTION === "true";
const hostname = new URL(target).hostname;

if (!allowLoad) {
  throw new Error("Carga bloqueada: define K6_ALLOW_LOAD_TEST=true después de confirmar el entorno y el alcance.");
}
if (hostname.endsWith("onrender.com") && !allowProduction) {
  throw new Error("Carga contra Render bloqueada: define K6_ALLOW_PRODUCTION=true solo con autorización explícita.");
}

export const options = {
  stages: [
    { duration: __ENV.K6_WARMUP || "10s", target: Number(__ENV.K6_VUS || 1) },
    { duration: __ENV.K6_HOLD || "20s", target: Number(__ENV.K6_VUS || 1) },
    { duration: "5s", target: 0 },
  ],
  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<800"],
  },
};

export default function () {
  const response = http.get(`${target.replace(/\/$/, "")}/health`, { tags: { endpoint: "health" } });
  check(response, {
    "health returns 200": (res) => res.status === 200,
    "health is healthy": (res) => res.json("status") === "healthy",
  });
}
