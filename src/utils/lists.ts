const listWithOr = new Intl.ListFormat('en', { type: 'disjunction' })

/** A list of choices as a sentence: "django, express, or fastapi". */
export function orList(items: string[]): string {
  return listWithOr.format(items)
}
