'use client';

import { useState, useEffect } from 'react';
import { AddToRosterModal } from './AddToRosterModal';
import { ShiftLogModal } from './ShiftLogModal';
import { RatingModal } from './RatingModal';
import { UserPlus, FileText, Calendar, TrendingUp, Star } from 'lucide-react';

interface PrivateRelationshipPanelProps {
  caregiverId: string;
}

interface Relationship {
  id: string;
  startDate: string;
  employmentType: string;
  currentlyEmployed: boolean;
  privateNotes: string;
  payRate: number;
  payRateType: string;
  totalShifts: number;
  noShowCount: number;
}

export function PrivateRelationshipPanel({ caregiverId }: PrivateRelationshipPanelProps) {
  const [relationship, setRelationship] = useState<Relationship | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRelationship();
  }, [caregiverId]);

  const fetchRelationship = async () => {
    try {
      const response = await fetch(`/api/agency/roster?caregiverId=${caregiverId}`);
      if (response.ok) {
        const data = await response.json();
        setRelationship(data.relationship);
      }
    } catch (error) {
      console.error('Failed to fetch relationship:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddedToRoster = () => {
    setShowAddModal(false);
    fetchRelationship();
  };

  const handleShiftLogged = () => {
    setShowShiftModal(false);
    fetchRelationship();
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-slate-200 rounded w-3/4"></div>
          <div className="h-4 bg-slate-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!relationship) {
    return (
      <>
        <div className="bg-white rounded-2xl border border-slate-100 p-6 sticky top-4">
          <h3 className="font-bold text-slate-900 mb-3">Your Private Records</h3>
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <UserPlus className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-sm text-slate-600 mb-4">Not on your roster yet</p>
            <button onClick={() => setShowAddModal(true)} className="w-full py-2.5 px-4 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700">
              Add to Your Roster
            </button>
          </div>
          <div className="mt-6 pt-6 border-t border-slate-100">
            <p className="text-xs text-slate-500 leading-relaxed">
              Adding to your roster lets you track shifts, log private notes, and manage this caregiver within your agency.
            </p>
          </div>
        </div>
        <AddToRosterModal caregiverId={caregiverId} isOpen={showAddModal} onClose={() => setShowAddModal(false)} onSuccess={handleAddedToRoster} />
      </>
    );
  }

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-100 p-6 sticky top-4 space-y-6">
        <div>
          <h3 className="font-bold text-slate-900 mb-1">Your Private Records</h3>
          <p className="text-xs text-slate-500">Only you can see this</p>
        </div>
        <div>
          <p className="text-xs font-medium text-slate-500 mb-2">Employment Status</p>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${relationship.currentlyEmployed ? 'bg-green-500' : 'bg-slate-400'}`} />
            <span className="text-sm font-medium text-slate-900">
              {relationship.currentlyEmployed ? 'Currently Employed' : 'Previously Employed'}
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1">Started: {new Date(relationship.startDate).toLocaleDateString()}</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-slate-50 rounded-xl">
            <p className="text-xs text-slate-500 mb-1">Total Shifts</p>
            <p className="text-xl font-bold text-slate-900">{relationship.totalShifts}</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl">
            <p className="text-xs text-slate-500 mb-1">No-Shows</p>
            <p className="text-xl font-bold text-slate-900">{relationship.noShowCount}</p>
          </div>
        </div>
        {relationship.payRate && (
          <div>
            <p className="text-xs font-medium text-slate-500 mb-1">Pay Rate (Private)</p>
            <p className="text-sm font-medium text-slate-900">${relationship.payRate.toFixed(2)}/{relationship.payRateType === 'hourly' ? 'hour' : 'salary'}</p>
          </div>
        )}
        <div>
          <p className="text-xs font-medium text-slate-500 mb-2">Private Notes</p>
          <div className="p-3 bg-slate-50 rounded-xl min-h-[80px]">
            <p className="text-sm text-slate-700 whitespace-pre-line">{relationship.privateNotes || 'No notes yet...'}</p>
          </div>
        </div>
        <div className="space-y-2">
          <button onClick={() => setShowShiftModal(true)} className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700">
            <Calendar className="w-4 h-4" />Log Shift
          </button>
          <button onClick={() => setShowRatingModal(true)} className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50">
            <Star className="w-4 h-4" />Rate This Caregiver
          </button>
        </div>
      </div>
      <ShiftLogModal relationshipId={relationship.id} isOpen={showShiftModal} onClose={() => setShowShiftModal(false)} onSuccess={handleShiftLogged} />
      <RatingModal
        relationshipId={relationship.id}
        caregiverName="Caregiver"
        isOpen={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        onSuccess={() => {
          setShowRatingModal(false);
          fetchRelationship();
        }}
      />
    </>
  );
}
