'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

interface ShiftLogModalProps {
 relationshipId: string;
 isOpen: boolean;
 onClose: () => void;
 onSuccess: () => void;
}

export function ShiftLogModal({ relationshipId, isOpen, onClose, onSuccess }: ShiftLogModalProps) {
 
 const [formData, setFormData] = useState({
  shiftDate: new Date().toISOString().split('T')[0],
  startTime: '09:00',
  endTime: '17:00',
  status: 'completed',
  notes: '',
 });
 
 const [submitting, setSubmitting] = useState(false);
 
 if (!isOpen) return null;
 
 const calculateHours = () => {
  const [startH, startM] = formData.startTime.split(':').map(Number);
  const [endH, endM] = formData.endTime.split(':').map(Number);
  const start = startH + startM / 60;
  const end = endH + endM / 60;
  return Math.abs(end - start);
 };
 
 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setSubmitting(true);
 
  try {
   const response = await fetch('/api/agency/shifts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
     relationshipId,
     ...formData,
     hoursWorked: calculateHours(),
    }),
   });
 
   if (response.ok) {
    onSuccess();
   }
  } catch (error) {
   console.error('Failed to log shift:', error);
  } finally {
   setSubmitting(false);
  }
 };
 
 return (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
   <div className="bg-white rounded-2xl max-w-md w-full p-6">
 
    <div className="flex items-center justify-between mb-6">
     <h2 className="text-lg font-bold text-slate-900">Log Shift</h2>
     <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
      <X className="w-5 h-5" />
     </button>
    </div>
 
    <form onSubmit={handleSubmit} className="space-y-4">
 
     <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">Date *</label>
      <input
       type="date"
       required
       value={formData.shiftDate}
       onChange={(e) => setFormData(prev => ({ ...prev, shiftDate: e.target.value }))}
       className="w-full px-4 py-2.5 rounded-xl border border-slate-200"
      />
     </div>
 
     <div className="grid grid-cols-2 gap-3">
      <div>
       <label className="block text-sm font-medium text-slate-700 mb-1">Start Time *</label>
       <input
        type="time"
        required
        value={formData.startTime}
        onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
        className="w-full px-4 py-2.5 rounded-xl border border-slate-200"
       />
      </div>
      <div>
       <label className="block text-sm font-medium text-slate-700 mb-1">End Time *</label>
       <input
        type="time"
        required
        value={formData.endTime}
        onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
        className="w-full px-4 py-2.5 rounded-xl border border-slate-200"
       />
      </div>
     </div>
 
     <div className="bg-slate-50 rounded-xl p-3">
      <p className="text-sm text-slate-600">
       Hours worked: <span className="font-bold text-slate-900">{calculateHours().toFixed(1)}</span>
      </p>
     </div>
 
     <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">Status *</label>
      <select
       value={formData.status}
       onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
       className="w-full px-4 py-2.5 rounded-xl border border-slate-200"
      >
       <option value="completed">Completed as scheduled</option>
       <option value="no_show">No-show</option>
       <option value="cancelled">Cancelled (with notice)</option>
      </select>
     </div>
 
     <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">Notes <span className="text-slate-400 font-normal">(Optional)</span></label>
      <textarea
       rows={2}
       placeholder="Any notes about this shift..."
       value={formData.notes}
       onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
       className="w-full px-4 py-2.5 rounded-xl border border-slate-200 resize-none"
      />
     </div>
 
     <div className="flex gap-3 pt-2">
      <button type="button" onClick={onClose} className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 font-medium hover:bg-slate-50">
       Cancel
      </button>
      <button type="submit" disabled={submitting} className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 disabled:opacity-50">
       {submitting ? 'Logging...' : 'Log Shift'}
      </button>
     </div>
    </form>
   </div>
  </div>
 );
 }
