export const LETTER_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'] as const
export type LetterSize = (typeof LETTER_SIZES)[number]

const NUM_TO_LETTER: Record<string, string> = {
  '1': 'XS',
  '2': 'S',
  '3': 'M',
  '4': 'L',
  '5': 'XL',
  '6': 'XXL',
}

const LETTER_TO_NUM: Record<string, string> = {
  XS: '1',
  S: '2',
  M: '3',
  L: '4',
  XL: '5',
  XXL: '6',
}

/** '1' → 'XS', '2' → 'S', etc. Si no hay mapeo, devuelve el valor original. */
export function numToLetter(num: string): string {
  return NUM_TO_LETTER[num] ?? num
}

/** 'XS' → '1', 'S' → '2', etc. Si no hay mapeo, devuelve el valor original. */
export function letterToNum(letter: string): string {
  return LETTER_TO_NUM[letter] ?? letter
}
