import React, { useState } from 'react'
import { X, Key, Eye, EyeOff, ExternalLink } from 'lucide-react'

export default function SettingsModal({ apiKey, onSave, onClose }) {
  const [key, setKey] = useState(apiKey || '')
  const [showKey, setShowKey] = useState(false)

  const handleSave = () => {
    onSave(key.trim())
    onClose()
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 999,
      background: 'rgba(0,0,0,0.75)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      backdropFilter: 'blur(4px)'
    }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        width: '480px',
        maxWidth: '90vw',
        padding: '28px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', letterSpacing: '1px' }}>
            SETTINGS
          </h2>
          <button onClick={onClose} style={{
            background: 'transparent',
            color: 'var(--text-secondary)',
            padding: '4px',
            borderRadius: '4px'
          }}>
            <X size={18} />
          </button>
        </div>

        {/* API Key Section */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            fontSize: '12px', fontFamily: 'var(--font-mono)',
            color: 'var(--accent)', letterSpacing: '1px', marginBottom: '8px'
          }}>
            <Key size={12} />
            ANTHROPIC API KEY
          </label>

          <div style={{ position: 'relative' }}>
            <input
              type={showKey ? 'text' : 'password'}
              value={key}
              onChange={e => setKey(e.target.value)}
              placeholder="sk-ant-api03-..."
              style={{
                width: '100%',
                padding: '10px 40px 10px 14px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                color: 'var(--text-primary)',
                fontSize: '13px',
                fontFamily: 'var(--font-mono)'
              }}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
            <button
              onClick={() => setShowKey(!showKey)}
              style={{
                position: 'absolute', right: '10px', top: '50%',
                transform: 'translateY(-50%)',
                background: 'transparent', color: 'var(--text-muted)'
              }}
            >
              {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <div style={{
            marginTop: '8px', fontSize: '12px', color: 'var(--text-muted)',
            display: 'flex', alignItems: 'center', gap: '4px'
          }}>
            <span>Get your key at</span>
            <a
              href="https://console.anthropic.com/api-keys"
              target="_blank" rel="noreferrer"
              style={{ color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '2px' }}
            >
              console.anthropic.com <ExternalLink size={10} />
            </a>
          </div>
          <div style={{ marginTop: '6px', fontSize: '11px', color: 'var(--text-muted)' }}>
            🔒 Stored locally in your browser only. Never sent to any server except Anthropic.
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 18px',
              background: 'transparent',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              color: 'var(--text-secondary)',
              fontSize: '13px'
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            style={{
              padding: '8px 24px',
              background: 'var(--accent)',
              border: 'none',
              borderRadius: '6px',
              color: '#000',
              fontSize: '13px',
              fontWeight: 600
            }}
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  )
}
