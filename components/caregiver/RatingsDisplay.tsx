'use client';

import { useState, useEffect } from 'react';
import { Star, CheckCircle, XCircle } from 'lucide-react';

interface RatingsDisplayProps {
  caregiverId: string;
}

interface RatingData {
  id: string;
  agencyName: string;
  reliability: number;
  punctuality: number;
  warmth: number;
  dignity: number;
  hygiene: number;
  skillsMatch: number;
  wouldReengage: boolean;
  publicComment: string | null;
  createdAt: string;
}

function CategoryBar({ label, value }: { label: string; value: number }) {
  const percentage = (value / 5) * 100;
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm text-slate-700">{label}</span>
        <span className="text-sm font-medium text-slate-900">{value.toFixed(1)}</span>
      </div>
      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full bg-amber-400 rounded-full" style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}

export function RatingsDisplay({ caregiverId }: RatingsDisplayProps) {
  const [ratings, setRatings] = useState<RatingData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/caregivers/${caregiverId}/ratings`)
      .then(res => res.json())
      .then(data => {
        setRatings(data.ratings || []);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [caregiverId]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Ratings & Reviews</h2>
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-slate-200 rounded w-3/4"></div>
          <div className="h-4 bg-slate-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!ratings || ratings.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Ratings & Reviews</h2>
        <p className="text-sm text-slate-500">No ratings yet</p>
      </div>
    );
  }
  
  const averages = {
    reliability: ratings.reduce((sum, r) => sum + r.reliability, 0) / ratings.length,
    punctuality: ratings.reduce((sum, r) => sum + r.punctuality, 0) / ratings.length,
    warmth: ratings.reduce((sum, r) => sum + r.warmth, 0) / ratings.length,
    dignity: ratings.reduce((sum, r) => sum + r.dignity, 0) / ratings.length,
    hygiene: ratings.reduce((sum, r) => sum + r.hygiene, 0) / ratings.length,
    skillsMatch: ratings.reduce((sum, r) => sum + r.skillsMatch, 0) / ratings.length,
  };

  const avg = (averages.reliability + averages.punctuality + averages.warmth + averages.dignity + averages.hygiene + averages.skillsMatch) / 6;
  const wouldReengagePercent = (ratings.filter(r => r.wouldReengage).length / ratings.length) * 100;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6">
      <h2 className="text-lg font-bold text-slate-900 mb-4">Ratings & Reviews</h2>
      
      <div className="flex items-start gap-6 mb-6">
        <div className="text-center">
          <div className="text-4xl font-bold text-slate-900">{avg.toFixed(1)}</div>
          <div className="flex items-center gap-0.5 mt-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-4 h-4 ${
                  star <= Math.floor(avg) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                }`}
              />
            ))}
          </div>
          <p className="text-xs text-slate-500 mt-1">{ratings.length} ratings</p>
        </div>
        
        <div className="flex-1 grid grid-cols-2 gap-x-6 gap-y-3">
          <CategoryBar label="Reliability" value={averages.reliability} />
          <CategoryBar label="Punctuality" value={averages.punctuality} />
          <CategoryBar label="Warmth" value={averages.warmth} />
          <CategoryBar label="Dignity" value={averages.dignity} />
          <CategoryBar label="Hygiene" value={averages.hygiene} />
          <CategoryBar label="Skills Match" value={averages.skillsMatch} />
        </div>
      </div>

      <div className="mb-4 p-3 bg-slate-50 rounded-xl">
        <p className="text-sm font-medium text-slate-700">
          <CheckCircle className="w-4 h-4 inline mr-1 text-green-600" />
          {wouldReengagePercent.toFixed(0)}% would re-engage this caregiver
        </p>
      </div>

      <div className="space-y-4">
        {ratings.map((rating) => (
          <div key={rating.id} className="border-t border-slate-100 pt-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-sm font-medium text-slate-900">{rating.agencyName || 'Agency'}</p>
                  <p className="text-xs text-slate-600">
                    {new Date(rating.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  {rating.wouldReengage ? (
                    <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-green-100 text-green-700">
                      <CheckCircle className="w-3 h-3" /> Would re-engage
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-red-100 text-red-700">
                      <XCircle className="w-3 h-3" /> Would not
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-1 mb-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= Math.floor(avg) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                    }`}
                  />
                ))}
                <span className="text-sm text-slate-600 ml-2">{avg.toFixed(1)}</span>
              </div>
              
              {rating.publicComment && (
                <p className="text-sm text-slate-700 italic">"{rating.publicComment}"</p>
              )}
            </div>
        ))}
      </div>
    </div>
  );
}
