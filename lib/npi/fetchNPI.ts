// lib/npi/fetchNPI.ts
// Fetches individual home health providers from the NPI Registry API (v2.1)

import https from 'https'

const NPI_BASE = 'https://npiregistry.cms.hhs.gov/api/'

export interface NPIProvider {
  npiNumber: string
  firstName: string
  lastName: string
  credential: string | null
  status: string
  certificationDate: string | null
  primaryTaxonomy: string
  licenseNumber: string | null
  licenseState: string | null
  phone: string | null
  city: string | null
  state: string
  postalCode: string | null
  email: string | null
  verificationTier: number
}

interface NPIAddress {
  address_purpose: string
  address_1?: string
  city?: string
  state?: string
  postal_code?: string
  telephone_number?: string
}

interface NPITaxonomy {
  code?: string
  desc?: string
  primary?: boolean
  license?: string
  state?: string
}

interface NPIEndpoint {
  endpointType?: string
  endpoint?: string
}

interface NPIResult {
  number?: string
  basic?: {
    first_name?: string
    last_name?: string
    credential?: string
    status?: string
    certification_date?: string
  }
  addresses?: NPIAddress[]
  taxonomies?: NPITaxonomy[]
  endpoints?: NPIEndpoint[]
}

interface NPIResponse {
  result_count?: number
  results?: NPIResult[]
}

// Use Node's https module to avoid Node 20 built-in fetch hanging issues
function httpsGet(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { Accept: 'application/json' } }, (res) => {
      if (res.statusCode && res.statusCode >= 400) {
        reject(new Error(`NPI API error: ${res.statusCode}`))
        res.resume()
        return
      }
      const chunks: Buffer[] = []
      res.on('data', (chunk: Buffer) => chunks.push(chunk))
      res.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
      res.on('error', reject)
    })
    req.setTimeout(15_000, () => {
      req.destroy(new Error('NPI API request timed out after 15s'))
    })
    req.on('error', reject)
  })
}

export async function fetchNPIProviders(params: {
  city?: string
  state?: string
  taxonomyDescription?: string
  limit?: number
  skip?: number
}): Promise<NPIProvider[]> {
  const { city, state, taxonomyDescription, limit = 200, skip = 0 } = params

  const qs = new URLSearchParams({
    version: '2.1',
    enumeration_type: 'NPI-1',
    limit: String(Math.min(limit, 200)),
    skip: String(skip),
  })

  if (city) qs.set('city', city)
  if (state) qs.set('state', state)
  if (taxonomyDescription) qs.set('taxonomy_description', taxonomyDescription)

  const url = `${NPI_BASE}?${qs.toString()}`

  const body = await httpsGet(url)
  const data: NPIResponse = JSON.parse(body)
  const results: NPIResult[] = data.results ?? []

  return results.map((r): NPIProvider => {
    const basic = r.basic ?? {}

    // LOCATION address (primary practice location)
    const locationAddr = (r.addresses ?? []).find(
      a => a.address_purpose === 'LOCATION'
    ) ?? (r.addresses ?? [])[0] ?? {}

    // Primary taxonomy
    const primaryTax = (r.taxonomies ?? []).find(t => t.primary) ??
      (r.taxonomies ?? [])[0] ?? {}

    // License from primary taxonomy
    const licenseNumber = primaryTax.license ?? null
    const licenseState = primaryTax.state ?? null

    // Email from endpoints
    const emailEndpoint = (r.endpoints ?? []).find(
      e => e.endpointType?.toLowerCase().includes('email') ||
           e.endpoint?.includes('@')
    )
    const email = emailEndpoint?.endpoint ?? null

    // Verification tier: 1 if license present, 2 if not
    const verificationTier = licenseNumber ? 1 : 2

    return {
      npiNumber: r.number ?? '',
      firstName: basic.first_name ?? '',
      lastName: basic.last_name ?? '',
      credential: basic.credential ?? null,
      status: basic.status ?? '',
      certificationDate: basic.certification_date ?? null,
      primaryTaxonomy: primaryTax.desc ?? '',
      licenseNumber,
      licenseState,
      phone: locationAddr.telephone_number ?? null,
      city: locationAddr.city ?? null,
      state: locationAddr.state ?? state ?? '',
      postalCode: locationAddr.postal_code ?? null,
      email,
      verificationTier,
    }
  })
}
