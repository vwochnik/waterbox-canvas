import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { Liquid } from 'liquidjs';
import matter from 'gray-matter';
import { marked } from 'marked';
import { mkdir } from 'node:fs/promises';
import type { Plugin } from 'rollup';

export interface RenderLayoutOptions {
  source: string;
  layout: string;
  output: string;
  html: boolean;
}

export function renderLayout(options: RenderLayoutOptions): Plugin {
  const sourcePath = resolve(options.source);
  const layoutPath = resolve(options.layout);
  const outputPath = resolve(options.output);

  return {
    name: 'render-layout',

    async buildStart() {
      // Tell Rollup to watch this file
      this.addWatchFile(sourcePath);
      this.addWatchFile(layoutPath);

      await processFile();
    },

    async watchChange(id) {
      if (resolve(id) === sourcePath || resolve(id) === layoutPath) {
        this.info(`Rebuilding from ${id}`);
        await processFile();
      }
    },
  };

  async function processFile() {
    doRenderLayout(sourcePath, layoutPath, options.html, outputPath);
  }
}

export async function doRenderLayout(
  sourceFile: string,
  layoutFile: string,
  layoutIsHtml: boolean,
  outputFile: string,
) {
  const { content: sourceContent, data: sourceData } = parse(sourceFile);

  const renderedSource = await render(sourceContent, sourceData);

  const { content: layoutContent, data: layoutData } = parse(layoutFile);

  await mkdir(dirname(outputFile), { recursive: true });

  await renderToFile(outputFile, layoutContent, {
    ...layoutData,
    ...sourceData,
    content: layoutIsHtml ? await marked.parse(renderedSource) : renderedSource,
  });
}

function parse(fileName: string): { content: string; data: Record<string, any> } {
  console.log(`Parsing ${fileName}...`);
  const rawContent = readFileSync(resolve(process.cwd(), fileName), 'utf-8');

  const { data, content } = matter(rawContent);

  return {
    content,
    data,
  };
}

async function render(content: string, data: Record<string, any>): Promise<string> {
  const engine = new Liquid();

  return engine.parseAndRender(content, data);
}

async function renderToFile(fileName: string, content: string, data: Record<string, any>) {
  console.log(`Rendering ${fileName}...`);
  const rendered = await render(content, data);
  writeFileSync(resolve(process.cwd(), fileName), rendered);
}
