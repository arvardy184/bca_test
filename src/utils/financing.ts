export interface FinancingInput {
  vehiclePrice: number
  downPayment: number
  tenor: number
  interestRate: number
  insurance: number
}

export interface FinancingResult {
  financedAmount: number
  estimatedInstallment: number
}

export function calculateFinancing(input: FinancingInput): FinancingResult {
  const financedAmount = input.vehiclePrice - input.downPayment
  const totalInterest = financedAmount * (input.interestRate / 100) * (input.tenor / 12)
  const totalPayable = financedAmount + totalInterest + input.insurance
  const estimatedInstallment = Math.round(totalPayable / input.tenor)
  return { financedAmount, estimatedInstallment }
}
