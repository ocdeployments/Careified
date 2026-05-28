require('dotenv').config({path:'.env.local'});
const {Pool} = require('pg');
const p = new Pool({connectionString: process.env.DATABASE_URL, ssl:{rejectUnauthorized:false}});

const AGENCY_ID = 'c1444e1d-f02d-40f6-bdf3-401cc509b624';
const AGENCY_CLERK_ID = 'user_3Dx0w53vVgVkOKrsogxO62NN865';
const LOCALE = 'CA';

function uid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random()*16|0;
    return (c==='x'?r:(r&0x3|0x8)).toString(16);
  });
}

async function seed() {
  console.log('Seeding demo data for Sunrise Senior Care Ontario...\n');

  // 1. CAREGIVERS — using uid() not cgid()
  const caregivers = [
    { first:'Maria',   last:'Santos',    city:'Scarborough', avail:'available',    specs:['dementia_care','alzheimers'],               langs:['English','Portuguese'],          rate:22, exp:8,  claim:'claimed',      vsc:'valid',    cpr_days:45   },
    { first:'James',   last:'Obi',       city:'North York',  avail:'available',    specs:['post_surgical','wound_care'],               langs:['English'],                       rate:20, exp:5,  claim:'claimed',      vsc:'valid',    cpr_days:18   },
    { first:'Fatima',  last:'Al-Hassan', city:'Mississauga', avail:'open_to_work', specs:['companion_care','mobility_assistance'],     langs:['English','Arabic','French'],     rate:19, exp:3,  claim:'claimed',      vsc:'valid',    cpr_days:90   },
    { first:'Priya',   last:'Sharma',    city:'Brampton',    avail:'available',    specs:['dementia_care','medication_management'],    langs:['English','Hindi','Punjabi'],     rate:21, exp:6,  claim:'claimed',      vsc:'expiring', cpr_days:8    },
    { first:'David',   last:'Okonkwo',   city:'Etobicoke',   avail:'available',    specs:['palliative_care','personal_care'],          langs:['English','Yoruba'],              rate:23, exp:10, claim:'claimed',      vsc:'valid',    cpr_days:60   },
    { first:'Ana',     last:'Rodrigues', city:'Scarborough', avail:'available',    specs:['dementia_care','companionship'],            langs:['English','Portuguese','Spanish'],rate:20, exp:4,  claim:'claimed',      vsc:'valid',    cpr_days:120  },
    { first:'Kevin',   last:'Park',      city:'North York',  avail:'open_to_work', specs:['acquired_brain_injury','rehabilitation'],   langs:['English','Korean'],              rate:22, exp:7,  claim:'claimed',      vsc:'valid',    cpr_days:30   },
    { first:'Grace',   last:'Mensah',    city:'Ajax',        avail:'available',    specs:['pediatric_care','developmental_disability'],langs:['English','Twi'],                rate:19, exp:3,  claim:'claimed',      vsc:'valid',    cpr_days:200  },
    { first:'Thomas',  last:'Beaumont',  city:'Pickering',   avail:'available',    specs:['senior_care'],                             langs:['English','French'],              rate:18, exp:2,  claim:'agency_built', vsc:null,       cpr_days:null },
    { first:'Sunita',  last:'Patel',     city:'Mississauga', avail:'available',    specs:['dementia_care'],                           langs:['English','Gujarati'],            rate:20, exp:5,  claim:'agency_built', vsc:null,       cpr_days:null },
  ];

  const cgIds = [];
  for (const cg of caregivers) {
    const id = uid();
    cgIds.push({id, ...cg});
    await p.query(`
      INSERT INTO caregivers (
        id, first_name, last_name, city, state, country, status, availability_status,
        specializations, languages, hourly_rate, years_experience, phone,
        created_by_agency_id, claim_status, locale, is_demo,
        profile_completion_pct, profile_status
      ) VALUES ($1,$2,$3,$4,'ON','CA',$5,$6,$7,$8,$9,$10,$11,$12::uuid,$13,$14,false,$15,$16)
      ON CONFLICT DO NOTHING
    `, [
      id, cg.first, cg.last, cg.city,
      cg.claim==='claimed' ? 'approved' : 'stub',
      cg.avail,
      `{${cg.specs.join(',')}}`,
      `{${cg.langs.join(',')}}`,
      cg.rate, cg.exp,
      '416555' + String(Math.floor(Math.random()*9000)+1000),
      AGENCY_ID, cg.claim, LOCALE,
      cg.claim==='claimed' ? 85 : 30,
      cg.claim==='claimed' ? 'active' : 'stub'
    ]);
    console.log(`  ✓ ${cg.first} ${cg.last}`);
  }

  // 2. CERTIFICATIONS
  for (const cg of cgIds) {
    if (cg.cpr_days !== null) {
      const exp = new Date(); exp.setDate(exp.getDate() + cg.cpr_days);
      await p.query(`INSERT INTO caregiver_certifications (id,caregiver_id,certification,expiry_date,status) VALUES ($1,$2,$3,$4,'active') ON CONFLICT DO NOTHING`,
        [uid(), cg.id, 'CPR/First Aid', exp.toISOString().split('T')[0]]);
    }
    if (cg.vsc === 'valid') {
      const exp = new Date(); exp.setFullYear(exp.getFullYear()+2);
      await p.query(`INSERT INTO caregiver_certifications (id,caregiver_id,certification,expiry_date,status) VALUES ($1,$2,$3,$4,'active') ON CONFLICT DO NOTHING`,
        [uid(), cg.id, 'Vulnerable Sector Check', exp.toISOString().split('T')[0]]);
    }
    if (cg.vsc === 'expiring') {
      const exp = new Date(); exp.setDate(exp.getDate()+5);
      await p.query(`INSERT INTO caregiver_certifications (id,caregiver_id,certification,expiry_date,status) VALUES ($1,$2,$3,$4,'active') ON CONFLICT DO NOTHING`,
        [uid(), cg.id, 'Vulnerable Sector Check', exp.toISOString().split('T')[0]]);
    }
  }
  console.log('\n  ✓ Certifications seeded');

  // 3. CLIENTS
  const clients = [
    { first:'Eleanor', age:82, condition:'dementia_alzheimers',    services:['personal_care','medication_management','companionship'],      intensity:'high',   placement:'live_in', hours:168, city:'Scarborough', lang:'English', matchedIdx:0    },
    { first:'Robert',  age:74, condition:'post_surgical_recovery', services:['wound_care','mobility_assistance','medication_management'],   intensity:'medium', placement:'hourly',  hours:40,  city:'North York',  lang:'French',  matchedIdx:null },
    { first:'Margaret',age:88, condition:'dementia_alzheimers',    services:['personal_care','companionship','meal_preparation'],           intensity:'high',   placement:'live_in', hours:168, city:'Mississauga', lang:'English', matchedIdx:4    },
    { first:'James',   age:68, condition:'acquired_brain_injury',  services:['rehabilitation_support','mobility_assistance'],               intensity:'medium', placement:'hourly',  hours:20,  city:'Etobicoke',   lang:'English', matchedIdx:null },
    { first:'Patricia',age:79, condition:'parkinsons',             services:['personal_care','medication_management','mobility_assistance'], intensity:'high',   placement:'hourly',  hours:35,  city:'North York',  lang:'English', matchedIdx:null },
    { first:'William', age:85, condition:'companion_social',       services:['companionship','meal_preparation','light_housekeeping'],      intensity:'low',    placement:'hourly',  hours:15,  city:'Pickering',   lang:'English', matchedIdx:2    },
  ];

  const clientIds = [];
  for (const cl of clients) {
    const id = uid();
    clientIds.push({id, ...cl});
    const matchedCgId = cl.matchedIdx !== null ? cgIds[cl.matchedIdx].id : null;
    await p.query(`
      INSERT INTO client_needs (
        id, agency_id, client_first_name, client_age, primary_condition,
        services_needed, care_intensity, placement_type, hours_per_week,
        city, state, language_required, status, matched_caregiver_id, locale, created_at
      ) VALUES ($1,$2::uuid,$3,$4,$5,$6,$7,$8,$9,$10,'ON',$11,$12,$13,$14,NOW()-INTERVAL '${Math.floor(Math.random()*20)+1} days')
      ON CONFLICT DO NOTHING
    `, [
      id, AGENCY_ID, cl.first, cl.age, cl.condition,
      `{${cl.services.join(',')}}`,
      cl.intensity, cl.placement, cl.hours,
      cl.city, cl.lang,
      matchedCgId ? 'matched' : 'open',
      matchedCgId, LOCALE
    ]);
    console.log(`  ✓ Client: ${cl.first} — ${matchedCgId ? 'matched ✓' : 'UNMATCHED ⚠'}`);
  }

  // 4. SHORTLIST PIPELINE
  const pipeline = [
    {cgIdx:0, status:'placed'},
    {cgIdx:1, status:'interviewing'},
    {cgIdx:2, status:'placed'},
    {cgIdx:3, status:'contacted'},
    {cgIdx:4, status:'placed'},
    {cgIdx:5, status:'interviewing'},
    {cgIdx:6, status:'discovered'},
    {cgIdx:7, status:'discovered'},
    {cgIdx:8, status:'discovered'},
  ];
  for (const e of pipeline) {
    await p.query(`
      INSERT INTO agency_shortlist (id,agency_clerk_id,caregiver_id,pipeline_status,created_at)
      VALUES ($1,$2,$3,$4,NOW()-INTERVAL '${Math.floor(Math.random()*14)+1} days')
      ON CONFLICT DO NOTHING
    `, [uid(), AGENCY_CLERK_ID, cgIds[e.cgIdx].id, e.status]);
  }
  console.log('\n  ✓ Pipeline: 3 placed, 2 interviewing, 1 contacted, 3 discovered');

  // 5. AIRECRUIT
  const campId = uid();
  await p.query(`
    INSERT INTO airecruit_campaigns (id,agency_id,name,status,created_at,updated_at)
    VALUES ($1,$2,'PSW Screening — May 2026','completed',NOW()-INTERVAL '2 days',NOW()-INTERVAL '10 hours')
    ON CONFLICT DO NOTHING
  `, [campId, AGENCY_ID]);

  const airResults = [
    {name:'Priya Sharma',    score:87, rec:'strong_fit',   summary:'Excellent dementia care background. Strong medication management. Recommend for immediate interview.'},
    {name:'David Okonkwo',   score:64, rec:'review',       summary:'Good general care skills. Limited overnight experience. Worth a follow-up call.'},
    {name:'Ana Rodrigues',   score:91, rec:'strong_fit',   summary:'Outstanding references. 4 years consistent placements. Bilingual. Top candidate this campaign.'},
    {name:'Thomas Beaumont', score:42, rec:'not_suitable', summary:'Limited experience for clinical roles. Better suited for companion care only.'},
  ];
  for (const r of airResults) {
    await p.query(`
      INSERT INTO airecruit_call_results (id,campaign_id,candidate_name,candidate_phone,overall_score,recommendation,summary,called_at)
      VALUES ($1,$2,$3,$4,$5,$6,$7,NOW()-INTERVAL '${Math.floor(Math.random()*18)+2} hours')
      ON CONFLICT DO NOTHING
    `, [uid(), campId, r.name, '4165550000', r.score, r.rec, r.summary]);
  }
  console.log('  ✓ AIRecruit: 1 campaign, 4 results (2 strong fits)');

  // 6. PLACEMENT OUTCOMES
  const placements = [
    {cgIdx:0, clIdx:0, days:120, reEngage:true,  reason:null},
    {cgIdx:4, clIdx:2, days:90,  reEngage:true,  reason:null},
    {cgIdx:2, clIdx:5, days:45,  reEngage:true,  reason:null},
    {cgIdx:1, clIdx:1, days:30,  reEngage:true,  reason:'client_condition_changed'},
    {cgIdx:5, clIdx:3, days:14,  reEngage:null,  reason:'caregiver_withdrew'},
  ];
  for (const pl of placements) {
    const end = new Date(); end.setDate(end.getDate() - Math.floor(Math.random()*20+5));
    const start = new Date(end); start.setDate(start.getDate() - pl.days);
    await p.query(`
      INSERT INTO placement_outcomes (id,caregiver_id,agency_id,client_needs_id,start_date,end_date,duration_days,would_place_again,reason_ended,created_at)
      VALUES ($1,$2::uuid,$3::uuid,$4::uuid,$5,$6,$7,$8,$9,NOW())
      ON CONFLICT DO NOTHING
    `, [uid(), cgIds[pl.cgIdx].id, AGENCY_ID, clientIds[pl.clIdx].id,
        start.toISOString().split('T')[0], end.toISOString().split('T')[0],
        pl.days, pl.reEngage, pl.reason]);
  }
  console.log('  ✓ 5 historical placement outcomes');

  // 7. AUDIT LOG
  const activities = [
    {action:'shortlist_add',      detail:'Added Priya Sharma to shortlist'},
    {action:'profile_claimed',    detail:'Ana Rodrigues claimed her profile'},
    {action:'claim_email_queued', detail:'Invite sent to Thomas Beaumont'},
    {action:'shortlist_add',      detail:'Added Ana Rodrigues to shortlist'},
    {action:'roster_import',      detail:'CSV import — 8 caregivers added'},
  ];
  for (let i=0; i<activities.length; i++) {
    await p.query(`
      INSERT INTO "AuditLog" (id,"adminId",action,"table","newValue","createdAt")
      VALUES ($1,$2,$3,'agency',$4,NOW()-INTERVAL '${i*4+1} hours')
      ON CONFLICT DO NOTHING
    `, [uid(), AGENCY_CLERK_ID, activities[i].action, JSON.stringify({detail:activities[i].detail})]);
  }
  console.log('  ✓ 5 recent activity entries');

  // 8. UPDATE AGENCY
  await p.query(`
    UPDATE agencies SET
      name='Sunrise Senior Care Ontario',
      plan_tier='growth',
      subscription_status='trial',
      trial_ends_at=NOW()+INTERVAL '22 days',
      onboarding_step=3,
      service_areas=ARRAY['Scarborough','North York','Mississauga','Etobicoke','Pickering','Ajax'],
      care_types=ARRAY['dementia_care','post_surgical','palliative','companion_care'],
      coordinator_count=2,
      tagline='Trusted home care across the GTA'
    WHERE id=$1
  `, [AGENCY_ID]);
  console.log('  ✓ Agency: Sunrise Senior Care Ontario (Growth · Trial · 22 days left)');

  await p.end();
  console.log('\n✅ Seed complete:');
  console.log('   10 caregivers (8 active, 2 stubs)');
  console.log('   6 clients (3 matched, 3 unmatched)');
  console.log('   9 shortlist pipeline entries');
  console.log('   1 AIRecruit campaign, 4 results ready');
  console.log('   5 placement outcomes');
  console.log('   Expiring soon: Priya VSC in 5 days, James CPR in 18 days');
}

seed().catch(e => { console.error('\n❌ Seed failed:', e.message); process.exit(1); });
