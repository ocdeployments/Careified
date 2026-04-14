import Link from 'next/link';
import { CheckCircle, Mail, Shield } from 'lucide-react';

export default function PendingApprovalPage() {
 return (
  <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
   <div className="max-w-md w-full bg-white rounded-2xl border border-slate-100 p-8 text-center">
 
    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
     <CheckCircle className="w-8 h-8 text-green-600" />
    </div>
 
    <h1 className="text-2xl font-bold text-slate-900 mb-2">
     Account Created Successfully!
    </h1>
 
    <p className="text-slate-600 mb-6">
     Your agency profile is pending approval.
    </p>
 
    <div className="bg-slate-50 rounded-xl p-6 text-left mb-6">
     <p className="font-bold text-sm text-slate-900 mb-3">
      What happens next:
     </p>
 
     <div className="space-y-3">
      <div className="flex items-start gap-3">
       <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
       <div>
        <p className="text-sm font-medium text-slate-900">1. Review process</p>
        <p className="text-xs text-slate-600">Our team reviews your information (usually within 24 hours)</p>
       </div>
      </div>
 
      <div className="flex items-start gap-3">
       <Mail className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
       <div>
        <p className="text-sm font-medium text-slate-900">2. Email notification</p>
        <p className="text-xs text-slate-600">You'll receive an email when approved</p>
       </div>
      </div>
 
      <div className="flex items-start gap-3">
       <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
       <div>
        <p className="text-sm font-medium text-slate-900">3. Start searching</p>
        <p className="text-xs text-slate-600">Once approved, you can search verified caregivers</p>
       </div>
      </div>
     </div>
    </div>
 
    <div className="space-y-3 text-sm text-slate-600">
     <p>In the meantime:</p>
     <ul className="list-disc list-inside space-y-1 text-left">
      <li>Check your email for confirmation</li>
      <li>Add support@careified.com to your safe senders</li>
     </ul>
    </div>
 
    <div className="mt-8 pt-6 border-t border-slate-100">
     <Link
      href="/"
      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
     >
      ← Return to homepage
     </Link>
    </div>
 
    <p className="text-xs text-slate-500 mt-6">
     Questions? Contact us at support@careified.com
    </p>
   </div>
  </div>
 );
}
