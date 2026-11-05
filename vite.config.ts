import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { mcpPlugin } from "@lovable.dev/mcp-js/stacks/supabase/vite";

/**
 * Vite plugin: inject modulepreload hints for critical vendor chunks
 * into the built HTML to reduce the waterfall / critical request chain.
 */
function modulePreloadHints(): Plugin {
  const criticalChunks = [
    "vendor-react",
    "vendor-query",
  ];

  return {
    name: "critical-modulepreload",
    enforce: "post",
    transformIndexHtml: {
      order: "post",
      handler(html, ctx) {
        if (!ctx.bundle) return html;

        const hints: string[] = [];
        for (const [fileName, chunk] of Object.entries(ctx.bundle)) {
          if (
            chunk.type === "chunk" &&
            criticalChunks.some((name) => fileName.includes(name))
          ) {
            hints.push(
              `<link rel="modulepreload" href="/${fileName}" />`
            );
          }
        }

        if (hints.length === 0) return html;

        // Insert right before </head>
        return html.replace("</head>", `${hints.join("\n    ")}\n  </head>`);
      },
    },
  };
}


// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mcpPlugin(), modulePreloadHints(), mode === "development" && componentTagger()].filter(Boolean),
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
    target: "es2022",
    // Chunk splitting for better caching
    rollupOptions: {
      output: {
        // Function form so shared tiny utils (clsx, tailwind-merge) never get
        // hoisted into a heavy chunk like recharts and drag it onto the
        // homepage critical path.
        manualChunks(id: string) {
          if (id.includes("commonjsHelpers")) return "vendor-utils";
          if (!id.includes("node_modules")) return undefined;
          if (/node_modules\/(clsx|tailwind-merge|class-variance-authority|tslib|@babel\/runtime)\//.test(id)) return "vendor-utils";
          if (/node_modules\/(react|react-dom|react-router|react-router-dom|scheduler)\//.test(id)) return "vendor-react";
          if (id.includes("@tanstack/react-query")) return "vendor-query";
          if (id.includes("@supabase/")) return "vendor-supabase";
          if (/node_modules\/(recharts|d3-|victory-vendor)/.test(id)) return "vendor-charts";
          return undefined;
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
