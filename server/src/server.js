import express from 'express';
import cors from 'cors';
import './db.js';
import initiativesRouter from './routes/initiatives.js';
import snapshotsRouter from './routes/snapshots.js';
import flagsRouter from './routes/flags.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

app.use('/api/initiatives', initiativesRouter);
app.use('/api/snapshots', snapshotsRouter);
app.use('/api/flags', flagsRouter);

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Product LTV API listening on http://localhost:${PORT}`);
});
