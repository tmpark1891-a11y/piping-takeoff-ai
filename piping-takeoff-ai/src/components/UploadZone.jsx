import React, { useRef, useState } from 'react'
import { Upload, FileText, X, AlertCircle } from 'lucide-react'

export default function UploadZone({ files, onFilesAdded, onRemoveFile, isProcessing }) {
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState('')

  const validate = (fileList) => {
    const pdfs = Array.from(fileList).filter(f => f.type === 'application/pdf')
    const invalid = fileList.length - pdfs.length
    if (invalid > 0) setError(`${invalid} file(s) skipped — only PDF files accepted.`)
    else setError('')
    return pdfs
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    const pdfs = validate(e.dataTransfer.files)
    if (pdfs.length) onFilesAdded(pdfs)
  }

  const handleChange = (e) => {
    const pdfs = validate(e.target.files)
    if (pdfs.length) onFilesAdded(pdfs)
    e.target.value = ''
  }

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / 1048576).toFixed(1)} MB`
  }

  return (
    <div>
      {/* Drop Zone */}
      <div
        onClick={() => !isProcessing && inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        style={{
          border: `2px dashed ${dragging ? 'var(--accent)' : 'var(--border)'}`,
          borderRadius: '10px',
          padding: '40px 24px',
          textAlign: 'center',
          cursor: isProcessing ? 'not-allowed' : 'pointer',
          background: dragging ? 'var(--accent-glow)' : 'var(--bg-secondary)',
          transition: 'all 0.2s',
          opacity: isProcessing ? 0.6 : 1
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf"
          multiple
          onChange={handleChange}
          style={{ display: 'none' }}
        />
        <Upload
          size={32}
          color={dragging ? 'var(--accent)' : 'var(--text-muted)'}
          style={{ marginBottom: '12px' }}
        />
        <div style={{ fontSize: '15px', fontWeight: 500, marginBottom: '6px' }}>
          {dragging ? 'Drop PDFs here' : 'Drop PDF drawings here'}
        </div>
        <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          or click to browse — mechanical plans, specs, schedules
        </div>
        <div style={{
          marginTop: '12px',
          display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap'
        }}>
          {['Piping Plans', 'HVAC Schedules', 'Mech Specs', 'Equipment Lists'].map(tag => (
            <span key={tag} style={{
              padding: '2px 8px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: '4px',
              fontSize: '11px',
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-mono)'
            }}>{tag}</span>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          marginTop: '8px', padding: '8px 12px',
          background: 'rgba(248,113,113,0.1)',
          border: '1px solid rgba(248,113,113,0.3)',
          borderRadius: '6px', fontSize: '12px', color: 'var(--red)',
          display: 'flex', alignItems: 'center', gap: '6px'
        }}>
          <AlertCircle size={14} /> {error}
        </div>
      )}

      {/* File List */}
      {files.length > 0 && (
        <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {files.map((file, idx) => (
            <div key={idx} style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '8px 12px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: '8px'
            }}>
              <FileText size={16} color="var(--accent)" style={{ flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: '13px', fontWeight: 500,
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                }}>
                  {file.name}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  {formatSize(file.size)}
                </div>
              </div>
              {!isProcessing && (
                <button
                  onClick={(e) => { e.stopPropagation(); onRemoveFile(idx) }}
                  style={{
                    background: 'transparent', color: 'var(--text-muted)',
                    padding: '2px', borderRadius: '4px', flexShrink: 0
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--red)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                >
                  <X size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
