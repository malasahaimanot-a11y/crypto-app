import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { cryptoRouter } from './routes/crypto.js';
import { portfolioRouter } from './routes/portfolio.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(cors({ origin: process.env.ALLOWED_ORIGIN || 'http://localhost:5173' }));
app.use(express.json());

const limiter = rateLimit({ windowMs: 60_000, max: 60, standardHeaders: true, legacyHeaders: false });
app.use('/api', limiter);

app.use('/api/crypto', cryptoRouter);
app.use('/api/portfolio', portfolioRouter);

app.get('/api/health', (_req, res) => res.json({ status: 'ok', ts: Date.now() }));

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
