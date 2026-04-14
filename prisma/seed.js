const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://careified_user:Careified2024@187.124.227.63:5432/careified'
});

async function seed() {
  console.log('🌱 Starting seed...');
  
  try {
    // Create agencies
    const agencies = [
      { name: 'Premier Home Care', type: 'home_care', city: 'Frisco', state: 'TX' },
      { name: 'Dallas Care Placement', type: 'placement', city: 'Dallas', state: 'TX' },
      { name: 'Compassionate Nursing', type: 'nursing', city: 'Plano', state: 'TX' },
      { name: 'Elite Care Staffing', type: 'placement', city: 'McKinney', state: 'TX' },
      { name: 'LifeCare Home Health', type: 'home_care', city: 'Frisco', state: 'TX' },
    ];
    
    const agencyIds = [];
    for (const a of agencies) {
      const result = await pool.query(`
        INSERT INTO agencies (name, "businessType", city, state, status, "createdAt", "updatedAt")
        VALUES ($1, $2, $3, $4, 'approved', NOW(), NOW())
        RETURNING id
      `, [a.name, a.type, a.city, a.state]);
      agencyIds.push(result.rows[0].id);
    }
    console.log(`✅ Created ${agencies.length} agencies`);
    
    // Sample data
    const firstNames = ['Emma', 'Olivia', 'Sophia', 'Isabella', 'Mia', 'Charlotte', 'Amelia', 'Harper', 'Evelyn', 'Abigail', 'James', 'William', 'Benjamin', 'Lucas', 'Henry', 'Maria', 'Ana', 'Rosa', 'Carmen', 'Elena'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'];
    const cities = ['Frisco', 'Dallas', 'Plano', 'McKinney', 'Allen'];
    const specialties = ["Dementia / Alzheimer's", "Parkinson's disease", 'Palliative / end of life', 'Post-hospital recovery', 'Diabetes management', 'Mobility and transfer'];
    const credentials = ['PSW', 'RN', 'LPN / LVN', 'CNA', 'HHA'];
    
    const caregiverIds = [];
    
    // Create 20 caregivers
    for (let i = 0; i < 20; i++) {
      const fn = firstNames[i % firstNames.length];
      const ln = lastNames[i % lastNames.length];
      const city = cities[i % cities.length];
      
      // Create user first
      const userResult = await pool.query(`
        INSERT INTO users (email, role, "createdAt", "updatedAt")
        VALUES ($1, 'CAREGIVER', NOW(), NOW())
        RETURNING id
      `, [`${fn.toLowerCase()}.${ln.toLowerCase()}${i}@example.com`]);
      const userId = userResult.rows[0].id;
      
      // Create caregiver
      const cgResult = await pool.query(`
        INSERT INTO caregivers (
          "userId", "firstName", "lastName", phone, city, state, "postalCode", gender,
          "yearsExperience", score, status, credentials, specialties,
          "availabilityStatus", "profileCompleteness", "createdAt", "updatedAt"
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'approved', $11, $12, $13, $14, NOW(), NOW())
        RETURNING id
      `, [
        userId, fn, ln, `(214) 555-${String(200 + i).padStart(4, '0')}`,
        city, 'TX', String(75000 + i), ['Male', 'Female'][i % 2],
        1 + (i % 10), 3.5 + (i % 15) / 10,
        JSON.stringify([credentials[i % credentials.length]]),
        JSON.stringify(specialties.slice(0, (i % 4) + 2)),
        ['available_now', 'open_to_opportunities'][i % 2],
        70 + (i % 30)
      ]);
      caregiverIds.push(cgResult.rows[0].id);
    }
    console.log(`✅ Created ${caregiverIds.length} caregivers`);
    
    // Create 10 relationships
    const relIds = [];
    for (let i = 0; i < 10; i++) {
      const relResult = await pool.query(`
        INSERT INTO agency_caregiver_relationships (
          "agencyId", "caregiverId", "startDate", "employmentType",
          "currentlyEmployed", "totalShifts", "noShowCount", "createdAt", "updatedAt"
        ) VALUES ($1, $2, NOW(), $3, $4, $5, $6, NOW(), NOW())
        RETURNING id
      `, [agencyIds[i % agencyIds.length], caregiverIds[i], ['permanent', 'contract', 'casual'][i % 3], i < 8, 0, 0]);
      relIds.push(relResult.rows[0].id);
    }
    console.log(`✅ Created ${relIds.length} relationships`);
    
    // Create shifts for each relationship
    let totalShifts = 0;
    for (const relId of relIds) {
      const numShifts = 3 + (totalShifts % 7);
      for (let i = 0; i < numShifts; i++) {
        const daysAgo = Math.floor(Math.random() * 60);
        const shiftDate = new Date();
        shiftDate.setDate(shiftDate.getDate() - daysAgo);
        
        const status = Math.random() > 0.9 ? 'no_show' : 'completed';
        const hours = 4 + Math.floor(Math.random() * 8);
        
        await pool.query(`
          INSERT INTO caregiver_shifts ("relationshipId", "shiftDate", "startTime", "endTime", "hoursWorked", status, "createdAt")
          VALUES ($1, $2, '09:00', $3, $4, $5, NOW())
        `, [relId, shiftDate, `${9 + hours}:00`, hours, status]);
        
        totalShifts++;
        
        // Update relationship
        await pool.query(`
          UPDATE agency_caregiver_relationships 
          SET "totalShifts" = "totalShifts" + 1,
              "noShowCount" = "noShowCount" + $1,
              "lastShiftDate" = $2,
              "updatedAt" = NOW()
          WHERE id = $3
        `, [status === 'no_show' ? 1 : 0, shiftDate, relId]);
      }
    }
    console.log(`✅ Created ${totalShifts} shifts`);
    
    // Create 8 ratings
    for (let i = 0; i < 8; i++) {
      const relId = relIds[i];
      const baseScore = 3.5 + Math.random() * 1.5;
      
      await pool.query(`
        INSERT INTO agency_ratings (
          "relationshipId", "agencyId", "caregiverId",
          reliability, punctuality, warmth, dignity, hygiene, "skillsMatch",
          "wouldReengage", "publicComment", "createdAt", "updatedAt"
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
      `, [
        relId, agencyIds[i % agencyIds.length], caregiverIds[i],
        Math.round(baseScore), Math.round(baseScore + 0.5), Math.round(baseScore - 0.2), Math.round(baseScore + 0.3), Math.round(baseScore), Math.round(baseScore + 0.1),
        Math.random() > 0.2,
        Math.random() > 0.5 ? 'Great caregiver, highly recommend!' : null
      ]);
      
      // Update caregiver score
      const ratingsResult = await pool.query(`SELECT * FROM agency_ratings WHERE "caregiverId" = $1`, [caregiverIds[i]]);
      if (ratingsResult.rows.length > 0) {
        const totalScore = ratingsResult.rows.reduce((sum, r) => sum + (r.reliability + r.punctuality + r.warmth + r.dignity + r.hygiene + r.skillsMatch) / 6, 0);
        const avg = totalScore / ratingsResult.rows.length;
        await pool.query(`UPDATE caregivers SET "aggregateScore" = $1, "ratingCount" = $2 WHERE id = $3`, [Math.round(avg * 10) / 10, ratingsResult.rows.length, caregiverIds[i]]);
      }
    }
    console.log(`✅ Created 8 ratings`);
    
    console.log('\n🎉 Seed complete!');
    console.log(`📊 Summary: ${agencies.length} agencies, ${caregiverIds.length} caregivers, ${relIds.length} relationships, ${totalShifts} shifts, 8 ratings`);
    
  } catch (e) {
    console.error('❌ Seed failed:', e.message);
  } finally {
    await pool.end();
  }
}

seed();
