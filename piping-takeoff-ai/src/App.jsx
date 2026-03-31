import React, { useState, useCallback } from 'react'
import Header from './components/Header.jsx'
import SettingsModal from './components/SettingsModal.jsx'
import UploadZone from './components/UploadZone.jsx'
import TakeoffTable from './components/TakeoffTable.jsx'
import { extractTextFromPDF } from './utils/pdfExtractor.js'
import { analyzeTakeoff } from './utils/aiAnalyzer.js'
import { exportToExcel } from './utils/excelExporter.js'
import {
  Zap, Download, RotateCcw, ChevronRight,
  FileText, MessageSquare, CheckCircle, AlertTriangle
} from 'lucide-react'

// ─── Helpers ────────────────────────────────────────────────────────────────
function genId() {
  return Math.random().toString(36).substring(2, 9)
}

function Toast({ message, type }) {
  if (!message) return null
  return (
    <div style={{
      position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999,
      padding: '12px 18px',
      background: type === 'error' ? 'rgba(248,113,113,0.15)' : 'rgba(52,211,153,0.15)',
      border: `1px solid ${type === 'error' ? 'rgba(248,113,113,0.4)' : 'rgba(52,211,153,0.4)'}`,
      borderRadius: '8px',
      color: type === 'error' ? 'var(--red)' : 'var(--green)',
      fontSize: '13px',
      display: 'flex', alignItems: 'center', gap: '8px',
      maxWidth: '380px',
      backdropFilter: 'blur(8px)',
      animation: 'slideUp 0.2s ease'
    }}>
      {type === 'error' ? <AlertTriangle size={15} /> : <CheckCircle size={15} />}
      {message}
    </div>
  )
}

// ─── Main App ───────────────────────────────────────────────────────────────
export default function App() {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('pipeai_key') || '')
  const [showSettings, setShowSettings] = useState(false)

  const [files, setFiles] = useState([])
  const [extractedTexts, setExtractedTexts] = useState([])
  const [projectName, setProjectName] = useState('')

  const [lineItems, setLineItems] = useState([])
  const [summary, setSummary] = useState('')
  const [projectType, setProjectType] = useState('')
  const [confidence, setConfidence] = useState('')
  const [aiNotes, setAiNotes] = useState('')

  const [status, setStatus] = useState('idle') // idle | extracting | analyzing | done | error
  const [statusMessage, setStatusMessage] = useState('')
  const [progress, setProgress] = useState(0)
  const [toast, setToast] = useState(null)
  const [refineFeedback, setRefineFeedback] = useState('')

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }

  // Save API key
  const handleSaveSettings = (key) => {
    setApiKey(key)
    localStorage.setItem('pipeai_key', key)
    showToast('Settings saved')
  }

  // Add files
  const handleFilesAdded = (newFiles) => {
    setFiles(prev => [...prev, ...newFiles])
  }

  // Remove file
  const handleRemoveFile = (idx) => {
    setFiles(prev => prev.filter((_, i) => i !== idx))
  }

  // ── Run Analysis ─────────────────────────────────────────────────────────
  const handleAnalyze = async () => {
    if (!files.length) return showToast('Please upload at least one PDF', 'error')
    if (!apiKey) {
      setShowSettings(true)
      return showToast('API key required — add it in Settings', 'error')
    }

    setStatus('extracting')
    setProgress(10)
    setStatusMessage('Reading PDF files...')
    const texts = []

    try {
      for (let i = 0; i < files.length; i++) {
        setStatusMessage(`Extracting text from ${files[i].name}...`)
        setProgress(10 + (i / files.length) * 30)
        const result = await extractTextFromPDF(files[i])
        texts.push(result)
      }

      setExtractedTexts(texts)
      setStatus('analyzing')
      setProgress(50)

      const combinedText = texts.map(t => `=== FILE: ${t.fileName} ===\n${t.text}`).join('\n\n')
      setStatusMessage('AI is generating your takeoff...')

      for (let i = 50; i < 90; i += 3) {
        await new Promise(r => setTimeout(r, 300))
        setProgress(i)
      }

      const result = await analyzeTakeoff(combinedText, apiKey, files.map(f => f.name).join(', '))

      const items = (result.lineItems || []).map(item => ({
        ...item,
        id: item.id || genId()
      }))

      setLineItems(items)
      setSummary(result.summary || '')
      setProjectType(result.projectType || '')
      setConfidence(result.confidence || '')
      setAiNotes(result.notes || '')
      setProgress(100)
      setStatus('done')
      showToast(`Generated ${items.length} line items successfully`)
    } catch (err) {
      setStatus('error')
      setStatusMessage(err.message)
      showToast(err.message, 'error')
    }
  }

  // ── Add manual line item ──────────────────────────────────────────────────
  const handleAddItem = () => {
    const newItem = {
      id: genId(),
      category: 'Piping',
      description: 'New Item',
      size: '',
      material: '',
      unit: 'EA',
      quantity: 1,
      notes: ''
    }
    setLineItems(prev => [...prev, newItem])
  }

  // ── Delete item ───────────────────────────────────────────────────────────
  const handleDeleteItem = (id) => {
    setLineItems(prev => prev.filter(i => i.id !== id))
  }

  // ── Export ────────────────────────────────────────────────────────────────
  const handleExport = () => {
    if (!lineItems.length) return showToast('No items to export', 'error')
    try {
      const name = projectName || 'Mechanical_Takeoff'
      const fileName = exportToExcel(lineItems, name, summary)
      showToast(`Exported: ${fileName}`)
    } catch (err) {
      showToast(`Export failed: ${err.message}`, 'error')
    }
  }

  // ── Reset ─────────────────────────────────────────────────────────────────
  const handleReset = () => {
    setFiles([])
    setExtractedTexts([])
    setLineItems([])
    setSummary('')
    setProjectType('')
    setConfidence('')
    setAiNotes('')
    setStatus('idle')
    setStatusMessage('')
    setProgress(0)
    setProjectName('')
  }

  const isProcessing = status === 'extracting' || status === 'analyzing'

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <style>{`
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
      `}</style>

      <Header onOpenSettings={() => setShowSettings(true)} apiKey={apiKey} />

      <main style={{ flex: 1, padding: '24px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>

        {/* ── Top Row: Project Name + Actions ── */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <input
              type="text"
              placeholder="Project name (e.g. 500 Main St - Mechanical)"
              value={projectName}
              onChange={e => setProjectName(e.target.value)}
              style={{
                width: '100%', padding: '10px 16px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                color: 'var(--text-primary)',
                fontSize: '14px'
              }}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>

          {status === 'done' && (
            <>
              <button
                onClick={handleExport}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '10px 20px',
                  background: 'var(--green)',
                  border: 'none', borderRadius: '8px',
                  color: '#000', fontWeight: 600, fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                <Download size={16} /> Export Excel
              </button>
              <button
                onClick={handleReset}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '10px 16px',
                  background: 'transparent',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  color: 'var(--text-secondary)', fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                <RotateCcw size={14} /> New Takeoff
              </button>
            </>
          )}
        </div>

        {/* ── Two Column Layout ── */}
        <div style={{ display: 'grid', gridTemplateColumns: status === 'done' ? '320px 1fr' : '1fr', gap: '20px' }}>

          {/* ── Left Panel: Upload & Controls ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Upload Zone */}
            <div style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '20px'
            }}>
              <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', letterSpacing: '1px', marginBottom: '12px' }}>
                01 — UPLOAD DRAWINGS
              </div>
              <UploadZone
                files={files}
                onFilesAdded={handleFilesAdded}
                onRemoveFile={handleRemoveFile}
                isProcessing={isProcessing}
              />
            </div>

            {/* Analyze Button */}
            {status !== 'done' && (
              <button
                onClick={handleAnalyze}
                disabled={isProcessing || !files.length}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                  padding: '14px',
                  background: isProcessing || !files.length ? 'var(--bg-card)' : 'var(--accent)',
                  border: `1px solid ${isProcessing || !files.length ? 'var(--border)' : 'transparent'}`,
                  borderRadius: '10px',
                  color: isProcessing || !files.length ? 'var(--text-muted)' : '#000',
                  fontSize: '15px',
                  fontWeight: 600,
                  cursor: isProcessing || !files.length ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {isProcessing ? (
                  <>
                    <div style={{
                      width: '16px', height: '16px', border: '2px solid currentColor',
                      borderTopColor: 'transparent', borderRadius: '50%',
                      animation: 'spin 0.8s linear infinite'
                    }} />
                    {statusMessage}
                  </>
                ) : (
                  <>
                    <Zap size={17} />
                    Generate AI Takeoff
                  </>
                )}
              </button>
            )}

            {/* Progress Bar */}
            {isProcessing && (
              <div style={{
                background: 'var(--bg-secondary)',
                borderRadius: '4px',
                height: '4px',
                overflow: 'hidden'
              }}>
                <div style={{
                  height: '100%',
                  width: `${progress}%`,
                  background: 'var(--accent)',
                  transition: 'width 0.3s',
                  borderRadius: '4px'
                }} />
              </div>
            )}

            {/* Error Message */}
            {status === 'error' && (
              <div style={{
                padding: '12px', background: 'rgba(248,113,113,0.1)',
                border: '1px solid rgba(248,113,113,0.3)',
                borderRadius: '8px', fontSize: '13px', color: 'var(--red)'
              }}>
                ⚠️ {statusMessage}
              </div>
            )}

            {/* AI Summary (when done) */}
            {status === 'done' && summary && (
              <div style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '16px'
              }}>
                <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', letterSpacing: '1px', marginBottom: '10px' }}>
                  02 — AI ANALYSIS
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '10px', lineHeight: 1.6 }}>
                  {summary}
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {projectType && (
                    <span style={{
                      padding: '2px 8px', borderRadius: '4px',
                      background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.3)',
                      fontSize: '11px', color: 'var(--blue)', fontFamily: 'var(--font-mono)'
                    }}>{projectType}</span>
                  )}
                  {confidence && (
                    <span style={{
                      padding: '2px 8px', borderRadius: '4px',
                      background: confidence === 'High' ? 'var(--green-dim)' : 'rgba(251,191,36,0.1)',
                      border: `1px solid ${confidence === 'High' ? 'rgba(52,211,153,0.3)' : 'rgba(251,191,36,0.3)'}`,
                      fontSize: '11px',
                      color: confidence === 'High' ? 'var(--green)' : '#fbbf24',
                      fontFamily: 'var(--font-mono)'
                    }}>{confidence} Confidence</span>
                  )}
                </div>
                {aiNotes && (
                  <div style={{ marginTop: '10px', fontSize: '12px', color: 'var(--text-muted)', borderTop: '1px solid var(--border)', paddingTop: '10px' }}>
                    📌 {aiNotes}
                  </div>
                )}
              </div>
            )}

            {/* Refine Feedback */}
            {status === 'done' && (
              <div style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '16px'
              }}>
                <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', letterSpacing: '1px', marginBottom: '10px' }}>
                  03 — REFINE
                </div>
                <textarea
                  placeholder='e.g. "Add 4" CS pipe run in mechanical room" or "Change all fittings to stainless"'
                  value={refineFeedback}
                  onChange={e => setRefineFeedback(e.target.value)}
                  rows={3}
                  style={{
                    width: '100%', padding: '10px',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    color: 'var(--text-primary)',
                    fontSize: '12px',
                    resize: 'vertical',
                    marginBottom: '8px'
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
                <button
                  disabled={!refineFeedback.trim()}
                  style={{
                    width: '100%', padding: '8px',
                    background: refineFeedback.trim() ? 'var(--bg-hover)' : 'transparent',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    color: refineFeedback.trim() ? 'var(--text-primary)' : 'var(--text-muted)',
                    fontSize: '13px',
                    cursor: refineFeedback.trim() ? 'pointer' : 'not-allowed',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                  }}
                >
                  <MessageSquare size={13} /> Apply Feedback
                </button>
              </div>
            )}
          </div>

          {/* ── Right Panel: Takeoff Table ── */}
          {status === 'done' && (
            <div>
              <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', letterSpacing: '1px', marginBottom: '12px' }}>
                04 — MATERIAL TAKEOFF — Click any cell to edit
              </div>
              <TakeoffTable
                items={lineItems}
                onUpdate={setLineItems}
                onDelete={handleDeleteItem}
                onAdd={handleAddItem}
              />
            </div>
          )}

          {/* Empty State */}
          {status === 'idle' && !files.length && (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              padding: '60px 24px', textAlign: 'center', color: 'var(--text-muted)'
            }}>
              <div style={{
                width: '64px', height: '64px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: '16px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '16px'
              }}>
                <FileText size={28} color="var(--accent)" />
              </div>
              <div style={{ fontSize: '16px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                Upload drawings to begin
              </div>
              <div style={{ fontSize: '13px', maxWidth: '320px', lineHeight: 1.6 }}>
                Import mechanical PDF drawings and AI will extract piping LF, HVAC equipment, fittings, valves, and more.
              </div>
              <div style={{ marginTop: '24px', display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
                {['Piping LF', 'Fittings & Valves', 'HVAC Equipment', 'Ductwork', 'Insulation'].map(t => (
                  <span key={t} style={{
                    padding: '4px 12px',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontFamily: 'var(--font-mono)'
                  }}>
                    <ChevronRight size={10} style={{ marginRight: '4px' }} />{t}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Settings Modal */}
      {showSettings && (
        <SettingsModal
          apiKey={apiKey}
          onSave={handleSaveSettings}
          onClose={() => setShowSettings(false)}
        />
      )}

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  )
}
