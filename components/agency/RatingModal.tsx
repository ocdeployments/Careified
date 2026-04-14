'use client';

import { useState } from 'react';
import { X, Star } from 'lucide-react';

interface RatingModalProps {
  relationshipId: string;
  caregiverName: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function RatingModal({ relationshipId, caregiverName, isOpen, onClose, onSuccess }: RatingModalProps) {
  const [ratings, setRatings] = useState({
    reliability: 0,
    punctuality: 0,
    warmth: 0,
    dignity: 0,
    hygiene: 0,
    skillsMatch: 0,
  });
  
  const [wouldReengage, setWouldReengage] = useState<boolean | null>(null);
  const [publicComment, setPublicComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  if (!isOpen) return null;
  
  const allRated = Object.values(ratings).every(r => r > 0) && wouldReengage !== null;
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allRated) return;
    
    setSubmitting(true);
    try {
      const response = await fetch('/api/agency/ratings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          relationshipId,
          ...ratings,
          wouldReengage,
          publicComment: publicComment.trim() || null,
        }),
      });
      
      if (response.ok) {
        onSuccess();
      }
    } catch (error) {
      console.error('Failed to submit rating:', error);
    } finally {
      setSubmitting(false);
    }
  };
  
  const categories = [
    { key: 'reliability', label: 'Reliability', desc: 'Did they show up consistently as scheduled?' },
    { key: 'punctuality', label: 'Punctuality', desc: 'Were they on time for shifts?' },
    { key: 'warmth', label: 'Warmth', desc: 'Were they kind and friendly with clients?' },
    { key: 'dignity', label: 'Dignity', desc: 'Did they treat clients with respect?' },
    { key: 'hygiene', label: 'Hygiene', desc: 'Did they maintain professional hygiene standards?' },
    { key: 'skillsMatch', label: 'Skills Match', desc: 'Did their skills match what they claimed?' },
  ];
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 my-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Rate {caregiverName}</h2>
            <p className="text-sm text-slate-600">Your rating will be visible to all agencies</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {categories.map(cat => (
            <div key={cat.key} className="pb-4 mb-4 border-b border-slate-100 last:border-0">
              <div className="mb-2">
                <p className="font-medium text-sm text-slate-900">{cat.label}</p>
                <p className="text-xs text-slate-600">{cat.desc}</p>
              </div>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(rating => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => setRatings(prev => ({ ...prev, [cat.key]: rating }))}
                    className={`p-2 rounded-lg transition-colors ${
                      ratings[cat.key as keyof typeof ratings] >= rating
                        ? 'bg-amber-100 text-amber-600'
                        : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    <Star className={`w-5 h-5 ${ratings[cat.key as keyof typeof ratings] >= rating ? 'fill-amber-400' : ''}`} />
                  </button>
                ))}
              </div>
            </div>
          ))}
          
          <div className="pt-4 border-t border-slate-200">
            <p className="font-medium text-sm text-slate-900 mb-2">Would you work with this caregiver again? *</p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setWouldReengage(true)}
                className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                  wouldReengage === true ? 'bg-green-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Yes, I would
              </button>
              <button
                type="button"
                onClick={() => setWouldReengage(false)}
                className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                  wouldReengage === false ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                No, I would not
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Public Comment <span className="text-slate-400 font-normal">(Optional, 500 chars max)</span>
            </label>
            <textarea
              rows={3}
              maxLength={500}
              placeholder="Share your experience working with this caregiver..."
              value={publicComment}
              onChange={(e) => setPublicComment(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 resize-none"
            />
            <p className="text-xs text-slate-500 mt-1">{publicComment.length}/500 characters</p>
          </div>
          
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
            <p className="text-xs text-blue-800">
              <strong>Privacy Notice:</strong> This rating will be visible to all agencies on Careified.
            </p>
          </div>
          
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-slate-700 font-medium hover:bg-slate-50">
              Cancel
            </button>
            <button type="submit" disabled={!allRated || submitting} className="flex-1 py-3 px-4 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 disabled:opacity-50">
              {submitting ? 'Submitting...' : 'Submit Rating'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
