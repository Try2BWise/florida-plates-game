import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");

  return {
    base: env.BASE_PATH || "/",
    plugins: [react()],
    server: {
      host: "0.0.0.0"
    },
    preview: {
      host: "0.0.0.0"
    }
  };
});
