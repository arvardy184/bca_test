export function isValidNIK(value: string): boolean {
  return /^\d{16}$/.test(value)
}

export function isValidPhone(value: string): boolean {
  return /^(\+62|62|0)8\d{8,11}$/.test(value)
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export function isValidIncome(value: string): boolean {
  return /^\d+$/.test(value) && Number(value) > 0
}
