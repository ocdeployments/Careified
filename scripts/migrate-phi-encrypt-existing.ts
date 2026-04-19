import { Pool } from 'pg'
import { encryptPHI, encryptPHIJson } from '../lib/encryption/phi'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

async function main() {
  console.log('🔧 Encrypting existing client_needs PHI columns\n')

  const { rows } = await pool.query(`
    SELECT id,
      client_first_name, primary_condition, secondary_conditions,
      mobility_level, medications_complex
    FROM client_needs
    WHERE primary_condition_encrypted IS NULL
  `)

  console.log(`Rows needing encryption: ${rows.length}\n`)

  let encrypted = 0
  for (const r of rows) {
    const firstName = encryptPHI(r.client_first_name)
    const primary = encryptPHI(r.primary_condition)
    const secondary = encryptPHIJson(r.secondary_conditions)
    const mobility = encryptPHI(r.mobility_level)
    const meds = r.medications_complex != null
      ? encryptPHI(String(r.medications_complex))
      : null

    await pool.query(
      `UPDATE client_needs SET
        client_first_name_encrypted = $1,
        primary_condition_encrypted = $2,
        secondary_conditions_encrypted = $3,
        mobility_level_encrypted = $4,
        medications_complex_encrypted = $5,
        encryption_key_version = 1
      WHERE id = $6`,
      [firstName, primary, secondary, mobility, meds, r.id]
    )
    encrypted++
    console.log(` ✅ ${r.id}`)
  }

  console.log(`\n✅ Encrypted ${encrypted} rows`)
}

main()
  .catch(err => { console.error('❌', err.message); process.exit(1) })
  .finally(() => pool.end())
