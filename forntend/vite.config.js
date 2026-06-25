import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

function envValue(value, fallback = "") {
  if (value === undefined) {
    return fallback;
  }

  if (value === "") {
    return fallback;
  }

  return value;
}

function envNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const devPort = envNumber(env.VITE_DEV_PORT, 5173);
  const previewPort = envNumber(env.VITE_PREVIEW_PORT, devPort);
  const devHost = envValue(env.VITE_DEV_HOST, "0.0.0.0");
  const apiProxyTarget = envValue(env.VITE_API_PROXY_TARGET);
  const allowedHosts = envValue(env.VITE_ALLOWED_HOSTS)
    .split(",")
    .map((host) => host.trim())
    .filter(Boolean);

  return {
    plugins: [react()],
    server: {
      host: devHost,
      port: devPort,
      allowedHosts: allowedHosts.includes("*") ? true : allowedHosts,
      proxy: apiProxyTarget
        ? {
            "/api": {
              target: apiProxyTarget,
              changeOrigin: true,
            },
          }
        : undefined,
    },
    preview: {
      host: devHost,
      port: previewPort,
      allowedHosts: allowedHosts.includes("*") ? true : allowedHosts,
    },
  };
});
