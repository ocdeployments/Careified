'use client';

import { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Upload, CheckCircle } from 'lucide-react';

interface Step1IdentityProps {
  initialData?: Record<string, unknown>;
  onSave: (data: Record<string, unknown>) => void;
}

export default function Step1Identity({ initialData = {}, onSave }: Step1IdentityProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    preferredName: '',
    email: '',
    phone: '',
    city: '',
    state: '',
    postalCode: '',
    gender: '',
    languages: [] as string[],
    ...initialData,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSaving(true);
      onSave(formData);
    localStorage.setItem("step1_identity", JSON.stringify(formData));
      setTimeout(() => {
        setIsSaving(false);
        setLastSaved(new Date());
      }, 500);
    }, 2000);
    return () => clearTimeout(timer);
  }, [formData, onSave]);

  const updateField = (field: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 10);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return '(' + digits.slice(0, 3) + ') ' + digits.slice(3);
    return '(' + digits.slice(0, 3) + ') ' + digits.slice(3, 6) + '-' + digits.slice(6);
  };

  const toggleLanguage = (lang: string) => {
    setFormData((prev) => ({
      ...prev,
      languages: prev.languages.includes(lang)
        ? prev.languages.filter((l) => l !== lang)
        : [...prev.languages, lang],
    }));
  };

  const LANGUAGES = ['English', 'Spanish', 'French', 'Mandarin', 'Cantonese', 'Tagalog', 'Hindi', 'Arabic', 'Portuguese', 'Vietnamese', 'Other'];
  const PRONOUNS = ['she/her', 'he/him', 'they/them', 'she/they', 'he/they', 'other'];

  // Save city to localStorage for Step 3 auto-fill
  useEffect(() => {
    if (formData.city && formData.state) {
      localStorage.setItem('home_city', formData.city);
      localStorage.setItem('home_state', formData.state);
    }
  }, [formData.city, formData.state]);

  const labelStyle = { display: 'block', fontSize: '13px', fontWeight: 600, color: '#0D1B3E', marginBottom: '8px' };
  const inputStyle = { width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #E2E8F0', backgroundColor: 'white', fontSize: '13px', color: '#0D1B3E', outline: 'none' };
  const inputFocusStyle = { ...inputStyle, borderColor: '#C9973A', boxShadow: '0 0 0 3px rgba(201, 151, 58, 0.1)' };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ backgroundColor: '#FDF6EC', border: '1px solid rgba(201, 151, 58, 0.2)', borderRadius: '12px', padding: '20px', marginBottom: '32px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0D1B3E', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <User size={20} color="#C9973A" />
          Let's build your professional profile
        </h2>
        <p style={{ fontSize: '13px', color: '#64748B' }}>
          This information helps agencies find and contact you. All fields auto-save as you type.
        </p>
      </div>

      {isSaving && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#10B981', marginBottom: '16px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981', animation: 'pulse 1s infinite' }} />
          Saving...
        </div>
      )}
      {!isSaving && lastSaved && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#94A3B8', marginBottom: '16px' }}>
          <CheckCircle size={12} />
          Saved {lastSaved.toLocaleTimeString()}
        </div>
      )}

      <div style={{ marginBottom: '32px' }}>
        <label style={labelStyle}>Profile Photo</label>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
          <div style={{ width: '96px', height: '96px', borderRadius: '50%', border: '2px dashed #CBD5E1', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F8FAFC' }}>
            <Upload size={24} color="#94A3B8" />
          </div>
          <div style={{ flex: 1 }}>
            <button type="button" style={{ padding: '8px 16px', borderRadius: '12px', fontSize: '12px', fontWeight: 700, backgroundColor: 'white', border: '1px solid #E2E8F0', color: '#0D1B3E' }}>
              Upload Photo
            </button>
            <p style={{ fontSize: '11px', color: '#94A3B8', marginTop: '8px' }}>Square photo, at least 400x400px</p>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0D1B3E', marginBottom: '16px' }}>What should agencies call you?</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '16px' }}>
          <div>
            <label style={labelStyle}>First Name *</label>
            <input type="text" value={formData.firstName} onChange={(e) => updateField('firstName', e.target.value)} placeholder="Sarah" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Middle Name</label>
            <input type="text" value={formData.middleName} onChange={(e) => updateField('middleName', e.target.value)} placeholder="Marie" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Last Name *</label>
            <input type="text" value={formData.lastName} onChange={(e) => updateField('lastName', e.target.value)} placeholder="Johnson" style={inputStyle} />
          </div>
        </div>
        <div>
          <label style={labelStyle}>Preferred Name (optional)</label>
          <input type="text" value={formData.preferredName} onChange={(e) => updateField('preferredName', e.target.value)} placeholder="Sarah" style={inputStyle} />
        </div>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0D1B3E', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Mail size={16} color="#C9973A" />How can agencies reach you?
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
          <div>
            <label style={labelStyle}>Email Address *</label>
            <input type="email" value={formData.email} onChange={(e) => updateField('email', e.target.value)} placeholder="sarah@example.com" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Phone Number *</label>
            <input type="tel" value={formData.phone} onChange={(e) => updateField('phone', formatPhone(e.target.value))} placeholder="(555) 123-4567" style={inputStyle} />
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0D1B3E', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MapPin size={16} color="#C9973A" />Where are you located?
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          <div>
            <label style={labelStyle}>City *</label>
            <input type="text" value={formData.city} onChange={(e) => updateField('city', e.target.value)} placeholder="Frisco" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>State *</label>
            <input type="text" value={formData.state} onChange={(e) => updateField('state', e.target.value.toUpperCase())} placeholder="TX" maxLength={2} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>ZIP Code *</label>
            <input type="text" value={formData.postalCode} onChange={(e) => updateField('postalCode', e.target.value)} placeholder="75034" style={inputStyle} />
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <label style={labelStyle}>Gender *</label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
          {['Male', 'Female', 'Non-binary'].map((gender) => (
            <label key={gender} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', borderRadius: '12px', cursor: 'pointer', border: formData.gender === gender ? '2px solid #C9973A' : '2px solid #E2E8F0', backgroundColor: formData.gender === gender ? '#FDF6EC' : 'white' }}>
              <input type="radio" name="gender" value={gender} checked={formData.gender === gender} onChange={(e) => updateField('gender', e.target.value)} style={{ display: 'none' }} />
              <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: formData.gender === gender ? '2px solid #C9973A' : '2px solid #CBD5E1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {formData.gender === gender && <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#C9973A' }} />}
              </div>
              <span style={{ fontSize: '13px', fontWeight: 500 }}>{gender}</span>
            </label>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '32px' }}>
              <option value="">Select...</option>
              {PRONOUNS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <label style={labelStyle}>Languages Spoken</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {LANGUAGES.map((lang) => (
            <button key={lang} type="button" onClick={() => toggleLanguage(lang)} style={{ padding: '8px 16px', borderRadius: '999px', fontSize: '12px', fontWeight: 500, border: formData.languages.includes(lang) ? '2px solid #C9973A' : '2px solid #E2E8F0', backgroundColor: formData.languages.includes(lang) ? '#FDF6EC' : 'white', color: formData.languages.includes(lang) ? '#92400E' : '#64748B', cursor: 'pointer' }}>
              {lang}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}