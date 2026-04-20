'use client'
import { useState } from 'react'
import { Bookmark } from 'lucide-react'
import { toast } from 'sonner'

interface ShortlistButtonProps {
  caregiverId: string
  initialSaved?: boolean
}

export function ShortlistButton({ caregiverId, initialSaved = false }: ShortlistButtonProps) {
  const [saved, setSaved] = useState(initialSaved)
  const [isPending, setIsPending] = useState(false)

  const toggle = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (isPending) return

    setIsPending(true)
    const method = saved ? 'DELETE' : 'POST'
    try {
      const res = await fetch('/api/agency/shortlist', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caregiverId }),
      })
      if (!res.ok) throw new Error('Request failed')
      setSaved(!saved)
      toast.success(saved ? 'Removed from shortlist' : 'Added to shortlist')
    } catch {
      toast.error('Failed to update shortlist — please try again')
    } finally {
      setIsPending(false)
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={isPending}
      aria-label={saved ? 'Remove from shortlist' : 'Add to shortlist'}
      aria-pressed={saved}
      className={[
        'flex items-center justify-center w-8 h-8 rounded-full border transition-all duration-150',
        'focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none',
        isPending ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
        saved
          ? 'bg-gold/10 border-gold/30 text-gold hover:bg-gold/20'
          : 'bg-white border-slate-200 text-slate-400 hover:border-gold/30 hover:text-gold',
      ].join(' ')}
    >
      <Bookmark size={14} className={saved ? 'fill-gold' : ''} />
    </button>
  )
}
