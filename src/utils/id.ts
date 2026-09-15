let counter = 0

export function generateId(prefix: string): string {
  counter += 1
  return `${prefix}-${Date.now()}-${counter}`
}

export function generateApplicationCode(year: number, sequence: number): string {
  return `APP-${year}-${String(sequence).padStart(5, '0')}`
}
