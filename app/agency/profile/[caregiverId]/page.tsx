import { notFound } from 'next/navigation';

interface ProfilePageProps {
  params: Promise<{ caregiverId: string }>;
}

export default async function CaregiverProfilePage({ params }: ProfilePageProps) {
  const { caregiverId } = await params;
  
  // Demo caregiver data (replace with DB fetch later)
  const demoCaregiver = {
    firstName: 'Sarah',
    lastName: 'Johnson',
    title: 'Certified Nursing Assistant',
    email: 'sarah.johnson@email.com',
    phone: '(555) 123-4567',
    bio: 'Passionate healthcare professional with 5+ years of experience in geriatric care. Dedicated to providing compassionate, quality care to seniors in the comfort of their homes.',
    credentials: ['CNA', 'CPR', 'First Aid'],
    specialties: ['Elder Care', 'Dementia Care', 'Post-Surgery Recovery']
  };

  const initials = `${demoCaregiver.firstName[0]}${demoCaregiver.lastName[0]}`;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', paddingTop: '80px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '24px' }}>
          {/* Main Content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Header */}
            <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '32px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#0D1B3E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '28px', fontWeight: 700, color: '#C9973A' }}>{initials}</span>
                </div>
                <div>
                  <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#0f172a', margin: 0 }}>{demoCaregiver.firstName} {demoCaregiver.lastName}</h1>
                  <p style={{ color: '#64748b', margin: '4px 0 0' }}>{demoCaregiver.title}</p>
                </div>
              </div>
            </div>
            
            {/* About */}
            <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#0f172a', margin: '0 0 16px' }}>About</h2>
              <p style={{ color: '#475569', lineHeight: 1.6 }}>{demoCaregiver.bio}</p>
            </div>
            
            {/* Credentials */}
            <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#0f172a', margin: '0 0 16px' }}>Credentials</h2>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {demoCaregiver.credentials.map(cred => (
                  <span key={cred} style={{ padding: '6px 12px', backgroundColor: '#f0f9ff', borderRadius: '100px', fontSize: '14px', color: '#0369a1' }}>{cred}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#64748b', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Contact</h3>
              <p style={{ color: '#0f172a', margin: '8px 0' }}>{demoCaregiver.email}</p>
              <p style={{ color: '#0f172a', margin: '8px 0' }}>{demoCaregiver.phone}</p>
            </div>
            
            <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#64748b', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Specialties</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {demoCaregiver.specialties.map(spec => (
                  <p key={spec} style={{ color: '#0f172a', margin: 0 }}>• {spec}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
