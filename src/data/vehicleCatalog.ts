export const VEHICLE_BRANDS = ['Toyota', 'Honda', 'Mitsubishi', 'Suzuki', 'Daihatsu'] as const

export const VEHICLE_COLORS = ['White', 'Black', 'Silver', 'Red', 'Gray']

export const VEHICLE_MODELS: Record<
  string,
  {
    models: string[]
    typesByModel: Record<string, string[]>
    basePrice: Record<string, number>
  }
> = {
  Toyota: {
    models: ['Avanza', 'Innova'],
    typesByModel: { Avanza: ['1.3 G MT', '1.5 Veloz CVT'], Innova: ['2.0 G MT', 'Zenix Hybrid'] },
    basePrice: { Avanza: 235_000_000, Innova: 415_000_000 },
  },
  Honda: {
    models: ['Brio', 'HR-V'],
    typesByModel: { Brio: ['Satya E MT', 'RS CVT'], 'HR-V': ['1.5 E CVT', 'RS Turbo'] },
    basePrice: { Brio: 175_000_000, 'HR-V': 385_000_000 },
  },
  Mitsubishi: {
    models: ['Xpander'],
    typesByModel: { Xpander: ['GLS MT', 'Ultimate CVT'] },
    basePrice: { Xpander: 260_000_000 },
  },
  Suzuki: {
    models: ['Ertiga'],
    typesByModel: { Ertiga: ['GL MT', 'Hybrid GX'] },
    basePrice: { Ertiga: 230_000_000 },
  },
  Daihatsu: {
    models: ['Terios'],
    typesByModel: { Terios: ['X MT', 'R CVT'] },
    basePrice: { Terios: 255_000_000 },
  },
}
