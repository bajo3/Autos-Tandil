import 'dotenv/config'
import { Buffer } from 'node:buffer'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

function makeVercelHandler(importFn) {
  return async (req, res) => {
    try {
      const chunks = []
      for await (const chunk of req) chunks.push(chunk)
      const raw = Buffer.concat(chunks).toString('utf8')
      req.body = raw ? JSON.parse(raw) : {}
      req.headers.host ||= req.headers.Host || '127.0.0.1:5176'

      const { default: handler } = await importFn()
      const vercelRes = {
        statusCode: 200,
        headers: {},
        setHeader(key, value) { this.headers[key] = value; res.setHeader(key, value) },
        status(code) { this.statusCode = code; res.statusCode = code; return this },
        json(payload) {
          res.statusCode = this.statusCode
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(payload))
        },
      }
      await handler(req, vercelRes)
    } catch (error) {
      res.statusCode = 500
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ error: 'LOCAL_API_ERROR', detail: error?.message || String(error) }))
    }
  }
}

function localApiPlugin() {
  return {
    name: 'local-vercel-api',
    configureServer(server) {
      server.middlewares.use('/api/mp/create-preference', makeVercelHandler(() => import('./api/mp/create-preference.js')))
      server.middlewares.use('/api/admin/auth', makeVercelHandler(() => import('./api/admin/auth.js')))
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), localApiPlugin()],
  server: { port: 5176 },
})
