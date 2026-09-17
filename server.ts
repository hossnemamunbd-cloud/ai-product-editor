import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { removeBackground } from '@imgly/background-removal-node';
import { generateProductBackground } from './server/aiBackgroundService';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Support large image payloads (up to 50MB)
  app.use(express.raw({
    type: ['image/*', 'application/octet-stream'],
    limit: '50mb'
  }));
  app.use(express.json({ limit: '50mb' }));

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // AI Background Generator Endpoint
  app.post('/api/generate-background', async (req, res) => {
    try {
      const { prompt, seed, usePresetIfAvailable } = req.body || {};
      if (!prompt || typeof prompt !== 'string') {
        return res.status(400).json({ error: 'A text prompt is required to generate a background' });
      }

      const result = await generateProductBackground({
        prompt,
        seed: typeof seed === 'number' ? seed : undefined,
        usePresetIfAvailable
      });

      res.json(result);
    } catch (err: any) {
      console.error('Error generating AI background:', err);
      res.status(500).json({
        error: 'Failed to generate AI background',
        details: err?.message || String(err)
      });
    }
  });

  // Server-side AI Background Removal Endpoint
  app.post('/api/remove-background', async (req, res) => {
    try {
      let imageBuffer: Buffer | null = null;
      let contentType = 'image/png';

      if (Buffer.isBuffer(req.body) && req.body.length > 0) {
        imageBuffer = req.body;
        contentType = req.headers['content-type'] || 'image/png';
      } else if (req.body && req.body.image) {
        // Base64 data URL payload support
        const base64Data = req.body.image.replace(/^data:image\/\w+;base64,/, '');
        imageBuffer = Buffer.from(base64Data, 'base64');
      }

      if (!imageBuffer || imageBuffer.length === 0) {
        return res.status(400).json({ error: 'No image data provided' });
      }

      // Convert buffer into a Blob with accurate mime type
      const inputBlob = new Blob([imageBuffer], { type: contentType });

      // Run deep learning foreground segmentation
      const resultBlob = await removeBackground(inputBlob, {
        model: 'small', // isnet_quint8 for fast, accurate subject isolation
        output: {
          format: 'image/png',
          quality: 1.0,
        }
      });

      const arrayBuffer = await resultBlob.arrayBuffer();
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.send(Buffer.from(arrayBuffer));
    } catch (error: any) {
      console.error('Server background removal error:', error);
      res.status(500).json({
        error: 'Failed to process image background removal',
        details: error?.message || String(error)
      });
    }
  });

  // Serve public static assets (including sample images)
  app.use(express.static(path.join(process.cwd(), 'public')));

  // Vite middleware for development vs static serve for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
