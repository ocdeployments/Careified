import { Clock, Mail, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function PendingApprovalPage() {
  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4 py-10">
      <div className="max-w-md w-full text-center">

        {/* Icon */}
        <div className="w-18 h-18 rounded-2xl bg-gradient-to-br from-gold to-gold-warm flex items-center justify-center mx-auto mb-6">
          <Clock size={32} className="text-navy" />
        </div>

        {/* Heading */}
        <h1 className="font-serif text-3xl font-normal text-navy tracking-tight mb-3">
          Application received
        </h1>
        <p className="text-[15px] text-slate-500 leading-relaxed mb-8">
          Your agency account is under review. We verify all agencies before granting
          access to caregiver profiles. You will receive an email once your account is approved.
        </p>

        {/* Status card */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 mb-6 text-left">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center flex-shrink-0">
              <Clock size={16} className="text-gold" />
            </div>
            <div>
              <div className="text-sm font-semibold text-navy">Review in progress</div>
              <div className="text-xs text-slate-500">Typically 1–2 business days</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Mail size={16} className="text-slate-400" />
            </div>
            <div>
              <div className="text-sm font-semibold text-navy">Email notification</div>
              <div className="text-xs text-slate-500">
                We&apos;ll email you at the address you registered with when your account is approved.
              </div>
            </div>
          </div>
        </div>

        {/* What happens next */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 mb-8 text-left">
          <h2 className="text-sm font-bold text-navy mb-3">What happens next?</h2>
          <ul className="space-y-2">
            {[
              'Our team reviews your agency details',
              'We verify your license and contact information',
              'You receive an approval email with login instructions',
              'Full access to caregiver search and matching',
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-2.5 text-xs text-slate-600">
                <CheckCircle size={14} className="text-green-500 flex-shrink-0 mt-0.5" />
                {step}
              </li>
            ))}
          </ul>
        </div>

        <Link
          href="/"
          className="inline-block px-6 py-2.5 rounded-xl bg-navy text-white text-sm font-semibold hover:bg-navy-light transition-colors focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none"
        >
          Back to home
        </Link>
      </div>
    </div>
  )
}
