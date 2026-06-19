import type { LucideIcon } from 'lucide-react'
import {
  ArrowRight,
  Calculator,
  Code2,
  FileImage,
  FileType,
  Image,
  KeyRound,
  Lock,
  Mic,
  PenLine,
  QrCode,
  Scissors,
  Search,
  Shrink,
  Sparkles,
  Type,
  Video,
  Wrench,
} from 'lucide-react'

const iconMap: Record<string, LucideIcon> = {
  Image,
  FileType,
  Video,
  Mic,
  PenLine,
  Search,
  Code2,
  Type,
  Calculator,
  Sparkles,
  ArrowRight,
  Shrink,
  Wrench,
  Lock,
  FileImage,
  Scissors,
  KeyRound,
  QrCode,
}

export function getIcon(name: string): LucideIcon {
  return iconMap[name] ?? Sparkles
}
