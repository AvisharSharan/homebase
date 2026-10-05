import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
    {
      name: "production-security-policy",
      apply: "build",
      transformIndexHtml() {
        return [{
          tag: "meta",
          attrs: {
            "http-equiv": "Content-Security-Policy",
            content: "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'none'",
          },
          injectTo: "head",
        }];
      },
    },
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
