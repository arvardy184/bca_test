import { useRef } from 'react'
import { CheckCircle2, Upload } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { DocumentType } from '@/types'
import { DOCUMENT_TYPES, type WizardDocumentState } from './types'

export function StepDocuments({
  value,
  errors,
  onChange,
}: {
  value: WizardDocumentState
  errors: Record<string, string>
  onChange: (type: DocumentType, fileName: string) => void
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Documents</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2">
        {DOCUMENT_TYPES.map((type) => (
          <DocumentDropZone key={type} type={type} state={value[type]} onChange={(name) => onChange(type, name)} />
        ))}
        {errors.documents && <p className="text-xs text-destructive sm:col-span-2">{errors.documents}</p>}
      </CardContent>
    </Card>
  )
}

function DocumentDropZone({
  type,
  state,
  onChange,
}: {
  type: DocumentType
  state: { fileName: string | null; status: 'Missing' | 'Uploaded' }
  onChange: (fileName: string) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const uploaded = state.status === 'Uploaded'

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault()
        const file = e.dataTransfer.files[0]
        if (file) onChange(file.name)
      }}
      onClick={() => inputRef.current?.click()}
      className={cn(
        'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-5 text-center transition-colors',
        uploaded ? 'border-success/40 bg-success/5' : 'border-border hover:border-primary/40 hover:bg-muted/40',
      )}
    >
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) onChange(file.name)
        }}
      />
      {uploaded ? <CheckCircle2 className="size-6 text-success" /> : <Upload className="size-6 text-muted-foreground" />}
      <p className="text-sm font-medium text-foreground">{type}</p>
      <p className="text-xs text-muted-foreground">{uploaded ? state.fileName : 'Drag & drop or click to select'}</p>
      <span
        className={cn(
          'rounded-full px-2 py-0.5 text-[11px] font-medium',
          uploaded ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground',
        )}
      >
        {state.status}
      </span>
    </div>
  )
}
