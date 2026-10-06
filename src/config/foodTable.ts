/**
 * The local food list.
 *
 * Two jobs: it powers the type-ahead suggestions under the search bar, and it's
 * the offline fallback when a Claude estimate isn't available (no API key, no
 * network, or the request failed).
 *
 * Calories and protein are per 100 g. `serving` is the default portion used
 * when you don't type a weight; `unit`/`unitGrams` mark things you count rather
 * than weigh. Add rows freely — everything else keys off this list.
 */

import type { FoodBasis } from '../lib/food'

export interface FoodRow {
  /** Extra words that should match this row, lowercase. The label is matched too. */
  keywords: string[]
  label: string
  /** Per 100 g. */
  calories: number
  protein: number
  /** A countable item ("egg", "banana") and what one of them weighs. */
  unit?: string
  unitGrams?: number
  /** Typical serving in grams, used when no quantity is typed. */
  serving?: number
}

export const FOOD_TABLE: FoodRow[] = [
  // Meat, fish, eggs
  { keywords: ['chicken'], label: 'Chicken breast', calories: 165, protein: 31, serving: 150 },
  { keywords: ['thigh'], label: 'Chicken thigh', calories: 209, protein: 26, serving: 150 },
  { keywords: ['mince', 'minced beef'], label: 'Ground beef', calories: 250, protein: 26, serving: 150 },
  { keywords: ['steak'], label: 'Beef steak', calories: 271, protein: 25, serving: 200 },
  { keywords: ['mutton'], label: 'Lamb', calories: 294, protein: 25, serving: 150 },
  { keywords: ['turkey'], label: 'Turkey breast', calories: 135, protein: 30, serving: 150 },
  { keywords: [], label: 'Salmon', calories: 208, protein: 20, serving: 150 },
  { keywords: [], label: 'Tuna', calories: 132, protein: 28, serving: 120 },
  { keywords: ['prawns'], label: 'Shrimp', calories: 99, protein: 24, serving: 150 },
  { keywords: ['whitefish'], label: 'Cod', calories: 82, protein: 18, serving: 150 },
  { keywords: [], label: 'Sardines', calories: 208, protein: 25, serving: 100 },
  { keywords: [], label: 'Egg', calories: 155, protein: 13, unit: 'egg', unitGrams: 50 },
  { keywords: ['egg whites'], label: 'Egg white', calories: 52, protein: 11, serving: 100 },

  // Dairy
  { keywords: ['milk'], label: 'Whole milk', calories: 61, protein: 3.2, serving: 250 },
  { keywords: ['low fat milk'], label: 'Skim milk', calories: 34, protein: 3.4, serving: 250 },
  { keywords: ['yogurt', 'yoghurt'], label: 'Greek yogurt', calories: 97, protein: 9, serving: 200 },
  { keywords: ['cheese'], label: 'Cheddar cheese', calories: 403, protein: 25, serving: 30 },
  { keywords: [], label: 'Mozzarella', calories: 300, protein: 22, serving: 30 },
  { keywords: [], label: 'Cottage cheese', calories: 98, protein: 11, serving: 200 },
  { keywords: [], label: 'Feta', calories: 264, protein: 14, serving: 30 },
  { keywords: [], label: 'Labneh', calories: 174, protein: 9, serving: 60 },
  { keywords: [], label: 'Cream cheese', calories: 342, protein: 6, serving: 30 },
  { keywords: [], label: 'Butter', calories: 717, protein: 0.9, serving: 10 },

  // Fruit
  { keywords: [], label: 'Apple', calories: 52, protein: 0.3, unit: 'apple', unitGrams: 180 },
  { keywords: [], label: 'Banana', calories: 89, protein: 1.1, unit: 'banana', unitGrams: 118 },
  { keywords: [], label: 'Orange', calories: 47, protein: 0.9, unit: 'orange', unitGrams: 130 },
  { keywords: ['strawberries'], label: 'Strawberry', calories: 32, protein: 0.7, serving: 150 },
  { keywords: ['blueberries'], label: 'Blueberry', calories: 57, protein: 0.7, serving: 100 },
  { keywords: ['grape'], label: 'Grapes', calories: 69, protein: 0.7, serving: 150 },
  { keywords: [], label: 'Watermelon', calories: 30, protein: 0.6, serving: 280 },
  { keywords: [], label: 'Mango', calories: 60, protein: 0.8, serving: 200 },
  { keywords: [], label: 'Pineapple', calories: 50, protein: 0.5, serving: 165 },
  { keywords: [], label: 'Peach', calories: 39, protein: 0.9, serving: 150 },
  { keywords: [], label: 'Pear', calories: 57, protein: 0.4, serving: 180 },
  { keywords: [], label: 'Kiwi', calories: 61, protein: 1.1, unit: 'kiwi', unitGrams: 75 },
  { keywords: ['dates'], label: 'Date', calories: 282, protein: 2.5, unit: 'date', unitGrams: 8 },
  { keywords: [], label: 'Avocado', calories: 160, protein: 2, serving: 150 },
  { keywords: [], label: 'Pomegranate', calories: 83, protein: 1.7, serving: 150 },
  { keywords: ['melon'], label: 'Cantaloupe', calories: 34, protein: 0.8, serving: 160 },
  { keywords: [], label: 'Cherries', calories: 63, protein: 1.1, serving: 140 },
  { keywords: [], label: 'Apricot', calories: 48, protein: 1.4, serving: 100 },
  { keywords: [], label: 'Fig', calories: 74, protein: 0.8, serving: 100 },
  { keywords: [], label: 'Raisins', calories: 299, protein: 3.1, serving: 40 },

  // Vegetables
  { keywords: [], label: 'Broccoli', calories: 34, protein: 2.8, serving: 150 },
  { keywords: [], label: 'Spinach', calories: 23, protein: 2.9, serving: 100 },
  { keywords: [], label: 'Carrot', calories: 41, protein: 0.9, serving: 120 },
  { keywords: [], label: 'Tomato', calories: 18, protein: 0.9, serving: 150 },
  { keywords: [], label: 'Cucumber', calories: 15, protein: 0.7, serving: 150 },
  { keywords: ['capsicum', 'pepper'], label: 'Bell pepper', calories: 31, protein: 1, serving: 120 },
  { keywords: [], label: 'Onion', calories: 40, protein: 1.1, serving: 100 },
  { keywords: ['salad'], label: 'Lettuce', calories: 15, protein: 1.4, serving: 100 },
  { keywords: [], label: 'Sweet potato', calories: 86, protein: 1.6, serving: 200 },
  { keywords: ['sweetcorn'], label: 'Corn', calories: 86, protein: 3.3, serving: 150 },
  { keywords: [], label: 'Peas', calories: 81, protein: 5.4, serving: 150 },
  { keywords: [], label: 'Green beans', calories: 31, protein: 1.8, serving: 150 },
  { keywords: [], label: 'Cauliflower', calories: 25, protein: 1.9, serving: 150 },
  { keywords: ['courgette'], label: 'Zucchini', calories: 17, protein: 1.2, serving: 150 },
  { keywords: ['aubergine'], label: 'Eggplant', calories: 25, protein: 1, serving: 150 },
  { keywords: ['mushrooms'], label: 'Mushroom', calories: 22, protein: 3.1, serving: 100 },
  { keywords: [], label: 'Cabbage', calories: 25, protein: 1.3, serving: 100 },
  { keywords: ['bamia'], label: 'Okra', calories: 33, protein: 1.9, serving: 150 },

  // Grains and starches
  { keywords: ['white rice'], label: 'Rice (cooked)', calories: 130, protein: 2.7, serving: 200 },
  { keywords: [], label: 'Brown rice (cooked)', calories: 123, protein: 2.7, serving: 200 },
  { keywords: ['spaghetti', 'macaroni'], label: 'Pasta (cooked)', calories: 158, protein: 5.8, serving: 200 },
  { keywords: ['noodle'], label: 'Noodles (cooked)', calories: 138, protein: 4.5, serving: 200 },
  { keywords: ['toast', 'white bread'], label: 'Bread', calories: 265, protein: 9, serving: 60 },
  { keywords: ['brown bread'], label: 'Whole wheat bread', calories: 247, protein: 13, serving: 60 },
  { keywords: ['khubz'], label: 'Pita bread', calories: 275, protein: 9, unit: 'pita', unitGrams: 60 },
  { keywords: ['wrap'], label: 'Tortilla', calories: 306, protein: 8, unit: 'tortilla', unitGrams: 50 },
  { keywords: [], label: 'Bagel', calories: 250, protein: 10, unit: 'bagel', unitGrams: 100 },
  { keywords: ['potatoes'], label: 'Potato', calories: 87, protein: 2, serving: 200 },
  { keywords: ['fries', 'chips'], label: 'French fries', calories: 312, protein: 3.4, serving: 150 },
  { keywords: ['oatmeal', 'porridge'], label: 'Oats (dry)', calories: 379, protein: 13, serving: 60 },
  { keywords: [], label: 'Quinoa (cooked)', calories: 120, protein: 4.4, serving: 200 },
  { keywords: [], label: 'Couscous (cooked)', calories: 112, protein: 3.8, serving: 200 },
  { keywords: ['burghul'], label: 'Bulgur (cooked)', calories: 83, protein: 3.1, serving: 200 },
  { keywords: ['corn flakes', 'breakfast cereal'], label: 'Cereal', calories: 357, protein: 7, serving: 40 },
  { keywords: [], label: 'Granola', calories: 471, protein: 10, serving: 50 },

  // Legumes, nuts, seeds
  { keywords: ['lentil', 'daal'], label: 'Lentils (cooked)', calories: 116, protein: 9, serving: 200 },
  { keywords: ['garbanzo'], label: 'Chickpeas', calories: 164, protein: 8.9, serving: 200 },
  { keywords: [], label: 'Black beans', calories: 132, protein: 8.9, serving: 200 },
  { keywords: [], label: 'Kidney beans', calories: 127, protein: 8.7, serving: 200 },
  { keywords: [], label: 'Hummus', calories: 166, protein: 7.9, serving: 100 },
  { keywords: [], label: 'Falafel', calories: 333, protein: 13, serving: 100 },
  { keywords: [], label: 'Tofu', calories: 76, protein: 8, serving: 150 },
  { keywords: ['almond'], label: 'Almonds', calories: 579, protein: 21, serving: 30 },
  { keywords: ['peanut'], label: 'Peanuts', calories: 567, protein: 26, serving: 30 },
  { keywords: ['walnut'], label: 'Walnuts', calories: 654, protein: 15, serving: 30 },
  { keywords: ['cashew'], label: 'Cashews', calories: 553, protein: 18, serving: 30 },
  { keywords: ['pistachio'], label: 'Pistachios', calories: 560, protein: 20, serving: 30 },
  { keywords: [], label: 'Peanut butter', calories: 588, protein: 25, serving: 32 },
  { keywords: [], label: 'Chia seeds', calories: 486, protein: 17, serving: 20 },

  // Dishes and takeaway
  { keywords: [], label: 'Shawarma', calories: 250, protein: 18, serving: 250 },
  { keywords: ['kabsa'], label: 'Kabsa', calories: 180, protein: 9, serving: 350 },
  { keywords: [], label: 'Pizza', calories: 266, protein: 11, unit: 'slice', unitGrams: 120 },
  { keywords: ['cheeseburger'], label: 'Burger', calories: 295, protein: 17, serving: 200 },

  // Fats, sweets, drinks, supplements
  { keywords: ['oil'], label: 'Olive oil', calories: 884, protein: 0, serving: 15 },
  { keywords: [], label: 'Mayonnaise', calories: 680, protein: 1, serving: 15 },
  { keywords: [], label: 'Honey', calories: 304, protein: 0.3, serving: 20 },
  { keywords: ['chocolate'], label: 'Dark chocolate', calories: 546, protein: 5, serving: 30 },
  { keywords: [], label: 'Ice cream', calories: 207, protein: 3.5, serving: 100 },
  { keywords: ['biscuit'], label: 'Cookie', calories: 480, protein: 5, unit: 'cookie', unitGrams: 30 },
  { keywords: ['crisps'], label: 'Potato chips', calories: 536, protein: 7, serving: 30 },
  { keywords: ['oj'], label: 'Orange juice', calories: 45, protein: 0.7, serving: 250 },
  { keywords: ['soft drink', 'cola'], label: 'Soda', calories: 41, protein: 0, serving: 330 },
  { keywords: ['whey'], label: 'Whey shake', calories: 400, protein: 80, unit: 'scoop', unitGrams: 30 },
  { keywords: [], label: 'Protein bar', calories: 367, protein: 33, unit: 'bar', unitGrams: 60 },
]

const WORD_NUMBERS: Record<string, number> = {
  one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, half: 0.5,
}

/** Do all of `q`'s letters appear in `text`, in order? "chkn" -> "chicken". */
function isSubsequence(q: string, text: string): boolean {
  let i = 0
  for (const ch of text) {
    if (ch === q[i]) i += 1
    if (i === q.length) return true
  }
  return false
}

/**
 * The typed word plus its singular form, so "eggs" finds "Egg" and "bananas"
 * finds "Banana". The other direction is already covered, since "grape" is a
 * prefix of "Grapes".
 */
function variants(token: string): string[] {
  const out = [token]
  if (token.length > 4 && token.endsWith('es')) out.push(token.slice(0, -2))
  if (token.length > 3 && token.endsWith('s')) out.push(token.slice(0, -1))
  return out
}

function scoreOne(text: string, token: string): number | null {
  if (text.startsWith(token)) return 0
  // Start of any word inside the label — "breast" matches "Chicken breast".
  if (text.split(/[\s()/-]+/).some((w) => w.startsWith(token))) return 1
  if (text.includes(token)) return 2
  // Skip-letter matching only once there's enough typed to be meaningful,
  // otherwise a single letter would match nearly everything.
  if (token.length >= 3 && isSubsequence(token, text)) return 3
  return null
}

/**
 * How well one typed word matches one candidate string. Lower is better;
 * null means no match at all.
 */
function scoreTerm(text: string, token: string): number | null {
  let best: number | null = null
  for (const v of variants(token)) {
    const s = scoreOne(text, v)
    if (s !== null && (best === null || s < best)) best = s
  }
  return best
}

/**
 * Cost of a word that matches nothing. Larger than the worst real match (3), so
 * a row matching every word always outranks one matching only some.
 */
const UNMATCHED_PENALTY = 5

/**
 * Score one row against a whole query. Unmatched words are penalised rather
 * than disqualifying, so "chicken shawarma" still finds Shawarma; null only
 * when nothing matched at all.
 */
function scoreRow(row: FoodRow, tokens: string[]): number | null {
  const terms = [row.label.toLowerCase(), ...row.keywords]
  let total = 0
  let matched = 0

  for (const token of tokens) {
    let best: number | null = null
    for (const term of terms) {
      const s = scoreTerm(term, token)
      if (s !== null && (best === null || s < best)) best = s
    }
    if (best === null) {
      total += UNMATCHED_PENALTY
    } else {
      total += best
      matched += 1
    }
  }

  return matched > 0 ? total : null
}

function rank(tokens: string[], limit: number): FoodRow[] {
  if (tokens.length === 0) return []

  const scored: { row: FoodRow; score: number }[] = []
  for (const row of FOOD_TABLE) {
    const score = scoreRow(row, tokens)
    if (score !== null) scored.push({ row, score })
  }

  scored.sort(
    (a, b) =>
      a.score - b.score ||
      // Prefer the shorter name when two score the same — it's usually the
      // thing you meant.
      a.row.label.length - b.row.label.length ||
      a.row.label.localeCompare(b.row.label),
  )

  return scored.slice(0, limit).map((s) => s.row)
}

/**
 * Type-ahead suggestions.
 *
 * The more exactly a word matches the higher the row ranks: whole-label prefix
 * first, then word-start, then anywhere in the string, then skip-letter matches
 * so a partial or fumbled spelling ("chkn", "pnut") still finds the food.
 * Quantities are ignored, so "200g chicken" suggests the same as "chicken".
 */
export function suggestFoods(query: string, limit = 5): FoodRow[] {
  return rank(matchableTokens(query.toLowerCase().trim()), limit)
}

/** Quantities are parsed separately, so they mustn't take part in matching. */
function matchableTokens(q: string): string[] {
  return q
    .replace(/\d+(\.\d+)?\s*(kg|g|grams?|ml|l|oz|cups?|tbsp|tsp)?/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 0 && !(t in WORD_NUMBERS))
}

export interface LocalEstimate extends FoodBasis {
  defaultAmount: number
}

/**
 * The nutrition basis for a row: per single unit for countable foods, per 100 g
 * for everything else. Rows carry per-100g figures, so counted foods are
 * converted using their unit weight.
 */
export function basisFor(row: FoodRow): FoodBasis {
  if (row.unit) {
    const grams = row.unitGrams ?? 100
    return {
      name: row.label,
      portionType: 'unit',
      unitName: row.unit,
      perCalories: Math.round((row.calories * grams) / 100),
      perProtein: Math.round((row.protein * grams) / 100),
    }
  }
  return {
    name: row.label,
    portionType: 'weight',
    perCalories: Math.round(row.calories),
    perProtein: Math.round(row.protein),
  }
}

/** The amount to pre-fill for a row when nothing was typed. */
export function defaultAmountFor(row: FoodRow): number {
  return row.unit ? 1 : (row.serving ?? 100)
}

/**
 * Best-effort local estimate. Returns null when nothing matches, so the caller
 * can ask for a manual entry instead of inventing numbers.
 */
export function localEstimate(query: string): LocalEstimate | null {
  const q = query.toLowerCase().trim()

  // Rank rather than taking the first keyword hit, so "chicken shawarma"
  // resolves to Shawarma and not to Chicken breast.
  const row = rank(matchableTokens(q), 1)[0]
  if (!row) return null

  const basis = basisFor(row)
  const grams = q.match(/(\d+(?:\.\d+)?)\s*(g|gram|grams)\b/)
  const bareNumber = q.match(/(?:^|\s)(\d+(?:\.\d+)?)(?!\s*(?:g|gram|kcal|cal))/)
  const wordNumber = Object.keys(WORD_NUMBERS).find((w) => q.includes(w))

  let defaultAmount: number
  if (basis.portionType === 'unit') {
    // A typed weight on a counted food is converted back into whole units.
    defaultAmount = grams
      ? Math.max(1, Math.round(Number(grams[1]) / (row.unitGrams ?? 100)))
      : Number(bareNumber?.[1]) || (wordNumber ? WORD_NUMBERS[wordNumber] : 1)
  } else {
    defaultAmount = grams ? Number(grams[1]) : (row.serving ?? 100)
  }

  return { ...basis, defaultAmount: Math.max(1, Math.round(defaultAmount)) }
}
