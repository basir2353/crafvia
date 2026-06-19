import { removeBackgroundConfig } from '../config/tools'
import { ToolPage } from './ToolPage'

export function RemoveBackgroundPage() {
  return <ToolPage config={removeBackgroundConfig} />
}
