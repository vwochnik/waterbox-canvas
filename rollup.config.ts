import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import sourceMaps from 'rollup-plugin-sourcemaps'
import typescript from '@rollup/plugin-typescript'
import json from '@rollup/plugin-json'
import serve from 'rollup-plugin-serve'
import livereload from 'rollup-plugin-livereload'
import execute from "rollup-plugin-shell";
import { readFileSync } from 'fs'

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'))

export default {
  input: `src/main.ts`,
  output: [
    ...(process.env.ROLLUP_WATCH ? [
      { file: "public/waterbox-canvas.js", name: "Waterbox", format: 'iife', sourcemap: true }
    ] : [
      { file: pkg.main, name: "Waterbox", format: 'umd', sourcemap: true },
      { file: pkg.module, format: 'es', sourcemap: true },
      { file: pkg.browser, name: "Waterbox", format: 'iife', sourcemap: true }
    ])
  ],
  // Indicate here external modules you don't wanna include in your bundle (i.e.: 'lodash')
  external: [],
  watch: {
    include: 'src/**',
  },
  plugins: [
    // Allow json resolution
    json(),
    // Compile TypeScript files: use separate tsconfig for watch vs build
    typescript({ tsconfig: process.env.ROLLUP_WATCH ? 'tsconfig.watch.json' : 'tsconfig.build.json' }),

    // Allow bundling cjs modules (unlike webpack, rollup doesn't understand cjs)
    commonjs(),
    // Allow node_modules resolution, so you can use 'external' to control
    // which external modules to include in the bundle
    // https://github.com/rollup/rollup-plugin-node-resolve#usage
    resolve(),

    // Resolve source maps to the original source
    sourceMaps(),

    // Serve and live reload only in watch mode
    ...(process.env.ROLLUP_WATCH ? [
      execute({
        commands: ["npm run render-html"],
        hook: "generateBundle",
      }),

      serve({
        open: true,
        contentBase: 'public',
        openPage: '/',
        port: 3000,
      }),
      livereload(),
    ] : []),
  ],
}
