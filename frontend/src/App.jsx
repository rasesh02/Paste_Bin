import { useMemo, useState } from 'react'
import './App.css'

function App() {
  const [content, setContent] = useState('')
  const [ttl, setTtl] = useState('')
  const [maxViews, setMaxViews] = useState('')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')
  const [resultUrl, setResultUrl] = useState('')

  const apiBase = useMemo(() => {
    const env = import.meta.env?.VITE_API_BASE_URL
    return (env && String(env)) || 'http://localhost:5000'
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setResultUrl('')
    const payload = { content }
    if (ttl.trim() !== '') {
      payload.ttl_seconds = Number(ttl.trim())
    }
    if (maxViews.trim() !== '') {
      payload.max_views = Number(maxViews.trim())
    }
    setCreating(true)
    try {
      const res = await fetch(`${apiBase}/api/pastes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data?.error || 'Failed to create paste.')
      } else {
        setResultUrl(String(data?.url || ''))
        // Clear form fields immediately after a successful creation
        setContent('')
        setTtl('')
        setMaxViews('')
      }
    } catch (err) {
      setError('Network error. Is the backend running?')
    } finally {
      setCreating(false)
    }
  }

  async function copyUrl() {
    if (!resultUrl) return
    try {
      await navigator.clipboard.writeText(resultUrl)
    } catch {}
  }

  function resetForm() {
    setContent('')
    setTtl('')
    setMaxViews('')
    setError('')
    setResultUrl('')
  }

  return (
    <div className="container">
      <h1 className="title">
        Share Text <span className="title-accent">Securely</span>
      </h1>
      <p className="subtitle">
        Pastebin-Lite lets you share code and text with expiration and view limits.
      </p>

      {resultUrl ? (
        <div className="card">
          <div className="result-icon">✓</div>
          <h2>Paste Ready!</h2>
          <p className="helper">Share this secure link with others.</p>
          <div className="result-row">
            <input value={resultUrl} readOnly className="input-dark" />
            <button onClick={copyUrl} className="btn-primary">Copy</button>
          </div>
          <button className="mt-4" onClick={resetForm}>Create another paste</button>
        </div>
      ) : (
        <form noValidate onSubmit={handleSubmit} className="card">
          <label className="label">Content</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Paste your code, secrets, or text here..."
            rows={12}
            className="textarea"
          />

          <div className="field-grid">
            <div className="field">
              <label className="label">Expiration (TTL Seconds)</label>
              <input
                type="number"
                min={1}
                value={ttl}
                onChange={(e) => setTtl(e.target.value)}
                placeholder="e.g. 3600 (1 hour)"
                className="input"
              />
              <small className="helper">Optional. Leave empty for no expiration.</small>
            </div>
            <div className="field">
              <label className="label">Max Views</label>
              <input
                type="number"
                min={1}
                value={maxViews}
                onChange={(e) => setMaxViews(e.target.value)}
                placeholder="e.g. 5"
                className="input"
              />
              <small className="helper">Optional. Burn after reading limit.</small>
            </div>
          </div>

          {error && (
            <div className="error">{error}</div>
          )}

          <div className="actions">
            <button type="submit" disabled={creating} className="btn-primary">
              {creating ? 'Creating…' : 'Create Secure Paste'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

export default App
