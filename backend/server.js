const express = require('express');
const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());

app.get('/api/scraper/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    service: 'nutri-bruin-scraper',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/scraper/stats', (req, res) => {
  res.json({
    status: 'operational',
    mongodb: process.env.MONGODB_URI ? 'configured' : 'not configured',
    redis: process.env.REDIS_HOST ? 'configured' : 'not configured'
  });
});

app.post('/api/scraper/run', (req, res) => {
  res.status(202).json({
    jobId: Date.now().toString(),
    status: 'accepted',
    message: 'Scraper deployed successfully!'
  });
});

app.get('/', (req, res) => {
  res.send('NutriBruin Scraper Service Running');
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});