import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F7F4F0] flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="font-serif text-[120px] leading-none text-[#0D1B3E]/10 select-none mb-2">
          404
        </div>
        <h1 className="font-serif text-3xl text-[#0D1B3E] mb-3">
          Page not found
        </h1>
        <p className="text-sm text-slate-500 leading-relaxed mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-3 rounded-lg bg-[#0D1B3E] text-white text-sm font-semibold hover:bg-[#1a2d5a] transition-colors focus-visible:ring-2 focus-visible:ring-[#C9973A] focus-visible:outline-none"
          >
            ← Back to home
          </Link>
          <Link
            href="/agency/search"
            className="w-full sm:w-auto px-6 py-3 rounded-lg border-2 border-[#0D1B3E] text-[#0D1B3E] text-sm font-semibold hover:bg-[#0D1B3E]/5 transition-colors focus-visible:ring-2 focus-visible:ring-[#C9973A] focus-visible:outline-none"
          >
            Search caregivers
          </Link>
        </div>
      </div>
    </div>
  )
}
