import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DEALERS } from '@/data/dealers'
import { VEHICLE_BRANDS, VEHICLE_COLORS, VEHICLE_MODELS } from '@/data/vehicleCatalog'
import type { WizardVehicle } from './types'

export function StepVehicle({
  value,
  errors,
  onChange,
}: {
  value: WizardVehicle
  errors: Record<string, string>
  onChange: (patch: Partial<WizardVehicle>) => void
}) {
  const brandEntry = value.brand ? VEHICLE_MODELS[value.brand] : undefined
  const models = brandEntry?.models ?? []
  const types = value.model ? (brandEntry?.typesByModel[value.model] ?? []) : []

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vehicle Information</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Dealer</Label>
          <Select value={value.dealerId} onValueChange={(v) => onChange({ dealerId: v })}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select dealer" />
            </SelectTrigger>
            <SelectContent>
              {DEALERS.map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  {d.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.dealerId && <p className="text-xs text-destructive">{errors.dealerId}</p>}
        </div>

        <div className="space-y-1.5">
          <Label>Brand</Label>
          <Select
            value={value.brand}
            onValueChange={(v) => onChange({ brand: v, model: '', type: '', price: 0 })}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select brand" />
            </SelectTrigger>
            <SelectContent>
              {VEHICLE_BRANDS.map((brand) => (
                <SelectItem key={brand} value={brand}>
                  {brand}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.brand && <p className="text-xs text-destructive">{errors.brand}</p>}
        </div>

        <div className="space-y-1.5">
          <Label>Model</Label>
          <Select
            value={value.model}
            onValueChange={(v) => onChange({ model: v, type: '', price: brandEntry?.basePrice[v] ?? 0 })}
            disabled={!value.brand}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select model" />
            </SelectTrigger>
            <SelectContent>
              {models.map((model) => (
                <SelectItem key={model} value={model}>
                  {model}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.model && <p className="text-xs text-destructive">{errors.model}</p>}
        </div>

        <div className="space-y-1.5">
          <Label>Type</Label>
          <Select value={value.type} onValueChange={(v) => onChange({ type: v })} disabled={!value.model}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {types.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.type && <p className="text-xs text-destructive">{errors.type}</p>}
        </div>

        <div className="space-y-1.5">
          <Label>Color</Label>
          <Select value={value.color} onValueChange={(v) => onChange({ color: v })}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select color" />
            </SelectTrigger>
            <SelectContent>
              {VEHICLE_COLORS.map((color) => (
                <SelectItem key={color} value={color}>
                  {color}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.color && <p className="text-xs text-destructive">{errors.color}</p>}
        </div>

        <div className="space-y-1.5">
          <Label>Vehicle Price (Rp)</Label>
          <Input
            value={value.price || ''}
            onChange={(e) => onChange({ price: Number(e.target.value.replace(/\D/g, '')) || 0 })}
          />
          {errors.price && <p className="text-xs text-destructive">{errors.price}</p>}
        </div>
      </CardContent>
    </Card>
  )
}
