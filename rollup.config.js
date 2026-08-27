import nodeResolve from "@rollup/plugin-node-resolve";

import { rollupPluginHTML as html } from "@web/rollup-plugin-html";
import { importMetaAssets } from "@web/rollup-plugin-import-meta-assets";
import copy from "rollup-plugin-copy";
const outputDir = "dist";

export default [
  {
    input: "index.html",
    plugins: [
      html({
        minify: true,
      }),
      /** Resolve bare module imports */
      nodeResolve(),

      /** Bundle assets references via import.meta.url */
      importMetaAssets({ warnOnError: true }),

      copy({
        targets: [
          {
            src: "node_modules/ace-builds/src-noconflict/*.js",
            dest: `${outputDir}/ace`,
          },
        ],
        verbose: true,
        flatten: true,
      }),
      copy({
        targets: [
          // The blob worker loads these via importScripts() at runtime.
          // Only the JS glue + WASM binary are needed; worker.js is replaced
          // by the inline blob source in validateSchema.ts.
          {
            src: "node_modules/@openenergytools/xml-schema-validator/dist/xmlvalidate/xmlvalidate.js",
            dest: `${outputDir}/xmlvalidate`,
          },
          {
            src: "node_modules/@openenergytools/xml-schema-validator/dist/xmlvalidate/xmlvalidate.wasm",
            dest: `${outputDir}/xmlvalidate`,
          },
        ],
        hook: "writeBundle",
        verbose: true,
      }),
      copy({
        targets: [
          {
            src: ["fonts", "*.css"],
            dest: `${outputDir}/`,
          },
          {
            src: ["openscd-logo.svg", "openscd-icon.svg"],
            dest: `${outputDir}/`,
          },
          // Add more patterns if you have more assets
        ],
        verbose: true,
        flatten: false,
      }),
    ],
    output: {
      dir: outputDir,
      format: "es",
      sourcemap: false,
      entryFileNames: "[name]-[hash].js",
      chunkFileNames: "[name]-[hash].js",
    },
  },
];
