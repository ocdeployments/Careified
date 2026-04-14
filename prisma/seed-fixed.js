const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://careified_user:Careified2024@187.124.227.63:5432/careified'
});

async function seed() {
  console.log('🌱 Starting seed...');
  
  try {
    // Create 5 agencies with users
    const agencies = [
      { name: 'Premier Home Care', type: 'home_care', city: 'Frisco', email: 'sarah@premier.com' },
      { name: 'Dallas Care Placement', type: 'placement', city: 'Dallas', email: 'michael@dallas.com' },
      { name: 'Compassionate Nursing', type: 'nursing', city: 'Plano', email: 'jennifer@comp.com' },
      { name: 'Elite Care Staffing', type: 'placement', city: 'McKinney', email: 'david@elite.com' },
      { name: 'LifeCare Home Health', type: 'home_care', city: 'Frisco', email: 'amanda@lifecare.com' },
    ];
    
    const agencyIds = [];
    for (const a of agencies) {
      const userRes = await pool.query(
        'INSERT INTO users (email, role, "createdAt", "updatedAt") VALUES ($1, $2, NOW(), NOW()) RETURNING id',
        [a.email, 'AGENCY']
      );
      const userId = userRes.rows[0].id;
      
      const agencyRes = await pool.query(
        'INSERT INTO agencies ("userId", name, "businessType", city, state, status, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW()) RETURNING id',
        [userId, a.name, a.type, a.city, 'TX', 'approved']
      );
      agencyIds.push(agencyRes.rows[0].id);
    }
    console.log(`✅ Created ${agencies.length} agencies`);
    
    // Create 50 caregivers
    const firstNames = ['Emma','Olivia','Sophia','Isabella','Mia','Charlotte','Amelia','Harper','Evelyn','Abigail','James','William','Benjamin','Lucas','Henry','Alexander','Mason','Michael','Ethan','Daniel','Maria','Ana','Rosa','Carmen','Elena','Isabel','Sofia','Lucia','Gabriela','Valentina','David','Jose','Carlos','Juan','Luis','Miguel','Pedro','Jorge','Francisco','Rafael','Sarah','Jennifer','Lisa','Karen','Nancy','Betty','Helen','Sandra','Donna','Carol'];
    const lastNames = ['Smith','Johnson','Williams','Brown','Jones','Garcia','Miller','Davis','Rodriguez','Martinez','Hernandez','Lopez','Gonzalez','Wilson','Anderson','Thomas','Taylor','Moore','Jackson','Martin','Lee','Perez','Thompson','White','Harris','Sanchez','Clark','Ramirez','Lewis','Robinson','Walker','Young','Allen','King','Wright','Scott','Torres','Nguyen','Hill','Flores','Green','Adams','Nelson','Baker','Hall','Rivera','Campbell','Mitchell','Carter','Roberts'];
    const cities = ['Frisco', 'Dallas', 'Plano', 'McKinney', 'Allen', 'Richardson'];
    const specialties = ["Dementia / Alzheimer's", "Parkinson's disease", 'Palliative / end of life', 'Post-hospital recovery', 'Stroke recovery', 'Diabetes management', 'Mobility and transfer', 'Medication management', 'Complex personal care', 'Behavioural support', 'Mental health support', 'Paediatric care', 'Acquired brain injury', 'Bariatric care', 'Hospice support'];
    const credentials = ['PSW', 'RN', 'LPN / LVN', 'CNA', 'HHA'];
    
    const caregiverIds = [];
    for (let i = 0; i < 50; i++) {
      const fn = firstNames[i % firstNames.length];
      const ln = lastNames[i % lastNames.length];
      const city = cities[i % cities.length];
      
      // Create user
      const userRes = await pool.query(
        'INSERT INTO users (email, role, "createdAt", "updatedAt") VALUES ($1, $2, NOW(), NOW()) RETURNING id',
        [`${fn.toLowerCase()}.${ln.toLowerCase()}${i}@example.com`, 'CAREGIVER']
      );
      const userId = userRes.rows[0].id;
      
      // Create caregiver
      const cgRes = await pool.query(
        `INSERT INTO caregivers ("userId", "firstName", "lastName", phone, city, state, "postalCode", gender, "yearsExperience", score, status, credentials, specialties, "availability_status", "profile_completeness", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW(), NOW()) RETURNING id`,
        [userId, fn, ln, `(214) 555-${String(2000+i).slice(-4)}`, city, 'TX', String(75000+i), ['Male','Female'][i%2], (i%15)+1, (3.5 + (i%15)/10).toFixed(1), 'approved', 
         JSON.stringify([credentials[i%credentials.length]]), 
         JSON.stringify(specialties.slice(0, (i%5)+2)),
         ['available_now','open_to_opportunities'][i%2], 70+(i%30)]
      );
      caregiverIds.push(cgRes.rows[0].id);
    }
    console.log(`✅ Created ${caregiverIds.length} caregivers`);
    
    // Create 20 relationships
    const relIds = [];
    for (let i = 0; i < 20; i++) {
      const relRes = await pool.query(
        `INSERT INTO agency_caregiver_relationships ("agencyId", "caregiverId", "startDate", "employmentType", "currentlyEmployed", "totalShifts", "noShowCount", "createdAt", "updatedAt")
         VALUES ($1, $2, NOW(), $3, $4, 0, 0, NOW(), NOW()) RETURNING id`,
        [agencyIds[i%agencyIds.length], caregiverIds[i], ['permanent','contract','casual'][i%3], i<15]
      );
      relIds.push(relRes.rows[0].id);
    }
    console.log(`✅ Created ${relIds.length} relationships`);
    
    // Create 100 shifts
    let totalShifts = 0;
    for (const relId of relIds) {
      const numShifts = 5 + (totalShifts % 5);
      for (let i = 0; i < numShifts; i++) {
        const daysAgo = Math.floor(Math.random() * 90);
        const shiftDate = new Date();
        shiftDate.setDate(shiftDate.getDate() - daysAgo);
        
        const status = Math.random() > 0.9 ? 'no_show' : 'completed';
        const hours = 4 + Math.floor(Math.random() * 8);
        
        await pool.query(
          `INSERT INTO caregiver_shifts ("relationshipId", "shiftDate", "startTime", "endTime", "hoursWorked", status, "createdAt")
           VALUES ($1, $2, '09:00', $3, $4, $5, NOW())`,
          [relId, shiftDate, `${9+hours}:00`, hours, status]
        );
        
        await pool.query(
          `UPDATE agency_caregiver_relationships SET "totalShifts" = "totalShifts" + 1, "noShowCount" = "noShowCount" + $1, "lastShiftDate" = $2, "updatedAt" = NOW() WHERE id = $3`,
          [status==='no_show'?1:0, shiftDate, relId]
        );
        totalShifts++;
      }
    }
    console.log(`✅ Created ${totalShifts} shifts`);
    
    // Create 15 ratings
    for (let i = 0; i < 15; i++) {
      const relId = relIds[i];
      const cgId = caregiverIds[i];
      const baseScore = 3.5 + Math.random() * 1.5;
      
      await pool.query(
        `INSERT INTO agency_ratings ("relationshipId", "agencyId", "caregiverId", reliability, punctuality, warmth, dignity, hygiene, "skillsMatch", "wouldReengage", "publicComment", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())`,
        [relId, agencyIds[i%agencyIds.length], cgId,
         Math.round(baseScore), Math.round(baseScore+0.5), Math.round(baseScore-0.2), Math.round(baseScore+0.3), Math.round(baseScore), Math.round(baseScore+0.1),
         Math.random() > 0.2, Math.random() > 0.5 ? 'Great caregiver!' : null]
      );
      
      // Update caregiver aggregate score
      const ratings = await pool.query('SELECT * FROM agency_ratings WHERE "caregiverId" = $1', [cgId]);
      if (ratings.rows.length > 0) {
        const total = ratings.rows.reduce((sum, r) => sum + (r.reliability+r.punctuality+r.warmth+r.dignity+r.hygiene+r.skillsMatch)/6, 0);
        const avg = total / ratings.rows.length;
        await pool.query('UPDATE caregivers SET "aggregateScore" = $1, "ratingCount" = $2 WHERE id = $3', [Math.round(avg*10)/10, ratings.rows.length, cgId]);
      }
    }
    console.log(`✅ Created 15 ratings`);
    
    console.log('\n🎉 Seed complete!');
    console.log(`📊 ${agencies.length} agencies, ${caregiverIds.length} caregivers, ${relIds.length} relationships, ${totalShifts} shifts, 15 ratings`);
    
  } catch (e) {
    console.error('❌ Seed failed:', e.message);
  } finally {
    await pool.end();
  }
}

seed();
