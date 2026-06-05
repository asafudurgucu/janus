import { utils } from 'ssh2'
import type { GeneratedKey, KeyType } from '@shared/types'

/** Generate a fresh SSH key pair (ed25519 by default, or RSA-4096). */
export function generateKey(type: KeyType, comment: string): GeneratedKey {
  const opts = type === 'rsa' ? { bits: 4096, comment } : { comment }
  const res = utils.generateKeyPairSync(type === 'rsa' ? 'rsa' : 'ed25519', opts)
  return { type, privateKey: res.private, publicKey: res.public }
}
