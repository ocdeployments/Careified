'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle } from 'lucide-react';

interface FormData {
  agencyName: string;
  businessType: string;
  licenseNumber: string;
  contactFirstName: string;
  contactLastName: string;
  contactEmail: string;
  contactPhone: string;
  streetAddress: string;
  city: string;
  state: string;
  postalCode: string;
  acceptedTerms: boolean;
}

interface FormErrors {
  agencyName?: string;
  contactFirstName?: string;
  contactLastName?: string;
  contactEmail?: string;
  contactPhone?: string;
  streetAddress?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  acceptedTerms?: string;
}

export function AgencySignupForm() {
 const router = useRouter();
 const [serverError, setServerError] = useState('');
 const [isSubmitting, setIsSubmitting] = useState(false);
 const [formData, setFormData] = useState<FormData>({
  agencyName: '',
  businessType: '',
  licenseNumber: '',
  contactFirstName: '',
  contactLastName: '',
  contactEmail: '',
  contactPhone: '',
  streetAddress: '',
  city: '',
  state: 'TX',
  postalCode: '',
  acceptedTerms: false
 });
 const [errors, setErrors] = useState<FormErrors>({});
 const [touched, setTouched] = useState<Record<string, boolean>>({});
 
 // Auto-format phone number
 const formatPhone = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) 
   return `(${digits.slice(0,3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6)}`;
 };
 
 const handleChange = (field: keyof FormData, value: string | boolean) => {
  if (field === 'contactPhone') {
   value = formatPhone(value as string);
  }
  setFormData(prev => ({ ...prev, [field]: value }));
  
  // Clear error when user types
  if (errors[field as keyof FormErrors]) {
   setErrors(prev => ({ ...prev, [field]: undefined }));
  }
 };
 
 const validate = (): boolean => {
  const newErrors: FormErrors = {};
  
  if (!formData.agencyName || formData.agencyName.length < 2) {
   newErrors.agencyName = 'Agency name must be at least 2 characters';
  }
  if (!formData.contactFirstName || formData.contactFirstName.length < 2) {
   newErrors.contactFirstName = 'First name required';
  }
  if (!formData.contactLastName || formData.contactLastName.length < 2) {
   newErrors.contactLastName = 'Last name required';
  }
  if (!formData.contactEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
   newErrors.contactEmail = 'Valid email required';
  }
  if (!formData.contactPhone || !/^\(\d{3}\) \d{3}-\d{4}$/.test(formData.contactPhone)) {
   newErrors.contactPhone = 'Phone format: (XXX) XXX-XXXX';
  }
  if (!formData.streetAddress || formData.streetAddress.length < 5) {
   newErrors.streetAddress = 'Street address required';
  }
  if (!formData.city || formData.city.length < 2) {
   newErrors.city = 'City required';
  }
  if (!formData.state) {
   newErrors.state = 'State required';
  }
  if (!formData.postalCode || !/^\d{5}$/.test(formData.postalCode)) {
   newErrors.postalCode = '5-digit ZIP code required';
  }
  if (!formData.acceptedTerms) {
   newErrors.acceptedTerms = 'You must accept terms to continue';
  }
  
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
 };
 
 const handleBlur = (field: string) => {
  setTouched(prev => ({ ...prev, [field]: true }));
 };
 
 const isValid = formData.agencyName && formData.contactFirstName && 
  formData.contactLastName && formData.contactEmail && 
  formData.contactPhone && formData.streetAddress && 
  formData.city && formData.state && formData.postalCode && 
  formData.acceptedTerms;
 
 const onSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!validate()) return;
  
  setIsSubmitting(true);
  setServerError('');
  
  try {
   const response = await fetch('/api/agency/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
   });
   
   const result = await response.json();
   
   if (!response.ok) {
    setServerError(result.error || 'Signup failed');
    return;
   }
   
   router.push('/agency/pending-approval');
   
  } catch (error) {
   setServerError('Network error. Please try again.');
  } finally {
   setIsSubmitting(false);
  }
 };
 
 return (
  <div className="min-h-screen bg-slate-50 py-12 px-4">
   <div className="max-w-4xl mx-auto">
 
   <div className="text-center mb-8">
    <h1 className="text-3xl font-bold text-slate-900 mb-2">
     Create Your Agency Account
    </h1>
    <p className="text-slate-600">
     Join 250+ care agencies finding qualified caregivers through verified profiles
    </p>
   </div>
 
   {serverError && (
    <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
     <p className="text-sm text-red-800 flex items-center gap-2">
      <AlertCircle className="w-4 h-4" />
      {serverError}
     </p>
    </div>
   )}
 
   <form onSubmit={onSubmit} className="space-y-6">
 
   <div className="bg-white rounded-2xl border border-slate-100 p-6">
    <h2 className="text-lg font-bold text-slate-900 mb-4">Agency Information</h2>
    
    <div className="space-y-4">
     <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">Agency Name *</label>
      <input
       value={formData.agencyName}
       onChange={e => handleChange('agencyName', e.target.value)}
       onBlur={() => handleBlur('agencyName')}
       type="text"
       placeholder="e.g. Sunshine Home Care Services"
       className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:border-blue-500"
      />
      {touched.agencyName && errors.agencyName && (
       <p className="text-xs text-red-600 mt-1">{errors.agencyName}</p>
      )}
     </div>
 
     <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">Business Type</label>
      <select
       value={formData.businessType}
       onChange={e => handleChange('businessType', e.target.value)}
       className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:border-blue-500"
      >
       <option value="">Select type...</option>
       <option value="home_care">Home care agency</option>
       <option value="placement">Placement/staffing agency</option>
       <option value="nursing">Nursing agency</option>
       <option value="registry">Healthcare registry</option>
       <option value="other">Other</option>
      </select>
     </div>
 
     <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">
       License/Registration Number <span className="text-slate-400 font-normal">(Optional)</span>
      </label>
      <input
       value={formData.licenseNumber}
       onChange={e => handleChange('licenseNumber', e.target.value)}
       type="text"
       placeholder="State license number if applicable"
       className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:border-blue-500"
      />
     </div>
    </div>
   </div>
 
   <div className="bg-white rounded-2xl border border-slate-100 p-6">
    <h2 className="text-lg font-bold text-slate-900 mb-4">Primary Contact</h2>
    
    <div className="space-y-4">
     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
       <label className="block text-sm font-medium text-slate-700 mb-1">First Name *</label>
       <input
        value={formData.contactFirstName}
        onChange={e => handleChange('contactFirstName', e.target.value)}
        onBlur={() => handleBlur('contactFirstName')}
        type="text"
        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:border-blue-500"
       />
       {touched.contactFirstName && errors.contactFirstName && (
        <p className="text-xs text-red-600 mt-1">{errors.contactFirstName}</p>
       )}
      </div>
 
      <div>
       <label className="block text-sm font-medium text-slate-700 mb-1">Last Name *</label>
       <input
        value={formData.contactLastName}
        onChange={e => handleChange('contactLastName', e.target.value)}
        onBlur={() => handleBlur('contactLastName')}
        type="text"
        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:border-blue-500"
       />
       {touched.contactLastName && errors.contactLastName && (
        <p className="text-xs text-red-600 mt-1">{errors.contactLastName}</p>
       )}
      </div>
     </div>
 
     <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">Email Address *</label>
      <input
       value={formData.contactEmail}
       onChange={e => handleChange('contactEmail', e.target.value)}
       onBlur={() => handleBlur('contactEmail')}
       type="email"
       placeholder="This will be your login email"
       className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:border-blue-500"
      />
      {touched.contactEmail && errors.contactEmail && (
       <p className="text-xs text-red-600 mt-1">{errors.contactEmail}</p>
      )}
     </div>
 
     <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number *</label>
      <input
       value={formData.contactPhone}
       onChange={e => handleChange('contactPhone', e.target.value)}
       onBlur={() => handleBlur('contactPhone')}
       type="tel"
       placeholder="(XXX) XXX-XXXX"
       className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:border-blue-500"
      />
      {touched.contactPhone && errors.contactPhone && (
       <p className="text-xs text-red-600 mt-1">{errors.contactPhone}</p>
      )}
     </div>
    </div>
   </div>
 
   <div className="bg-white rounded-2xl border border-slate-100 p-6">
    <h2 className="text-lg font-bold text-slate-900 mb-4">Business Address</h2>
    
    <div className="space-y-4">
     <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">Street Address *</label>
      <input
       value={formData.streetAddress}
       onChange={e => handleChange('streetAddress', e.target.value)}
       onBlur={() => handleBlur('streetAddress')}
       type="text"
       className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:border-blue-500"
      />
      {touched.streetAddress && errors.streetAddress && (
       <p className="text-xs text-red-600 mt-1">{errors.streetAddress}</p>
      )}
     </div>
 
     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
       <label className="block text-sm font-medium text-slate-700 mb-1">City *</label>
       <input
        value={formData.city}
        onChange={e => handleChange('city', e.target.value)}
        onBlur={() => handleBlur('city')}
        type="text"
        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:border-blue-500"
       />
       {touched.city && errors.city && (
        <p className="text-xs text-red-600 mt-1">{errors.city}</p>
       )}
      </div>
 
      <div>
       <label className="block text-sm font-medium text-slate-700 mb-1">State *</label>
       <select
        value={formData.state}
        onChange={e => handleChange('state', e.target.value)}
        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:border-blue-500"
       >
        <option value="TX">Texas</option>
        <option value="CA">California</option>
        <option value="NY">New York</option>
        <option value="FL">Florida</option>
        <option value="WA">Washington</option>
        <option value="IL">Illinois</option>
        <option value="PA">Pennsylvania</option>
        <option value="OH">Ohio</option>
        <option value="GA">Georgia</option>
        <option value="NC">North Carolina</option>
        <option value="MI">Michigan</option>
        <option value="NJ">New Jersey</option>
        <option value="VA">Virginia</option>
        <option value="AZ">Arizona</option>
        <option value="MA">Massachusetts</option>
        <option value="TN">Tennessee</option>
        <option value="IN">Indiana</option>
        <option value="MO">Missouri</option>
        <option value="MD">Maryland</option>
        <option value="WI">Wisconsin</option>
        <option value="CO">Colorado</option>
        <option value="MN">Minnesota</option>
        <option value="SC">South Carolina</option>
        <option value="AL">Alabama</option>
        <option value="LA">Louisiana</option>
        <option value="KY">Kentucky</option>
        <option value="OR">Oregon</option>
        <option value="OK">Oklahoma</option>
        <option value="CT">Connecticut</option>
        <option value="UT">Utah</option>
        <option value="IA">Iowa</option>
        <option value="NV">Nevada</option>
        <option value="AR">Arkansas</option>
        <option value="MS">Mississippi</option>
        <option value="KS">Kansas</option>
        <option value="NM">New Mexico</option>
        <option value="NE">Nebraska</option>
        <option value="WV">West Virginia</option>
        <option value="ID">Idaho</option>
        <option value="HI">Hawaii</option>
        <option value="ME">Maine</option>
        <option value="MT">Montana</option>
        <option value="RI">Rhode Island</option>
        <option value="DE">Delaware</option>
        <option value="SD">South Dakota</option>
        <option value="ND">North Dakota</option>
        <option value="AK">Alaska</option>
        <option value="VT">Vermont</option>
        <option value="WY">Wyoming</option>
        <option value="DC">Washington D.C.</option>
       </select>
      </div>
     </div>
 
     <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">ZIP Code *</label>
      <input
       value={formData.postalCode}
       onChange={e => handleChange('postalCode', e.target.value.replace(/\D/g, '').slice(0,5))}
       onBlur={() => handleBlur('postalCode')}
       type="text"
       placeholder="5-digit ZIP code"
       maxLength={5}
       className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:border-blue-500"
      />
      {touched.postalCode && errors.postalCode && (
       <p className="text-xs text-red-600 mt-1">{errors.postalCode}</p>
      )}
     </div>
    </div>
   </div>
 
   <div className="bg-white rounded-2xl border border-slate-100 p-6">
    <label className="flex items-start gap-3 cursor-pointer mb-6">
     <input
      checked={formData.acceptedTerms}
      onChange={e => handleChange('acceptedTerms', e.target.checked)}
      type="checkbox"
      className="mt-1 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
     />
     <span className="text-sm text-slate-700">
      I agree to Careified's{' '}
      <a href="/terms" target="_blank" className="text-blue-600 hover:underline">
       Terms of Service
      </a>
      {' '}and{' '}
      <a href="/privacy" target="_blank" className="text-blue-600 hover:underline">
       Privacy Policy
      </a>
     </span>
    </label>
    {touched.acceptedTerms && errors.acceptedTerms && (
     <p className="text-xs text-red-600 mb-4">{errors.acceptedTerms}</p>
    )}
 
    <button
     type="submit"
     disabled={!isValid || isSubmitting}
     className="w-full py-3 px-6 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
     {isSubmitting ? 'Creating account...' : 'Create Agency Account →'}
    </button>
 
    <p className="text-xs text-slate-500 text-center mt-3">
     By creating an account, you'll be placed in our approval queue. 
     Most agencies are approved within 24 hours.
    </p>
   </div>
 
   </form>
   </div>
  </div>
 );
}
