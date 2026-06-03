import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    cssMinify: false,
    rollupOptions: {
      output: {
        // Split heavy vendor code into its own long-lived chunk so the main app
        // bundle is smaller and cold start / repeat loads are faster (vendor
        // hash only changes when those deps change).
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("firebase") || id.includes("@firebase")) return "vendor-firebase";
            if (id.includes("react")) return "vendor-react";
            return "vendor";
          }
        }
      }
    }
  }
})
