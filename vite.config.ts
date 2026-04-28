import { resolve } from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";

export default defineConfig({
  plugins: [
    react(),
    dts({ include: ["src"], insertTypesEntry: true, rollupTypes: true }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "ReactMaskInput",
      fileName: (format) =>
        format === "cjs" ? "react-mask-input.cjs" : "react-mask-input.js",
      formats: ["es", "cjs"],
    },
    rollupOptions: {
      external: ["react", "react/jsx-runtime", "react-dom"],
      output: {
        globals: {
          react: "React",
          "react/jsx-runtime": "ReactJSXRuntime",
          "react-dom": "ReactDOM",
        },
        assetFileNames: "react-mask-input[extname]",
      },
    },
    sourcemap: true,
    minify: false,
  },
});
