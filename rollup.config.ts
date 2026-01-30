import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import sourceMaps from 'rollup-plugin-sourcemaps'
import typescript from '@rollup/plugin-typescript'
import json from '@rollup/plugin-json'
import serve from 'rollup-plugin-serve'
import livereload from 'rollup-plugin-livereload'
import { readFileSync } from 'fs'

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'))

export default {
  input: `src/main.ts`,
  output: [
    { file: pkg.main, name: "Waterbox", format: 'umd', sourcemap: true },
    { file: pkg.module, format: 'es', sourcemap: true },
    { file: pkg.browser, name: "Waterbox", format: 'iife', sourcemap: true }
  ],
  // Indicate here external modules you don't wanna include in your bundle (i.e.: 'lodash')
  external: [],
  watch: {
    include: 'src/**',
  },
  plugins: [
    // Allow json resolution
    json(),
    // Compile TypeScript files
    typescript(),
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
      serve({
        open: true,
        openPage: '/',
        contentBase: '.',
        port: 3000,
      }),
      livereload(),
    ] : []),
  ],
}
