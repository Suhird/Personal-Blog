import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: "/Personal-Blog/", // ⬅️ Replace with your actual GitHub repo name
  // base: "/", Uncomment this if deploying on Netlify
  //base: process.env.GITHUB_PAGES ? "/Personal-Blog/" : "/",
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));

// export default defineConfig({
//   base: "/Personal-Blog/", // 🔁 Replace with your actual repo name
//   plugins: [react()],
//   resolve: {
//     alias: {
//       "@": path.resolve(__dirname, "./src"),
//     },
//   },
// });
