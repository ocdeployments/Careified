'use client'

import { motion } from 'framer-motion'

export default function LoadingSkeleton() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '120px 0' }}>
      {[1, 2, 3].map((i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0.4 }}
          animate={{ opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
          style={{
            height: '180px',
            background: '#F8FAFC',
            borderRadius: '16px',
            marginBottom: '24px',
            border: '1px solid #E2E8F0'
          }}
        />
      ))}
    </div>
  )
}