import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import vitePluginRemoveConsole from 'vite-plugin-remove-console'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    vitePluginRemoveConsole()
  ],
});
