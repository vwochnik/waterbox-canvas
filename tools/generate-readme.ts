import * as fs from 'fs';
import * as path from 'path';
import { Liquid } from 'liquidjs';
import matter from 'gray-matter';
import { marked } from 'marked';

async function main() {
  const { content: sourceContent, data: sourceData } = parse("usage.md");

  const renderedSource = await render(sourceContent, sourceData);

  const { content: readmeLayoutContent, data: readmeLayoutData } = parse("README.layout.md");

  await renderToFile("README.md", readmeLayoutContent, {
    ...readmeLayoutData,
    ...sourceData,
    content: renderedSource,
  });

  const { content: indexLayoutContent, data: indexLayoutData } = parse("index.layout.html");

  await renderToFile("index.html", indexLayoutContent, {
    ...indexLayoutData,
    ...sourceData,
    content: await marked.parse(renderedSource),
  });

}

function parse(fileName: string): { content: string, data: Record<string, any> } {
  console.log(`Parsing ${fileName}...`);
  const rawContent = fs.readFileSync(path.resolve(process.cwd(), fileName), 'utf-8');

  const { data, content } = matter(rawContent);

  return {
    content,
    data
  };
}

async function render(content: string, data: Record<string, any>): Promise<string> {
  const engine = new Liquid();

  return engine.parseAndRender(content, data);
}

async function renderToFile(fileName: string, content: string, data: Record<string, any>) {
  console.log(`Rendering ${fileName}...`);
  const rendered = await render(content, data);
  fs.writeFileSync(path.resolve(process.cwd(), fileName), rendered);
}

main()
  .catch(e => console.error(e));
