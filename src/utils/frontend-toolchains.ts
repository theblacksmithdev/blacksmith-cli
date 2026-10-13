import path from 'node:path'
import type { FrontendFramework } from './paths.js'
import { orList } from './lists.js'
import { describeNodeFloors, installedNodeVersion, meetsNodeFloors, type NodeVersionFloor } from './node-version.js'

/**
 * Everything the CLI's commands need to know to drive one frontend framework.
 * Commands look the framework up here; none of them branch on its name.
 *
 * Every frontend runs on Node with Vite and Vitest, so `dev`, `test`, `build`
 * and the npm passthrough are the same for all of them and are not listed.
 */
export interface FrontendToolchain {
  label: string
  /** The module `index.html` loads. */
  entry: string
  /** The `@hey-api/openapi-ts` plugin that generates the TanStack Query helpers. */
  queryPlugin: string
  /** The Node.js versions its toolchain needs, beyond the CLI's own; null when any will do. */
  nodeVersions: NodeVersionFloor[] | null
  /** The UI kit's documentation, offered as an MCP server by `setup:mcp`. */
  docs: { id: string; name: string; description: string; url: string }
  /** What `make:resource` adds to the frontend, beyond the page under `src/pages/`. */
  resource: {
    /** Where the resource's query and mutation code goes, under `src/`. */
    apiDir: string
    /** How that code is named in the CLI's output. */
    apiLabel: string
    /** The router file the resource's routes are registered in, under `src/`. */
    routesFile: string
  }
}

export const FRONTEND_TOOLCHAINS: Record<FrontendFramework, FrontendToolchain> = {
  react: {
    label: 'React',
    entry: '/src/main.tsx',
    queryPlugin: '@tanstack/react-query',
    nodeVersions: null,
    docs: {
      id: 'chakra-ui-docs',
      name: 'Chakra UI Docs',
      description: 'Chakra UI component documentation for AI assistance',
      url: 'https://www.chakra-ui.com/docs',
    },
    resource: {
      apiDir: path.join('api', 'hooks'),
      apiLabel: 'API hooks',
      routesFile: path.join('router', 'routes.tsx'),
    },
  },
  vue: {
    label: 'Vue',
    entry: '/src/main.ts',
    queryPlugin: '@tanstack/vue-query',
    // Nuxt UI 4 and @vitejs/plugin-vue 6: `^20.19.0 || >=22.12.0`
    nodeVersions: [
      { major: 20, minor: 19 },
      { major: 22, minor: 12 },
    ],
    docs: {
      id: 'nuxt-ui-docs',
      name: 'Nuxt UI Docs',
      description: 'Nuxt UI component documentation for AI assistance',
      url: 'https://ui.nuxt.com/docs',
    },
    resource: {
      apiDir: path.join('api', 'composables'),
      apiLabel: 'API composables',
      routesFile: path.join('router', 'routes.ts'),
    },
  },
}

/** Every framework `--frontend` accepts, in the order they are offered. */
export const FRONTEND_FRAMEWORKS = Object.keys(FRONTEND_TOOLCHAINS) as FrontendFramework[]

/** The frameworks as a sentence: "react or vue". */
export const FRONTEND_FRAMEWORK_CHOICES = orList(FRONTEND_FRAMEWORKS)

/** The file `sync` generates the TanStack Query helpers into, under `src/api/generated/`. */
export function queryModuleFile(framework: FrontendFramework): string {
  return `${FRONTEND_TOOLCHAINS[framework].queryPlugin}.gen.ts`
}

/**
 * Why the installed Node.js cannot build this frontend, or null when it can
 * (or the frontend has no requirement beyond the CLI's own).
 */
export async function unsupportedNodeVersion(toolchain: FrontendToolchain): Promise<string | null> {
  if (!toolchain.nodeVersions) return null
  const version = await installedNodeVersion()
  if (version && meetsNodeFloors(version, toolchain.nodeVersions)) return null

  const found = version ? ` (found ${version.major}.${version.minor})` : ''
  return `${toolchain.label} needs Node.js ${describeNodeFloors(toolchain.nodeVersions)}${found}. Install a current Node.js LTS from https://nodejs.org`
}
