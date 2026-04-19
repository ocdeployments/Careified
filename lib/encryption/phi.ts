// lib/encryption/phi.ts
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'

const ALGO = 'aes-256-gcm'
const IV_LENGTH = 12 // 96 bits for GCM
const TAG_LENGTH = 16
const KEY_VERSION = 1

function getKey(): Buffer {
  const raw = process.env.PHI_ENCRYPTION_KEY
  if (!raw) throw new Error('PHI_ENCRYPTION_KEY env var is required')
  const key = Buffer.from(raw, 'base64')
  if (key.length !== 32) throw new Error('PHI_ENCRYPTION_KEY must be 32 bytes (base64)')
  return key
}

/**
 * Encrypt a string for storage in a bytea column.
 * Output: [version (1 byte)] [iv (12 bytes)] [tag (16 bytes)] [ciphertext]
 */
export function encryptPHI(plaintext: string | null | undefined): Buffer | null {
  if (plaintext == null || plaintext === '') return null
  const iv = randomBytes(IV_LENGTH)
  const cipher = createCipheriv(ALGO, getKey(), iv)
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return Buffer.concat([Buffer.from([KEY_VERSION]), iv, tag, encrypted])
}

/**
 * Decrypt a bytea column value back to its original string.
 * Returns null if input is null/empty.
 */
export function decryptPHI(buf: Buffer | null | undefined): string | null {
  if (!buf || buf.length === 0) return null
  const version = buf[0]
  if (version !== KEY_VERSION) {
    throw new Error(`Unsupported encryption key version: ${version}`)
  }
  const iv = buf.subarray(1, 1 + IV_LENGTH)
  const tag = buf.subarray(1 + IV_LENGTH, 1 + IV_LENGTH + TAG_LENGTH)
  const ciphertext = buf.subarray(1 + IV_LENGTH + TAG_LENGTH)
  const decipher = createDecipheriv(ALGO, getKey(), iv)
  decipher.setAuthTag(tag)
  const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()])
  return decrypted.toString('utf8')
}

/**
 * Encrypt a JSON-serializable value (for arrays, objects).
 */
export function encryptPHIJson(value: unknown): Buffer | null {
  if (value == null) return null
  return encryptPHI(JSON.stringify(value))
}

/**
 * Decrypt a JSON-serialized PHI value.
 */
export function decryptPHIJson<T = unknown>(buf: Buffer | null | undefined): T | null {
  const str = decryptPHI(buf)
  if (str == null) return null
  return JSON.parse(str) as T
}
