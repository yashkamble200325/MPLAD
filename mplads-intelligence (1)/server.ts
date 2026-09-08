import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { riskEngine } from './src/services/ml/riskEngine';
import { ACTIVE_ML_MODELS } from './src/services/ml/modelRegistry';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'MPLADS INTELLIGENCE AI/ML Service',
      version: '2.1.0',
      timestamp: new Date().toISOString(),
    });
  });

  // Return list of active AI models and metadata
  app.get('/api/ml/models', (req, res) => {
    res.json({
      models: ACTIVE_ML_MODELS,
      engineVersion: '2.1.0-PROD-AUDIT',
      timestamp: new Date().toISOString(),
    });
  });

  // Evaluate a single project
  app.post('/api/ml/evaluate', (req, res) => {
    try {
      const { project, catalog, weights } = req.body;
      if (!project) {
        return res.status(400).json({ error: 'Missing project payload' });
      }
      const result = riskEngine.evaluateProject(project, catalog || [], weights);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Inference evaluation failed' });
    }
  });

  // Batch evaluate multiple projects
  app.post('/api/ml/evaluate-all', (req, res) => {
    try {
      const { projects, weights } = req.body;
      if (!Array.isArray(projects)) {
        return res.status(400).json({ error: 'Missing projects array' });
      }
      const evaluated = riskEngine.evaluateAllProjects(projects, weights);
      res.json({ projects: evaluated });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Batch inference failed' });
    }
  });

  // Vite middleware setup
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
    console.log(`[MPLADS INTELLIGENCE] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
