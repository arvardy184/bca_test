import { toast } from 'sonner'
import type { DocumentRecord } from '@/types'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Button } from '@/components/ui/button'

export function DocumentChecklist({
  documents,
  onVerify,
  canVerify,
}: {
  documents: DocumentRecord[]
  onVerify: (documentId: string) => void
  canVerify: boolean
}) {
  return (
    <div className="space-y-2">
      {documents.map((doc) => (
        <div key={doc.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border p-3">
          <div>
            <p className="text-sm font-medium text-foreground">{doc.type}</p>
            <p className="text-xs text-muted-foreground">{doc.fileName ?? 'Missing'}</p>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={doc.status} />
            <Button
              variant="outline"
              size="sm"
              disabled={doc.status === 'Missing'}
              onClick={() => toast.info('Preview is a static demo — no file is actually stored.')}
            >
              Preview
            </Button>
            {canVerify && doc.status === 'Uploaded' && (
              <Button size="sm" onClick={() => onVerify(doc.id)}>
                Verify
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
