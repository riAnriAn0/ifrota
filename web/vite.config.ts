import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  // Adicione este bloco server abaixo:
  server: {
    hmr: {
      host: 'localhost',
      protocol: 'ws',
    },
  },
});