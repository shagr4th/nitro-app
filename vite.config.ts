import { defineConfig } from "vite";
import { nitro } from "nitro/vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [
    react(),
    nitro({
      serverDir: "./server"
    }),
  ],
  server: {
    host: "0.0.0.0",
    allowedHosts: ["5000.shagr.at"],
    port: 5000
  },
  resolve: {
    tsconfigPaths: true
  }
});
