import type { IncomingMessage, ServerResponse } from 'node:http'

import Anthropic from '@anthropic-ai/sdk'

/**
 * Food estimation, running server-side only.
 *
 * Deployed on Vercel this is a serverless function at POST /api/estimate-food.
 * In local dev the same `estimate()` below is mounted on the Vite dev server
 * (see vite.config.ts), so there is one implementation and one code path.
 *
 * The Anthropic key is read from the ANTHROPIC_API_KEY environment variable and
 * never leaves this file — nothing here is imported by anything under src/, so
 * it cannot end up in the browser bundle.
 */

export interface FoodEstimate {
  name: string
  /** How this food is portioned. Decided here, once, and remembered after. */
  portion_type: 'unit' | 'weight'
  /** Singular unit name for counted foods; empty string for weighed ones. */
  unit_name: string
  /** Calories per single unit, or per 100 g. */
  calories_per: number
  /** Protein per single unit, or per 100 g. */
  protein_per: number
  /** Count (usually 1) for counted foods, or a typical gram serving. */
  default_amount: number
  /** False when the portion had to be assumed rather than being stated. */
  confident: boolean
}

const SCHEMA = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      description:
        'Tidied-up food name in title case, with NO quantity or weight in it — "Chicken breast", never "200g chicken breast". Max 40 characters.',
    },
    portion_type: {
      type: 'string',
      enum: ['unit', 'weight'],
      description:
        'Use "unit" for foods eaten as whole countable things (eggs, chicken breasts, protein bars, bananas, slices of pizza). Use "weight" for foods eaten in amounts that are measured out (rice, pasta, ground beef, yogurt, oats).',
    },
    unit_name: {
      type: 'string',
      description:
        'For portion_type "unit", the singular name of one unit in lowercase: "egg", "breast", "bar", "slice". Empty string when portion_type is "weight".',
    },
    calories_per: {
      type: 'integer',
      description:
        'Kilocalories in ONE unit when portion_type is "unit", or in 100 g when portion_type is "weight".',
    },
    protein_per: {
      type: 'integer',
      description:
        'Grams of protein in ONE unit when portion_type is "unit", or in 100 g when portion_type is "weight".',
    },
    default_amount: {
      type: 'integer',
      description:
        'The amount to pre-fill. For "unit", the number of units the user described, or 1 if unstated. For "weight", the grams they described, or a typical serving if unstated.',
    },
    confident: {
      type: 'boolean',
      description: 'False if the portion size had to be assumed rather than being stated.',
    },
  },
  required: [
    'name',
    'portion_type',
    'unit_name',
    'calories_per',
    'protein_per',
    'default_amount',
    'confident',
  ],
  additionalProperties: false,
} as const

const SYSTEM = [
  'You estimate the calories and protein in a food, and decide how that food is portioned.',
  'Counted foods are eaten as whole things — report calories and protein for ONE unit.',
  'Weighed foods are measured out — report calories and protein per 100 g.',
  'The app multiplies your per-portion figures by an amount the user picks, so they must be for a single unit or 100 g exactly, never for the whole quantity described.',
  'Round calories to the nearest 5 and protein to the nearest gram.',
  'Only calories and protein matter — ignore other macros.',
].join(' ')

let client: Anthropic | null = null

function getClient(): Anthropic {
  // Constructed lazily so a missing key surfaces as a clean 503 rather than
  // blowing up when the function cold-starts.
  client ??= new Anthropic()
  return client
}

export async function estimate(query: string): Promise<FoodEstimate> {
  const response = await getClient().beta.messages.create({
    model: 'claude-opus-5',
    max_tokens: 1024,
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    system: SYSTEM,
    output_config: {
      // A short extraction — low effort keeps the search box snappy.
      effort: 'low',
      format: { type: 'json_schema', schema: SCHEMA },
    },
    messages: [{ role: 'user', content: query }],
  })

  if (response.stop_reason === 'refusal') {
    throw new Error('The model declined to estimate that.')
  }

  const text = response.content.find((b) => b.type === 'text')
  if (!text || text.type !== 'text') throw new Error('No estimate returned.')

  const parsed = JSON.parse(text.text) as FoodEstimate
  const portionType = parsed.portion_type === 'unit' ? 'unit' : 'weight'

  return {
    name: String(parsed.name).slice(0, 40),
    portion_type: portionType,
    unit_name: portionType === 'unit' ? String(parsed.unit_name || 'serving').slice(0, 20) : '',
    calories_per: Math.max(0, Math.round(parsed.calories_per)),
    protein_per: Math.max(0, Math.round(parsed.protein_per)),
    default_amount: Math.max(1, Math.round(parsed.default_amount)),
    confident: Boolean(parsed.confident),
  }
}

/** Vercel passes a Node request/response pair; no framework types needed. */
type Req = IncomingMessage & { body?: unknown }

async function readBody(req: Req): Promise<unknown> {
  // Vercel parses JSON bodies for us, but the dev server doesn't, so fall back
  // to draining the stream.
  if (req.body !== undefined && req.body !== null && req.body !== '') return req.body
  const chunks: Buffer[] = []
  for await (const chunk of req) chunks.push(chunk as Buffer)
  const raw = Buffer.concat(chunks).toString()
  return raw ? JSON.parse(raw) : {}
}

export default async function handler(req: Req, res: ServerResponse): Promise<void> {
  const send = (status: number, body: unknown) => {
    res.statusCode = status
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify(body))
  }

  if (req.method !== 'POST') return send(405, { error: 'Use POST.' })

  if (!process.env.ANTHROPIC_API_KEY) {
    return send(503, { error: 'ANTHROPIC_API_KEY is not set on the server.' })
  }

  try {
    const parsed = await readBody(req)
    const query = (parsed as { query?: unknown }).query

    if (typeof query !== 'string' || !query.trim()) {
      return send(400, { error: 'Missing query.' })
    }

    send(200, await estimate(query.trim().slice(0, 200)))
  } catch (err) {
    send(502, { error: err instanceof Error ? err.message : 'Estimate failed.' })
  }
}
