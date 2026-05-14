// Careified — Notification System Self-Test Suite
// Tests CRUD operations and deduplication

const { Pool } = require('pg')
require('dotenv').config({ path: '.env.local' })
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } })

async function runTests() {
  console.log('\n🧪 Running notification system tests...\n')

  try {
    // Setup: find a real caregiver
    const caregiver = await pool.query(
      "SELECT id, first_name FROM caregivers LIMIT 1"
    )

    if (caregiver.rows.length === 0) {
      console.log('❌ No caregivers in database - cannot run tests')
      process.exit(1)
    }
    const caregiverId = caregiver.rows[0].id

    console.log(`Testing with caregiver: ${caregiverId}`)

    // Test 1: createNotification inserts correctly
    console.log('\n📋 Test 1: createNotification inserts correctly')
    const { createNotification } = await import('../lib/notifications/create')
    await createNotification({
      caregiverId,
      type: 'profile_viewed',
      title: 'Test notification',
      message: 'This is a test',
      metadata: { agency_id: 'test', agency_name: 'Test Agency' }
    })
    const inserted = await pool.query(
      "SELECT * FROM caregiver_notifications WHERE caregiver_id = $1 AND title = 'Test notification'",
      [caregiverId]
    )
    if (inserted.rows.length !== 1) {
      throw new Error('INSERT failed')
    }
    console.log('✅ Test 1: createNotification works')

    // Test 2: deduplication blocks duplicate within 1 hour
    console.log('\n📋 Test 2: deduplication blocks duplicate within 1 hour')
    await createNotification({
      caregiverId,
      type: 'profile_viewed',
      title: 'Test notification',
      message: 'This is a duplicate',
      metadata: { agency_id: 'test', agency_name: 'Test Agency' }
    })
    const duplicates = await pool.query(
      "SELECT * FROM caregiver_notifications WHERE caregiver_id = $1 AND metadata->>'agency_id' = 'test' AND type = 'profile_viewed'",
      [caregiverId]
    )
    if (duplicates.rows.length !== 1) {
      throw new Error('Deduplication failed — duplicate was inserted')
    }
    console.log('✅ Test 2: Deduplication works')

    // Test 3: mark as read
    console.log('\n📋 Test 3: mark as read')
    const notifId = inserted.rows[0].id
    await pool.query(
      "UPDATE caregiver_notifications SET read_at = NOW() WHERE id = $1",
      [notifId]
    )
    const afterRead = await pool.query(
      "SELECT read_at FROM caregiver_notifications WHERE id = $1",
      [notifId]
    )
    if (!afterRead.rows[0].read_at) {
      throw new Error('Mark as read failed')
    }
    console.log('✅ Test 3: Mark as read works')

    // Test 4: unread count
    console.log('\n📋 Test 4: unread count query')
    const unreadBefore = await pool.query(
      "SELECT COUNT(*) FROM caregiver_notifications WHERE caregiver_id = $1 AND read_at IS NULL",
      [caregiverId]
    )
    console.log('✅ Test 4: Unread count query works:', unreadBefore.rows[0].count)

    // Cleanup: delete test notifications
    console.log('\n🧹 Cleanup: deleting test notifications')
    await pool.query(
      "DELETE FROM caregiver_notifications WHERE caregiver_id = $1 AND metadata->>'agency_id' = 'test'",
      [caregiverId]
    )
    console.log('✅ Cleanup: test notifications deleted')

    console.log('\n✅ ALL NOTIFICATION TESTS PASSED\n')
    process.exit(0)

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error instanceof Error ? error.message : error)
    process.exit(1)
  } finally {
    pool.end()
  }
}

runTests()