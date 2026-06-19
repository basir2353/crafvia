import { apiFetch } from './client'

export type SiteConfig = {
  donateUrl: string
  proPriceMonthly: string
  stripeCheckoutUrl: string | null
  supportEmail: string
}

let siteConfigCache: SiteConfig | null = null
let siteConfigInflight: Promise<SiteConfig> | null = null

export async function fetchSiteConfig() {
  if (siteConfigCache) return siteConfigCache
  if (!siteConfigInflight) {
    siteConfigInflight = apiFetch<SiteConfig>('/api/config')
      .then((config) => {
        siteConfigCache = config
        return config
      })
      .finally(() => {
        siteConfigInflight = null
      })
  }
  return siteConfigInflight
}

export async function openDonatePage() {
  const config = await fetchSiteConfig()
  if (!config.donateUrl) {
    throw new Error('Donate page is not configured.')
  }
  const opened = window.open(config.donateUrl, '_blank', 'noopener,noreferrer')
  if (!opened) {
    window.location.assign(config.donateUrl)
  }
}
