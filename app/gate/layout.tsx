export default function GateLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: '#0D1B3E' }}>
      {children}
    </div>
  )
}