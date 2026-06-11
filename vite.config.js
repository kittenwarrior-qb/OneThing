import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    define: {
      "import.meta.env.VITE_GIPHY_KEY": JSON.stringify(env.VITE_GIPHY_KEY || env.GIPHY_KEY || ""),
      "import.meta.env.VITE_GIPHY_API_KEY": JSON.stringify(env.VITE_GIPHY_API_KEY || env.GIPHY_API_KEY || ""),
      "import.meta.env.VITE_OPENROUTER_KEY": JSON.stringify(env.VITE_OPENROUTER_KEY || env.OPENROUTER_KEY || ""),
    },
    plugins: [react(), tailwindcss()],
  };
});
