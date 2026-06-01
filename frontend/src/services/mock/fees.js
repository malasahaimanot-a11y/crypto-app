// Mock fee estimation service.
// Production replacement: LND fee estimation via /v1/fees/bitcoin and
// LNURL-pay service_fee from the recipient's node.

const LIGHTNING_RATE = 0.0002;   // 0.02% of amount
const LIGHTNING_MIN  = 0.01;     // ₪0.01 minimum
const CC_RATE        = 0.025;    // 2.5% typical card processing fee
const CC_MIN         = 0.50;     // ₪0.50 minimum

export function estimate(amountILS) {
  if (!amountILS || amountILS <= 0) return null;
  const lightning  = Math.max(LIGHTNING_MIN, amountILS * LIGHTNING_RATE);
  const creditCard = Math.max(CC_MIN,        amountILS * CC_RATE);
  return {
    lightning,
    creditCard,
    savings:        creditCard - lightning,
    savingsPct:     Math.round(((creditCard - lightning) / creditCard) * 100),
  };
}

export function fmt(fee) {
  if (fee < 0.1) return `₪${fee.toFixed(3)}`;
  if (fee < 10)  return `₪${fee.toFixed(2)}`;
  return `₪${Math.round(fee)}`;
}
