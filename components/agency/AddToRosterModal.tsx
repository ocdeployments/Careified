'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

interface AddToRosterModalProps {
 caregiverId: string;
 isOpen: boolean;
 onClose: () => void;
 onSuccess: () => void;
}

export function AddToRosterModal({ caregiverId, isOpen, onClose, onSuccess }: AddToRosterModalProps) {
 
 const [formData, setFormData] = useState({
  startDate: new Date().toISOString().split('T')[0],
  employmentType: 'permanent',
  payRate: '',
  payRateType: 'hourly',
  privateNotes: '',
 });
 
 const [submitting, setSubmitting] = useState(false);
 
 if (!isOpen) return null;
 
 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setSubmitting(true);
 
  try {
   const response = await fetch('/api/agency/roster', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
     caregiverId,
     ...formData,
     payRate: formData.payRate ? parseFloat(formData.payRate) : null,
    }),
   });
 
   if (response.ok) {
    onSuccess();
   }
  } catch (error) {
   console.error('Failed to add to roster:', error);
  } finally {
   setSubmitting(false);
  }
 };
 
 return (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
   <div className="bg-white rounded-2xl max-w-md w-full p-6">
 
    <div className="flex items-center justify-between mb-6">
     <h2 className="text-lg font-bold text-slate-900">Add to Your Roster</h2>
     <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
      <X className="w-5 h-5" />
     </button>
    </div>
 
    <form onSubmit={handleSubmit} className="space-y-4">
 
     <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">Employment Start Date *</label>
      <input
       type="date"
       required
       value={formData.startDate}
       onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
       className="w-full px-4 py-2.5 rounded-xl border border-slate-200"
      />
     </div>
 
     <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">Employment Type *</label>
      <select
       value={formData.employmentType}
       onChange={(e) => setFormData(prev => ({ ...prev, employmentType: e.target.value }))}
       className="w-full px-4 py-2.5 rounded-xl border border-slate-200"
      >
       <option value="permanent">Permanent employee</option>
       <option value="contract">Contract (fixed term)</option>
       <option value="casual">Casual / on-call</option>
      </select>
     </div>
 
     <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">Pay Rate <span className="text-slate-400 font-normal">(Optional, private)</span></label>
      <div className="flex gap-3">
       <input
        type="number"
        step="0.01"
        min="0"
        placeholder="28.50"
        value={formData.payRate}
        onChange={(e) => setFormData(prev => ({ ...prev, payRate: e.target.value }))}
        className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200"
       />
       <select
        value={formData.payRateType}
        onChange={(e) => setFormData(prev => ({ ...prev, payRateType: e.target.value }))}
        className="px-4 py-2.5 rounded-xl border border-slate-200"
       >
        <option value="hourly">per hour</option>
        <option value="salary">salary</option>
       </select>
      </div>
     </div>
 
     <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">Initial Notes <span className="text-slate-400 font-normal">(Optional)</span></label>
      <textarea
       rows={3}
       placeholder="Any initial notes about this caregiver..."
       value={formData.privateNotes}
       onChange={(e) => setFormData(prev => ({ ...prev, privateNotes: e.target.value }))}
       className="w-full px-4 py-2.5 rounded-xl border border-slate-200 resize-none"
      />
     </div>
 
     <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
      <p className="text-xs text-blue-800">
       This information is private - only you can see it. The caregiver will NOT be notified.
      </p>
     </div>
 
     <div className="flex gap-3 pt-2">
      <button type="button" onClick={onClose} className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 font-medium hover:bg-slate-50">
       Cancel
      </button>
      <button type="submit" disabled={submitting} className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 disabled:opacity-50">
       {submitting ? 'Adding...' : 'Add to Roster'}
      </button>
     </div>
    </form>
   </div>
  </div>
 );
 }
