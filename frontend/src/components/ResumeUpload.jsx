import { useRef, useState } from 'react'

const ALLOWED = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
const MAX_MB  = 10

export default function ResumeUpload({ file, onChange }) {
  const inputRef  = useRef(null)
  const [drag, setDrag]   = useState(false)
  const [error, setError] = useState('')

  const validate = (f) => {
    if (!ALLOWED.includes(f.type)) {
      setError('Only PDF, DOC, and DOCX files are accepted')
      return false
    }
    if (f.size > MAX_MB * 1024 * 1024) {
      setError(`File must be under ${MAX_MB}MB`)
      return false
    }
    setError('')
    return true
  }

  const handleFile = (f) => {
    if (f && validate(f)) onChange(f)
  }

  const onDrop = (e) => {
    e.preventDefault(); setDrag(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }

  const fmt = (bytes) => bytes < 1024 * 1024
    ? `${(bytes / 1024).toFixed(0)} KB`
    : `${(bytes / (1024 * 1024)).toFixed(1)} MB`

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.doc,.docx"
        style={{ display: 'none' }}
        onChange={e => handleFile(e.target.files[0])}
      />

      {file ? (
        <div className="upload-file-info">
          <span style={{ fontSize: '1.4rem' }}>
            {file.type === 'application/pdf' ? '📄' : '📝'}
          </span>
          <div style={{ flex: 1 }}>
            <div className="upload-file-name">{file.name}</div>
            <div className="upload-file-size">{fmt(file.size)}</div>
          </div>
          <button
            type="button"
            className="btn-icon danger"
            onClick={() => { onChange(null); if (inputRef.current) inputRef.current.value = '' }}
            title="Remove file"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      ) : (
        <div
          className={`upload-zone${drag ? ' drag-over' : ''}`}
          onClick={() => inputRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDrag(true) }}
          onDragLeave={() => setDrag(false)}
          onDrop={onDrop}
        >
          <div className="upload-zone-icon">📎</div>
          <div className="upload-zone-title">Upload your CV / Resume</div>
          <div className="upload-zone-sub">Drag & drop, or click to browse · PDF, DOC, DOCX · Max {MAX_MB}MB</div>
        </div>
      )}

      {error && <div className="form-error">{error}</div>}
    </div>
  )
}
