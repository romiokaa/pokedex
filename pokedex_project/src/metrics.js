const client = require('prom-client');

function setupMetrics(app) {
  // Collecte les métriques par défaut (CPU, mémoire, ...)
  client.collectDefaultMetrics();

  // Compteur pour le nombre de requêtes
  const httpRequestCounter = new client.Counter({
    name: 'http_requests_total',
    help: 'Nombre total de requêtes HTTP',
    labelNames: ['method', 'route', 'status']
  });

  // Histogramme pour mesurer la latence
  const httpRequestDuration = new client.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Durée des requêtes HTTP en secondes',
    labelNames: ['method', 'route', 'status'],
    buckets: [0.1, 0.5, 1, 1.5, 2, 5]
  });

  // Middleware pour instrumenter les routes Express
  app.use((req, res, next) => {
    const end = httpRequestDuration.startTimer();
    res.on('finish', () => {
      httpRequestCounter.inc({ method: req.method, route: req.path, status: res.statusCode });
      end({ method: req.method, route: req.path, status: res.statusCode });
    });
    next();
  });

  // Endpoint /metrics pour Prometheus
  app.get('/metrics', async (req, res) => {
    res.set('Content-Type', client.register.contentType);
    res.end(await client.register.metrics());
  });
}

module.exports = setupMetrics;
