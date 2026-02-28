import { defineConfig } from "vite";
import preact from "@preact/preset-vite";

const defaultBasePath = "/";

export default defineConfig(({ command }) => ({
  plugins: [preact()],
  // Custom-domain Pages deployments are served from the root path.
  base: command === "serve" ? "/" : process.env.VITE_BASE_PATH ?? defaultBasePath
}));
