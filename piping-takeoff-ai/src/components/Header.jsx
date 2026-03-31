import React from 'react'
import { Settings, Cpu } from 'lucide-react'

export default function Header({ onOpenSettings, apiKey }) {
  return (
    <header style={{
      background: 'var(--bg-secondary)',
      borderBottom: '1px solid var(--border)',
      padding: '0 24px',
      height: '56px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      backdropFilter: 'blur(10px)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Logo */}
        <div style={{
          width: '32px',
          height: '32px',
          background: 'var(--accent)',
          borderRadius: '6px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <rect x="2" y="10" width="20" height="4" rx="2" fill="#0a0c0f"/>
            <circle cx="6" cy="12" r="2" fill="#0a0c0f"/>
            <circle cx="18" cy="12" r="2" fill="#0a0c0f"/>
            <path d="M6 6 V10 M18 6 V10 M6 14 V18 M18 14 V18" stroke="#0a0c0f" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
        </div>

        <div>
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: '22px',
            letterSpacing: '2px',
            color: 'var(--text-primary)',
            lineHeight: 1
          }}>
            PIPEAI
          </div>
          <div style={{
            fontSize: '10px',
            color: 'var(--text-muted)',
            fontFamily: 'var(--font-mono)',
            letterSpacing: '1px'
          }}>
            MECHANICAL TAKEOFF
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* AI Status */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 10px',
          background: apiKey ? 'var(--green-dim)' : 'rgba(248,113,113,0.1)',
          border: `1px solid ${apiKey ? 'rgba(52,211,153,0.3)' : 'rgba(248,113,113,0.3)'}`,
          borderRadius: '20px',
          fontSize: '11px',
          fontFamily: 'var(--font-mono)',
          color: apiKey ? 'var(--green)' : 'var(--red)'
        }}>
          <Cpu size={11} />
          {apiKey ? 'AI READY' : 'API KEY NEEDED'}
        </div>

        <button
          onClick={onOpenSettings}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 14px',
            background: 'transparent',
            border: '1px solid var(--border)',
            borderRadius: '6px',
            color: 'var(--text-secondary)',
            fontSize: '13px',
            transition: 'all 0.15s'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'var(--border-bright)'
            e.currentTarget.style.color = 'var(--text-primary)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'var(--border)'
            e.currentTarget.style.color = 'var(--text-secondary)'
          }}
        >
          <Settings size={14} />
          Settings
        </button>
      </div>
    </header>
  )
}
