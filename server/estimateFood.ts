import Anthropic from '@anthropic-ai/sdk'

/**
 * Turns a typed phrase ("200g chicken breast", "two eggs and toast") into a
 * calorie and protein estimate.
 *
 * This runs server-side only — in dev it's mounted by the Vite plugin in
 * vite.config.ts, so ANTHROPIC_API_KEY never reaches the browser bundle. To
 * deploy, drop this same function behind a serverless route.
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
  // blowing up when the dev server boots.
  client ??= new Anthropic()
  return client
}

export async function estimateFood(query: string): Promise<FoodEstimate> {
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
