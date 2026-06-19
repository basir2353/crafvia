import { compressImageConfig } from '../config/tools'
import { ToolPage } from './ToolPage'

export function CompressImagePage() {
  return <ToolPage config={compressImageConfig} />
}
