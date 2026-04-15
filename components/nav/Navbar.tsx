'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { UserButton, useAuth } from '@clerk/nextjs';

function AuthButton() {
  const { isLoaded, userId } = useAuth();
  
  if (!isLoaded) {
    return null; // Or a loading spinner
  }
  
  if (userId) {
    return (
      <UserButton 
        appearance={{
          elements: {
            userButtonAvatarBox: { width: '32px', height: '32px' },
            userButtonTrigger: { padding: '4px' },
          },
        }}
      />
    );
  }
  
  return (
    <>
      <Link href="/sign-in" style={{ 
        fontSize: '12px', 
        fontWeight: 500, 
        padding: '8px 16px',
        borderRadius: '8px',
        border: '1px solid rgba(255,255,255,0.1)',
        color: 'rgba(255,255,255,0.7)',
        textDecoration: 'none',
        transition: 'all 0.2s'
      }}>
        Sign in
      </Link>
      <Link href="/sign-up" style={{ 
        fontSize: '12px', 
        fontWeight: 700, 
        padding: '8px 16px',
        borderRadius: '8px',
        background: 'linear-gradient(135deg, #C9973A, #E8B86D)',
        color: '#0D1B3E',
        textDecoration: 'none',
        transition: 'all 0.2s'
      }}>
        Get started free
      </Link>
    </>
  );
}

export default function Navbar() {
 const [mobileOpen, setMobileOpen] = useState(false);

 return (
 <nav style={{ 
   position: 'fixed', 
   top: 0, 
   left: 0, 
   right: 0, 
   zIndex: 50, 
   backgroundColor: '#0D1B3E',
   borderBottom: '1px solid rgba(255,255,255,0.2)'
 }}>
 <div style={{ 
   maxWidth: '1280px', 
   margin: '0 auto', 
   padding: '16px 24px',
   display: 'flex',
   alignItems: 'center',
   justifyContent: 'space-between'
 }}>
 {/* Logo */}
 <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
   <div style={{ 
     width: '32px', 
     height: '32px', 
     borderRadius: '12px', 
     background: 'linear-gradient(135deg, #C9973A, #E8B86D)',
     display: 'flex', 
     alignItems: 'center', 
     justifyContent: 'center'
   }}>
     <span style={{ fontSize: '14px', fontWeight: 800, color: '#0D1B3E' }}>C</span>
   </div>
   <span style={{ fontSize: '14px', fontWeight: 800, color: 'white', letterSpacing: '-0.02em' }}>
     Careified
   </span>
 </Link>

 {/* Desktop Nav - Always visible */}
 <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
 <Link href="/for-agencies" style={{ 
   fontSize: '13px', 
   fontWeight: 500, 
   color: 'rgba(255,255,255,0.55)', 
   padding: '8px 12px',
   borderRadius: '8px',
   textDecoration: 'none',
   transition: 'all 0.2s'
 }}>
   For Agencies
 </Link>
 <Link href="/for-caregivers" style={{ 
   fontSize: '13px', 
   fontWeight: 500, 
   color: 'rgba(255,255,255,0.55)', 
   padding: '8px 12px',
   borderRadius: '8px',
   textDecoration: 'none',
   transition: 'all 0.2s'
 }}>
   For Caregivers
 </Link>
 <Link href="/for-families" style={{ 
   fontSize: '13px', 
   fontWeight: 500, 
   color: 'rgba(255,255,255,0.55)', 
   padding: '8px 12px',
   borderRadius: '8px',
   textDecoration: 'none',
   transition: 'all 0.2s'
 }}>
   For Families
 </Link>
 <Link href="/about" style={{ 
   fontSize: '13px', 
   fontWeight: 500, 
   color: 'rgba(255,255,255,0.55)', 
   padding: '8px 12px',
   borderRadius: '8px',
   textDecoration: 'none',
   transition: 'all 0.2s'
 }}>
   About
 </Link>
 <Link href="/contact" style={{ 
   fontSize: '13px', 
   fontWeight: 500, 
   color: 'rgba(255,255,255,0.55)', 
   padding: '8px 12px',
   borderRadius: '8px',
   textDecoration: 'none',
   transition: 'all 0.2s'
 }}>
   Contact
 </Link>
 </div>

 {/* Sign In / Sign Up Buttons */}
 <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
   <AuthButton />
 </div>
 </div>
 </nav>
 );
}