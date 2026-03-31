import React, { useState, useMemo } from 'react'
import { Edit2, Check, X, Plus, Trash2, ChevronDown, ChevronRight } from 'lucide-react'

const CATEGORIES = [
  'Piping', 'Fittings', 'Valves', 'HVAC Equipment',
  'Ductwork', 'Insulation', 'Hangers & Supports', 'Sheet Metal', 'Other'
]

const UNITS = ['LF', 'EA', 'SF', 'LB', 'TON', 'GAL', 'HR']

const CATEGORY_COLORS = {
  'Piping': '#f97316',
  'Fittings': '#60a5fa',
  'Valves': '#a78bfa',
  'HVAC Equipment': '#34d399',
  'Ductwork': '#fbbf24',
  'Insulation': '#f472b6',
  'Hangers & Supports': '#94a3b8',
  'Sheet Metal': '#38bdf8',
  'Other': '#6b7280'
}

function EditableCell({ value, onSave, type = 'text', options }) {
  const [editing, setEditing] = useState(false)
  const [val, setVal] = useState(value)

  const handleSave = () => {
    onSave(type === 'number' ? Number(val) : val)
    setEditing(false)
  }

  if (!editing) {
    return (
      <div
        onClick={() => setEditing(true)}
        style={{
          cursor: 'pointer', padding: '2px 4px', borderRadius: '3px',
          minHeight: '24px', transition: 'background 0.1s'
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        {value || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>—</span>}
      </div>
    )
  }

  if (options) {
    return (
      <select
        value={val}
        onChange={e => setVal(e.target.value)}
        onBlur={handleSave}
        autoFocus
        style={{
          background: 'var(--bg-primary)', border: '1px solid var(--accent)',
          borderRadius: '4px', color: 'var(--text-primary)', fontSize: '13px',
          padding: '2px 6px', width: '100%'
        }}
      >
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    )
  }

  return (
    <div style={{ display: 'flex', gap: '4px' }}>
      <input
        type={type}
        value={val}
        onChange={e => setVal(e.target.value)}
        onBlur={handleSave}
        onKeyDown={e => {
          if (e.key === 'Enter') handleSave()
          if (e.key === 'Escape') { setVal(value); setEditing(false) }
        }}
        autoFocus
        style={{
          background: 'var(--bg-primary)', border: '1px solid var(--accent)',
          borderRadius: '4px', color: 'var(--text-primary)', fontSize: '13px',
          padding: '2px 6px', width: '100%',
          fontFamily: type === 'number' ? 'var(--font-mono)' : 'inherit'
        }}
      />
    </div>
  )
}

export default function TakeoffTable({ items, onUpdate, onDelete, onAdd }) {
  const [collapsed, setCollapsed] = useState({})
  const [activeCategory, setActiveCategory] = useState('All')

  const grouped = useMemo(() => {
    const g = {}
    items.forEach(item => {
      const cat = item.category || 'Other'
      if (!g[cat]) g[cat] = []
      g[cat].push(item)
    })
    return g
  }, [items])

  const categories = ['All', ...CATEGORIES.filter(c => grouped[c])]
  const totalQty = items.reduce((s, i) => s + (Number(i.quantity) || 0), 0)

  const filteredGrouped = activeCategory === 'All'
    ? grouped
    : { [activeCategory]: grouped[activeCategory] || [] }

  const updateItem = (id, field, value) => {
    const updated = items.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    )
    onUpdate(updated)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Stats Bar */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: '10px'
      }}>
        {[
          { label: 'TOTAL ITEMS', value: items.length, color: 'var(--accent)' },
          { label: 'CATEGORIES', value: Object.keys(grouped).length, color: 'var(--blue)' },
          { label: 'TOTAL QTY', value: totalQty.toLocaleString(), color: 'var(--green)' },
          { label: 'PIPING LF', value: (grouped['Piping'] || []).reduce((s, i) => s + (Number(i.quantity)||0), 0).toFixed(0) + ' LF', color: 'var(--pipe-orange)' }
        ].map(stat => (
          <div key={stat.label} style={{
            padding: '12px 16px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '8px'
          }}>
            <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginBottom: '4px' }}>
              {stat.label}
            </div>
            <div style={{ fontSize: '20px', fontFamily: 'var(--font-display)', letterSpacing: '1px', color: stat.color }}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* Category Filter */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            style={{
              padding: '4px 12px',
              fontSize: '12px',
              fontFamily: 'var(--font-mono)',
              borderRadius: '20px',
              border: '1px solid',
              borderColor: activeCategory === cat ? (CATEGORY_COLORS[cat] || 'var(--accent)') : 'var(--border)',
              background: activeCategory === cat ? (CATEGORY_COLORS[cat] ? `${CATEGORY_COLORS[cat]}22` : 'var(--accent-glow)') : 'transparent',
              color: activeCategory === cat ? (CATEGORY_COLORS[cat] || 'var(--accent)') : 'var(--text-secondary)',
              cursor: 'pointer',
              transition: 'all 0.15s'
            }}
          >
            {cat} {cat !== 'All' && grouped[cat] ? `(${grouped[cat].length})` : ''}
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '10px',
        overflow: 'hidden'
      }}>
        {/* Table Header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '32px 1fr 110px 110px 70px 90px 90px',
          gap: '0',
          padding: '10px 12px',
          background: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border)',
          fontSize: '11px',
          fontFamily: 'var(--font-mono)',
          color: 'var(--text-muted)',
          letterSpacing: '0.5px'
        }}>
          <div></div>
          <div>DESCRIPTION</div>
          <div>SIZE</div>
          <div>MATERIAL</div>
          <div>UNIT</div>
          <div style={{ textAlign: 'right' }}>QTY</div>
          <div style={{ textAlign: 'center' }}>ACTIONS</div>
        </div>

        {/* Grouped Rows */}
        {CATEGORIES.filter(c => filteredGrouped[c]?.length).map(cat => (
          <div key={cat}>
            {/* Category Header */}
            <div
              onClick={() => setCollapsed(p => ({ ...p, [cat]: !p[cat] }))}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '8px 12px',
                background: 'rgba(255,255,255,0.02)',
                borderBottom: '1px solid var(--border)',
                cursor: 'pointer',
                userSelect: 'none'
              }}
            >
              {collapsed[cat] ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
              <div style={{
                width: '8px', height: '8px', borderRadius: '50%',
                background: CATEGORY_COLORS[cat] || '#666'
              }} />
              <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', fontWeight: 500, color: CATEGORY_COLORS[cat] || 'var(--text-secondary)' }}>
                {cat.toUpperCase()}
              </span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                ({filteredGrouped[cat].length} items)
              </span>
            </div>

            {/* Items */}
            {!collapsed[cat] && filteredGrouped[cat].map((item, idx) => (
              <div
                key={item.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '32px 1fr 110px 110px 70px 90px 90px',
                  alignItems: 'center',
                  padding: '6px 12px',
                  borderBottom: '1px solid var(--border)',
                  fontSize: '13px',
                  background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
                  transition: 'background 0.1s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)'}
              >
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  {idx + 1}
                </div>
                <EditableCell value={item.description} onSave={v => updateItem(item.id, 'description', v)} />
                <EditableCell value={item.size} onSave={v => updateItem(item.id, 'size', v)} />
                <EditableCell value={item.material} onSave={v => updateItem(item.id, 'material', v)} />
                <EditableCell value={item.unit} onSave={v => updateItem(item.id, 'unit', v)} options={UNITS} />
                <div style={{ textAlign: 'right' }}>
                  <EditableCell value={item.quantity} onSave={v => updateItem(item.id, 'quantity', v)} type="number" />
                </div>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <button
                    onClick={() => onDelete(item.id)}
                    style={{
                      background: 'transparent', color: 'var(--text-muted)',
                      padding: '3px', borderRadius: '4px'
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                    title="Delete item"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ))}

        {/* Add Item */}
        <div
          onClick={onAdd}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '10px 12px',
            cursor: 'pointer',
            color: 'var(--text-muted)',
            fontSize: '13px',
            transition: 'all 0.15s'
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--accent)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)' }}
        >
          <Plus size={14} /> Add line item manually
        </div>
      </div>
    </div>
  )
}
