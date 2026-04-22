import { useState, useCallback, useEffect } from 'react'

let _setToast = null

export function ToastProvider() {
  const [toast, setToast] = useState(null)
  _setToast = setToast

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 3200)
    return () => clearTimeout(t)
  }, [toast])

  if (!toast) return null
  return (
    <div className={`toast ${toast.type || ''}`}>
      {toast.type === 'success' ? '✓' : toast.type === 'error' ? '✕' : 'ℹ'} {toast.msg}
    </div>
  )
}

export const toast = {
  success: (msg) => _setToast?.({ msg, type: 'success' }),
  error:   (msg) => _setToast?.({ msg, type: 'error' }),
  info:    (msg) => _setToast?.({ msg, type: '' }),
}
