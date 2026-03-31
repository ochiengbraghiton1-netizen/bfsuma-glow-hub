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
      // Force all React imports to use the same instance
      "react": path.resolve(__dirname, "./node_modules/react"),
      "react-dom": path.resolve(__dirname, "./node_modules/react-dom"),
    },
    dedupe: [
      "react", 
      "react-dom", 
      "react/jsx-runtime", 
      "react/jsx-dev-runtime",
      "@tiptap/react",
      "@tiptap/extension-underline",
      "@tiptap/extension-text-align",
    ],
  },
  build: {
    // Enable CSS and JS minification (Vite uses esbuild for JS, lightningcss/postcss for CSS)
    minify: "esbuild",
    cssMinify: true,
    // Target modern browsers for smaller output
    target: "es2020",
    // Chunk splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          "vendor-query": ["@tanstack/react-query"],
          "vendor-supabase": ["@supabase/supabase-js"],
          "vendor-charts": ["recharts"],
          "vendor-ui-core": ["@radix-ui/react-tooltip", "@radix-ui/react-slot"],
          "vendor-ui-overlay": ["@radix-ui/react-dialog", "@radix-ui/react-popover", "@radix-ui/react-dropdown-menu", "@radix-ui/react-toast"],
          "vendor-ui-tabs": ["@radix-ui/react-tabs", "@radix-ui/react-accordion", "@radix-ui/react-select"],
        },
      },
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 600,
  },
  optimizeDeps: {
    include: [
      "react", 
      "react-dom", 
      "@tanstack/react-query",
      "@tiptap/react",
      "@tiptap/starter-kit",
      "@tiptap/extension-link",
      "@tiptap/extension-image",
      "@tiptap/extension-youtube",
      "@tiptap/extension-placeholder",
    ],
    exclude: ["react-image-crop"],
    force: true,
  },
}));
