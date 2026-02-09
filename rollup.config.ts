import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import typescript from '@rollup/plugin-typescript'
import terser from '@rollup/plugin-terser';
import json from '@rollup/plugin-json'
import serve from 'rollup-plugin-serve'
import copy from 'rollup-plugin-copy';
import livereload from 'rollup-plugin-livereload'
import { readFileSync } from 'fs'
import { renderLayout } from './build/render-layout.ts';

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'))

export default {
  input: `src/main.ts`,
  output: [
    { file: pkg.main, name: "Waterbox", format: 'umd' },
    { file: pkg.module, format: 'es' },
    { file: pkg.browser, name: "Waterbox", format: 'iife' }
  ],
  // Indicate here external modules you don't wanna include in your bundle (i.e.: 'lodash')
  external: [],
  watch: {
    include: ['src/**', 'usage.md', 'index.layout.html'],
  },
  plugins: [
    // Allow json resolution
    json(),
    // Compile TypeScript files: use separate tsconfig for watch vs build
    typescript(),

    // Allow bundling cjs modules (unlike webpack, rollup doesn't understand cjs)
    commonjs(),
    // Allow node_modules resolution, so you can use 'external' to control
    // which external modules to include in the bundle
    // https://github.com/rollup/rollup-plugin-node-resolve#usage
    resolve(),

    ...(!process.env.ROLLUP_WATCH ? [
      terser({
        format: {
          comments: false,
        },
        module: false,
        ecma: 2020,
      }),
    ] : []),

    copy({
      targets: [
        { src: pkg.browser, dest: "dist/public", rename: "waterbox-canvas.js", },
      ],
      hook: "writeBundle",
      copySync: true,
    }),

    renderLayout({
      source: "usage.md",
      layout: "index.layout.html",
      html: true,
      output: "dist/public/index.html",
    }),

    // Serve and live reload only in watch mode
    ...(process.env.ROLLUP_WATCH ? [
      serve({
        open: true,
        contentBase: 'dist/public',
        openPage: '/',
        port: 3000,
      }),
      livereload(),
    ] : []),
  ],
}
