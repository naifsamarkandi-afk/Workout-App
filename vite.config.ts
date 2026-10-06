import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * Mounts POST /api/estimate-food on the dev server, using the very same
 * `estimate()` that the Vercel serverless function calls in production — so
 * there's one implementation, and local dev exercises the real code path.
 *
 * The Anthropic call happens here in Node, so ANTHROPIC_API_KEY is never
 * shipped to the browser.
 */
function foodEstimateApi(env: Record<string, string>): Plugin {
  return {
    name: 'food-estimate-api',
    configureServer(server) {
      server.middlewares.use('/api/estimate-food', async (req, res) => {
        if (!env.ANTHROPIC_API_KEY) {
          res.statusCode = 503
          res.setHeader('Content-Type', 'application/json')
          res.end(
            JSON.stringify({
              error:
                'No ANTHROPIC_API_KEY set — copy .env.example to .env.local and add your key.',
            }),
          )
          return
        }
        process.env.ANTHROPIC_API_KEY = env.ANTHROPIC_API_KEY

        const mod = await server.ssrLoadModule('/api/estimate-food.ts')
        await mod.default(req, res)
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react(), foodEstimateApi(env)],
    server: {
      // Handy for opening the app on a phone on the same wifi.
      host: true,
    },
  }
})
