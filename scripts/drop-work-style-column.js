const { Pool } = require('pg')
require('dotenv').config({ path: '.env.local' })

const pool = new Pool({
 connectionString: process.env.DATABASE_URL,
 ssl: { rejectUnauthorized: false },
})

async function run() {
 console.log('🔧 Dropping redundant work_style column')
 console.log('(Step 7 scenarios already populate personality_profile)\n')

 try {
 // Check if column exists
 const check = await pool.query(`
 SELECT column_name
 FROM information_schema.columns
 WHERE table_name = 'caregivers' AND column_name = 'work_style'
 `)

 if (check.rows.length === 0) {
 console.log('ℹ️ Column work_style does not exist — nothing to do')
 return
 }

 // Check if any rows have data in it
 const dataCheck = await pool.query(`
 SELECT COUNT(*) as count
 FROM caregivers
 WHERE work_style IS NOT NULL AND work_style::text != '{}'
 `)

 if (parseInt(dataCheck.rows[0].count) > 0) {
 console.log(`⚠️ WARNING: ${dataCheck.rows[0].count} rows have work_style data`)
 console.log(' Aborting. Review data before dropping.')
 process.exit(1)
 }

 await pool.query(`ALTER TABLE caregivers DROP COLUMN work_style`)
 console.log('✅ Dropped work_style column')

 // Verify gone
 const verify = await pool.query(`
 SELECT column_name
 FROM information_schema.columns
 WHERE table_name = 'caregivers' AND column_name = 'work_style'
 `)
 console.log(verify.rows.length === 0
 ? '✅ Verified: column no longer exists'
 : '❌ Column still present after drop — something is wrong'
 )
 } catch (err) {
 console.error('❌ Failed:', err.message)
 throw err
 }
}

run()
 .catch(() => process.exit(1))
 .finally(() => pool.end())
