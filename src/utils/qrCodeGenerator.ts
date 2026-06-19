import QRCodeStyling, { type FileExtension } from 'qr-code-styling'
import {
  ERROR_CORRECTION_MAP,
  type QrErrorCorrection,
} from './qrCode'

export type QrRenderOptions = {
  data: string
  size: number
  margin: number
  errorCorrection: QrErrorCorrection
  foregroundColor: string
  backgroundColor: string
  transparentBackground: boolean
  logoDataUrl?: string
}

const ERROR_CORRECTION_ORDER: Array<'L' | 'M' | 'Q' | 'H'> = ['L', 'M', 'Q', 'H']

function resolveErrorCorrection(
  level: QrErrorCorrection,
  hasLogo: boolean,
): 'L' | 'M' | 'Q' | 'H' {
  const selected = ERROR_CORRECTION_MAP[level]
  if (!hasLogo) return selected

  const selectedIndex = ERROR_CORRECTION_ORDER.indexOf(selected)
  const minimumWithLogo = ERROR_CORRECTION_ORDER.indexOf('Q')
  return ERROR_CORRECTION_ORDER[Math.max(selectedIndex, minimumWithLogo)]
}

export function buildQrCodeOptions(options: QrRenderOptions) {
  return {
    width: options.size,
    height: options.size,
    type: 'canvas' as const,
    data: options.data,
    margin: options.margin,
    qrOptions: {
      typeNumber: 0 as const,
      mode: 'Byte' as const,
      errorCorrectionLevel: resolveErrorCorrection(
        options.errorCorrection,
        Boolean(options.logoDataUrl),
      ),
    },
    dotsOptions: {
      color: options.foregroundColor,
      type: 'rounded' as const,
    },
    backgroundOptions: {
      color: options.transparentBackground ? 'transparent' : options.backgroundColor,
    },
    image: options.logoDataUrl,
    imageOptions: {
      crossOrigin: 'anonymous' as const,
      margin: 6,
      imageSize: 0.35,
      hideBackgroundDots: true,
    },
  }
}

export function createQrCodeStyling(options: QrRenderOptions): QRCodeStyling {
  return new QRCodeStyling(buildQrCodeOptions(options))
}

export async function downloadQrCode(
  qrCode: QRCodeStyling,
  extension: FileExtension,
  filename = 'qrcode',
) {
  await qrCode.download({ name: filename, extension })
}

export async function copyQrCodeImage(qrCode: QRCodeStyling): Promise<void> {
  const blob = await qrCode.getRawData('png')
  if (!blob || !(blob instanceof Blob)) {
    throw new Error('Unable to copy QR code image.')
  }

  if (!navigator.clipboard?.write || typeof ClipboardItem === 'undefined') {
    throw new Error('Clipboard image copy is not supported in this browser.')
  }

  await navigator.clipboard.write([
    new ClipboardItem({
      'image/png': blob,
    }),
  ])
}
