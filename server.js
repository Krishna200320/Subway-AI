import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import Anthropic from '@anthropic-ai/sdk'

const app = express()
const PORT = 3001

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:4173', 'http://localhost:5174'],
}))
app.use(express.json({ limit: '64kb' }))

const anthropic = new Anthropic({ apiKey: process.env.VITE_CLAUDE_API_KEY })

app.post('/api/chat', async (req, res) => {
  const { messages, systemPrompt } = req.body

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'messages array is required' })
  }

  if (!process.env.VITE_CLAUDE_API_KEY) {
    return res.status(503).json({ error: 'Claude API key not configured.' })
  }

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 1024,
      system: systemPrompt || 'You are a helpful Subway Canada ordering assistant.',
      messages,
    })

    res.json({ content: response.content[0].text })
  } catch (err) {
    console.error('Claude API error:', err.message)
    const status = err.status || 500
    const message = err.message?.includes('authentication') ? 'Invalid API key.'
      : err.message?.includes('rate') ? 'Rate limit reached — please wait a moment.'
      : 'AI service temporarily unavailable.'
    res.status(status).json({ error: message })
  }
})

app.listen(PORT, () => {
  const keyStatus = process.env.VITE_CLAUDE_API_KEY
    ? 'API key configured'
    : 'API key missing — add VITE_CLAUDE_API_KEY to .env'
  console.log(`SubAI proxy running on http://localhost:${PORT}`)
  console.log(keyStatus)
})