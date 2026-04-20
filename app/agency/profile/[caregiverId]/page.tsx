import { PrivateRelationshipPanel } from '@/components/agency/PrivateRelationshipPanel'
import { RatingsDisplay } from '@/components/caregiver/RatingsDisplay'

interface ProfilePageProps {
  params: Promise<{ caregiverId: string }>
}

export default async function CaregiverProfilePage({ params }: ProfilePageProps) {
  const { caregiverId } = await params

  // Demo caregiver data (replace with DB fetch later)
  const demo = {
    firstName: 'Sarah',
    lastName: 'Johnson',
    title: 'Certified Nursing Assistant',
    email: 'sarah.johnson@email.com',
    phone: '(555) 123-4567',
    bio: 'Passionate healthcare professional with 5+ years of experience in geriatric care. Dedicated to providing compassionate, quality care to seniors in the comfort of their homes.',
    credentials: ['CNA', 'CPR', 'First Aid'],
    specialties: ['Elder Care', 'Dementia Care', 'Post-Surgery Recovery'],
  }

  const initials = `${demo.firstName[0]}${demo.lastName[0]}`

  return (
    <div className="min-h-screen bg-slate-50 pt-20">
      <div className="max-w-[1200px] mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-6">

          {/* ── Main content ── */}
          <div className="flex flex-col gap-6">

            {/* Header card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-8">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-full bg-navy flex items-center justify-center flex-shrink-0">
                  <span className="text-[28px] font-bold text-gold">{initials}</span>
                </div>
                <div>
                  <h1 className="text-[28px] font-bold text-slate-900 leading-tight">
                    {demo.firstName} {demo.lastName}
                  </h1>
                  <p className="text-slate-500 mt-1">{demo.title}</p>
                </div>
              </div>
            </div>

            {/* About */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">About</h2>
              <p className="text-slate-600 leading-relaxed">{demo.bio}</p>
            </div>

            {/* Credentials */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Credentials</h2>
              <div className="flex flex-wrap gap-2">
                {demo.credentials.map(cred => (
                  <span
                    key={cred}
                    className="px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-sm font-medium border border-blue-200"
                  >
                    {cred}
                  </span>
                ))}
              </div>
            </div>

            {/* Specialties */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Specialties</h2>
              <div className="flex flex-wrap gap-2">
                {demo.specialties.map(spec => (
                  <span
                    key={spec}
                    className="px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 text-sm font-medium border border-amber-200"
                  >
                    {spec}
                  </span>
                ))}
              </div>
            </div>

            {/* Ratings */}
            <RatingsDisplay caregiverId={caregiverId} />
          </div>

          {/* ── Sidebar ── */}
          <div className="flex flex-col gap-6">

            {/* Contact */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h2 className="text-base font-semibold text-slate-900 mb-4">Contact</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">Email</p>
                  <a
                    href={`mailto:${demo.email}`}
                    className="text-sm text-navy hover:text-gold transition-colors focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none rounded"
                  >
                    {demo.email}
                  </a>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">Phone</p>
                  <a
                    href={`tel:${demo.phone}`}
                    className="text-sm text-navy hover:text-gold transition-colors focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none rounded"
                  >
                    {demo.phone}
                  </a>
                </div>
              </div>
            </div>

            {/* Agency relationship panel */}
            <PrivateRelationshipPanel caregiverId={caregiverId} />
          </div>
        </div>
      </div>
    </div>
  )
}
