import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // server: {
  //   proxy: {
  //     "/board": {
  //       target: "https://mezvopydur.us16.qoddiapp.com",
  //       changeOrigin: true,
  //     },
  //   },
  // },
});
