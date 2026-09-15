export function maskNIK(nik: string): string {
  if (nik.length !== 16) return nik
  return `${nik.slice(0, 4)}********${nik.slice(-4)}`
}
