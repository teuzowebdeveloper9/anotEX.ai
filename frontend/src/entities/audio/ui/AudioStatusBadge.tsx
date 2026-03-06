import { Badge } from '@/shared/ui/Badge/Badge'
import type { AudioStatus } from '@/shared/types/api.types'

export function AudioStatusBadge({ status }: { status: AudioStatus }) {
  return <Badge status={status} />
}
