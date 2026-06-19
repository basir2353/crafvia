import * as openpgp from 'openpgp'

export type PgpKeygenOptions = {
  name?: string
  email?: string
  passphrase?: string
}

export type PgpKeygenResult = {
  publicKey: string
  privateKey: string
  fingerprint: string
  keyId: string
}

export async function generatePgpKeyPair(options: PgpKeygenOptions = {}): Promise<PgpKeygenResult> {
  const name = options.name?.trim() || 'Crafvia User'
  const email = options.email?.trim() || 'user@crafvia.local'
  const passphrase = options.passphrase ?? ''

  const { privateKey, publicKey } = await openpgp.generateKey({
    type: 'rsa',
    rsaBits: 2048,
    userIDs: [{ name, email }],
    passphrase: passphrase || undefined,
  })

  const pub = await openpgp.readKey({ armoredKey: publicKey })
  const fingerprint = pub.getFingerprint()
  const keyId = pub.getKeyID().toHex()

  return {
    publicKey,
    privateKey,
    fingerprint,
    keyId,
  }
}
