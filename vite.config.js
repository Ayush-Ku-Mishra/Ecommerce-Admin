import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5179, // (or your port)
    open: true,
    proxy: {
      "/api": {
        target: "http://localhost:8000", // backend
        changeOrigin: true,
        secure: false,
      },
    },
    historyApiFallback: true, // 👈 this ensures React Router routes survive refresh
  },
});
