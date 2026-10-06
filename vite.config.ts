import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * Mounts POST /api/estimate-food on the dev server.
 *
 * The Anthropic call happens here, in Node, so ANTHROPIC_API_KEY is never
 * shipped to the browser. For a real deployment, move server/estimateFood.ts
 * behind a serverless function at the same path — the client doesn't care.
 */
function foodEstimateApi(env: Record<string, string>): Plugin {
  return {
    name: 'food-estimate-api',
    configureServer(server) {
      server.middlewares.use('/api/estimate-food', async (req, res) => {
        const send = (status: number, body: unknown) => {
          res.statusCode = status
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(body))
        }

        if (req.method !== 'POST') return send(405, { error: 'Use POST.' })

        if (!env.ANTHROPIC_API_KEY) {
          return send(503, {
            error: 'No ANTHROPIC_API_KEY set — copy .env.example to .env.local and add your key.',
          })
        }
        process.env.ANTHROPIC_API_KEY = env.ANTHROPIC_API_KEY

        try {
          const chunks: Buffer[] = []
          for await (const chunk of req) chunks.push(chunk as Buffer)
          const { query } = JSON.parse(Buffer.concat(chunks).toString() || '{}')

          if (typeof query !== 'string' || !query.trim()) {
            return send(400, { error: 'Missing query.' })
          }

          const { estimateFood } = await server.ssrLoadModule('/server/estimateFood.ts')
          send(200, await estimateFood(query.trim().slice(0, 200)))
        } catch (err) {
          send(502, { error: err instanceof Error ? err.message : 'Estimate failed.' })
        }
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
