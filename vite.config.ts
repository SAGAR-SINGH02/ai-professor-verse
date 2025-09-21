import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunk for React and related libraries
          vendor: ['react', 'react-dom'],
          // UI library chunk for Radix UI components
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-popover'],
          // 3D graphics chunk for Three.js and related libraries
          three: ['three', '@react-three/fiber', '@react-three/drei'],
          // Utility libraries chunk
          utils: ['clsx', 'tailwind-merge', 'class-variance-authority'],
          // Query and state management
          query: ['@tanstack/react-query', 'zustand'],
          // Icons chunk
          icons: ['lucide-react'],
          // Form handling
          forms: ['react-hook-form', '@hookform/resolvers', 'zod'],
        },
      },
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
  },
}));
