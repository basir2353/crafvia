declare module '@imgly/background-removal' {
  export type BackgroundRemovalModel = 'small' | 'medium' | 'large'

  export type BackgroundRemovalConfig = {
    model?: BackgroundRemovalModel
    output?: {
      format?: 'image/png' | 'image/jpeg' | 'image/webp'
      quality?: number
    }
    progress?: (key: string, current: number, total: number) => void
    debug?: boolean
    publicPath?: string
  }

  export function removeBackground(
    image: Blob | File | string,
    config?: BackgroundRemovalConfig,
  ): Promise<Blob>
}
