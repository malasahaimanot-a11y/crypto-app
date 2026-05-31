import express from 'express';
import fetch from 'node-fetch';

export const cryptoRouter = express.Router();

const BASE = process.env.COINGECKO_BASE_URL || 'https://api.coingecko.com/api/v3';

async function cgFetch(path) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { Accept: 'application/json' }
  });
  if (!res.ok) throw Object.assign(new Error('CoinGecko error'), { status: res.status });
  return res.json();
}

// GET /api/crypto/markets?currency=usd&page=1&per_page=50
cryptoRouter.get('/markets', async (req, res, next) => {
  try {
    const { currency = 'usd', page = 1, per_page = 50 } = req.query;
    const data = await cgFetch(
      `/coins/markets?vs_currency=${currency}&order=market_cap_desc&per_page=${per_page}&page=${page}&sparkline=true&price_change_percentage=1h,24h,7d`
    );
    res.json(data);
  } catch (e) { next(e); }
});

// GET /api/crypto/coin/:id
cryptoRouter.get('/coin/:id', async (req, res, next) => {
  try {
    const data = await cgFetch(
      `/coins/${req.params.id}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false`
    );
    res.json(data);
  } catch (e) { next(e); }
});

// GET /api/crypto/history/:id?days=7&currency=usd
cryptoRouter.get('/history/:id', async (req, res, next) => {
  try {
    const { days = 7, currency = 'usd' } = req.query;
    const data = await cgFetch(`/coins/${req.params.id}/market_chart?vs_currency=${currency}&days=${days}`);
    res.json(data);
  } catch (e) { next(e); }
});

// GET /api/crypto/search?q=bitcoin
cryptoRouter.get('/search', async (req, res, next) => {
  try {
    const { q = '' } = req.query;
    const data = await cgFetch(`/search?query=${encodeURIComponent(q)}`);
    res.json({ coins: data.coins.slice(0, 20) });
  } catch (e) { next(e); }
});

// GET /api/crypto/prices?ids=bitcoin,ethereum&currency=usd
cryptoRouter.get('/prices', async (req, res, next) => {
  try {
    const { ids = '', currency = 'usd' } = req.query;
    const data = await cgFetch(`/simple/price?ids=${ids}&vs_currencies=${currency}&include_24hr_change=true`);
    res.json(data);
  } catch (e) { next(e); }
});
