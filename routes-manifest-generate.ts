// HACK: This is a workaround for the fact that Deno Deploy doesn't allow
// dynamic imports. Instead, we dynamically generate our own manifest which
// statically imports all the route modules. If dynamic imports are ever
// allowed, this can be removed.
// adapted from: https://github.com/denoland/deploy_feedback/issues/1#issuecomment-1162484357

const getRoutes = async (dir: string): Promise<Array<string>> => {
  const entries = Deno.readDir(dir);
  const routes = [] as Array<string>;

  for await (const entry of entries) {
    const path = `${dir}/${entry.name}`;

    if (entry.isFile && path.endsWith('.ts')) {
      routes.push(path);
    } else if (entry.isDirectory) {
      const nestedRoutes = await getRoutes(path);
      nestedRoutes.forEach((path) => {
        routes.push(path);
      });
    }
  }

  return routes;
}

const writeManifest = async () => {
  const routes = await getRoutes('./plugins');
  const moduleIdentifier = (module: string) =>
      '_' + module.replaceAll(/[/.\[\]]/g, '_')

  const manifest = `
  // THIS FILE IS AUTO-GENERATED BY \`routes-manifest-generate.ts\`!

  ${routes.map((module) =>
      `import ${moduleIdentifier(module)} from '${module}';`).join('\n')}

  type Route = { default: (request: Request) => Response }

  const routes: {[key: string]: Route} = {
  ${routes.map((module) =>
          `    ['${module}']: { default: ${moduleIdentifier(module)} }`).join(',\n')}
  }

  export default (module: string) => routes[module]
  `

  Deno.writeTextFileSync('routes-manifest.ts', manifest)
}

writeManifest();