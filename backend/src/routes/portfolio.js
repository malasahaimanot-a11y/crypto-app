import express from 'express';

export const portfolioRouter = express.Router();

// In-memory store (replace with DB in production)
const store = new Map();

function getPortfolio(userId) {
  if (!store.has(userId)) store.set(userId, { holdings: [] });
  return store.get(userId);
}

// GET /api/portfolio/:userId
portfolioRouter.get('/:userId', (req, res) => {
  res.json(getPortfolio(req.params.userId));
});

// POST /api/portfolio/:userId/holding
portfolioRouter.post('/:userId/holding', (req, res) => {
  const { coinId, coinName, symbol, image, amount, purchasePrice } = req.body;
  if (!coinId || !amount || !purchasePrice) {
    return res.status(400).json({ error: 'coinId, amount, purchasePrice required' });
  }
  const portfolio = getPortfolio(req.params.userId);
  const existing = portfolio.holdings.find(h => h.coinId === coinId);
  if (existing) {
    const totalCost = existing.amount * existing.purchasePrice + amount * purchasePrice;
    const totalAmount = existing.amount + Number(amount);
    existing.amount = totalAmount;
    existing.purchasePrice = totalCost / totalAmount;
  } else {
    portfolio.holdings.push({
      id: `${coinId}-${Date.now()}`,
      coinId, coinName, symbol, image,
      amount: Number(amount),
      purchasePrice: Number(purchasePrice),
      addedAt: new Date().toISOString()
    });
  }
  res.json(portfolio);
});

// DELETE /api/portfolio/:userId/holding/:holdingId
portfolioRouter.delete('/:userId/holding/:holdingId', (req, res) => {
  const portfolio = getPortfolio(req.params.userId);
  portfolio.holdings = portfolio.holdings.filter(h => h.id !== req.params.holdingId);
  res.json(portfolio);
});

// PATCH /api/portfolio/:userId/holding/:holdingId
portfolioRouter.patch('/:userId/holding/:holdingId', (req, res) => {
  const portfolio = getPortfolio(req.params.userId);
  const holding = portfolio.holdings.find(h => h.id === req.params.holdingId);
  if (!holding) return res.status(404).json({ error: 'Holding not found' });
  const { amount, purchasePrice } = req.body;
  if (amount !== undefined) holding.amount = Number(amount);
  if (purchasePrice !== undefined) holding.purchasePrice = Number(purchasePrice);
  res.json(portfolio);
});
