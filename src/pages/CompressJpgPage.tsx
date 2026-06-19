import { compressJpgConfig } from '../config/tools'
import { ToolPage } from './ToolPage'

export function CompressJpgPage() {
  return <ToolPage config={compressJpgConfig} />
}
