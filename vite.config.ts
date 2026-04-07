import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

/**
 * Vite plugin: inject modulepreload hints for critical vendor chunks
 * into the built HTML to reduce the waterfall / critical request chain.
 */
function modulePreloadHints(): Plugin {
  const criticalChunks = [
    "vendor-react",
    "vendor-query",
    "vendor-supabase",
    "vendor-ui-core",
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

/**
 * Vite plugin: make the main CSS non-render-blocking.
 * Inlines critical above-fold CSS and async-loads the full stylesheet.
 */
function asyncCssPlugin(): Plugin {
  // Critical CSS for above-fold rendering (variables, body, header shell, hero)
  const criticalCSS = `
:root{--background:0 0% 100%;--foreground:160 20% 15%;--primary:158 64% 52%;--primary-foreground:0 0% 100%;--primary-glow:158 64% 62%;--accent:43 96% 56%;--accent-foreground:160 20% 15%;--accent-glow:43 96% 66%;--secondary:158 44% 32%;--secondary-foreground:0 0% 100%;--muted:160 10% 95%;--muted-foreground:160 10% 40%;--border:160 20% 90%;--ring:158 64% 52%;--radius:1rem;--destructive:0 84.2% 60.2%;--destructive-foreground:0 0% 100%;--input:160 20% 90%}
.dark{--background:160 20% 8%;--foreground:0 0% 95%;--primary:158 64% 55%;--primary-foreground:0 0% 100%;--accent:43 96% 60%;--accent-foreground:160 20% 10%;--secondary:158 44% 25%;--secondary-foreground:0 0% 100%;--muted:160 15% 18%;--muted-foreground:160 10% 65%;--border:160 20% 20%;--ring:158 64% 55%;--input:160 20% 18%;--destructive:0 72% 51%;--destructive-foreground:0 0% 100%}
*,::before,::after{box-sizing:border-box;border-width:0;border-style:solid;border-color:hsl(var(--border))}
body{margin:0;background-color:hsl(var(--background));color:hsl(var(--foreground));font-family:system-ui,-apple-system,sans-serif;-webkit-font-smoothing:antialiased}
`.trim();

  return {
    name: "async-css",
    enforce: "post",
    transformIndexHtml: {
      order: "post",
      handler(html) {
        // Find the main CSS link and make it non-render-blocking
        const cssLinkRegex = /<link rel="stylesheet" crossorigin href="(\/assets\/index-[^"]+\.css)">/;
        const match = html.match(cssLinkRegex);
        if (!match) return html;

        const cssHref = match[1];
        const asyncLink = `<style>${criticalCSS}</style>\n    <link rel="stylesheet" href="${cssHref}" media="print" onload="this.media='all'">\n    <noscript><link rel="stylesheet" href="${cssHref}"></noscript>`;

        return html.replace(match[0], asyncLink);
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
  plugins: [react(), modulePreloadHints(), mode === "development" && componentTagger()].filter(Boolean),
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
