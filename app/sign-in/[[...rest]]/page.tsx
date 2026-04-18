import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#F7F4F0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
    }}>
      <SignIn
        signUpUrl="/sign-up"
        fallbackRedirectUrl="/api/auth/role-redirect"
        appearance={{
          variables: {
            colorPrimary: '#C9973A',
            colorBackground: '#FFFFFF',
            colorText: '#0D1B3E',
            borderRadius: '12px',
          },
          elements: {
            formButtonPrimary: {
              background: 'linear-gradient(135deg, #C9973A, #E8B86D)',
              color: '#0D1B3E',
              fontWeight: 700,
            },
          },
        }}
      />
    </div>
  )
}