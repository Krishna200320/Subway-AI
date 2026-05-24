export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export async function callClaude(messages, systemPrompt) {
  const res = await fetch(`${API_BASE}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, systemPrompt }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || `Server error ${res.status}`)
  }

  return res.json()
}