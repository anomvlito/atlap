/**
 * Empaqueta cada función serverless de api/ en un .js standalone.
 * Los archivos en api/_lib/ se inline dentro de cada bundle.
 * Los paquetes de node_modules se marcan como externos (Vercel los instala).
 */
import { build } from 'esbuild'
import { glob } from 'glob'

const entryPoints = await glob('api/**/*.ts', {
  ignore: ['api/_lib/**'],
})

if (entryPoints.length === 0) {
  console.log('No API entry points found.')
  process.exit(0)
}

console.log(`Bundling ${entryPoints.length} API functions...`)

await build({
  entryPoints,
  bundle: true,
  platform: 'node',
  target: 'node20',
  format: 'esm',
  outdir: '.',
  outbase: '.',
  packages: 'external',
  allowOverwrite: true,
})

console.log('API bundle complete.')
