import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react()],
	preview: {
		port: 4173, // Render yine $PORT üzerinden override edecek
		host: true, // 0.0.0.0 üzerinden dışarı açılır
		allowedHosts: ["predict-next-login-1.onrender.com"],
	},
});
