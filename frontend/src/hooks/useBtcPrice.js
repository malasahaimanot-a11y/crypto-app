import { useState, useEffect } from 'react';

const URL =
  'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=ils,usd';
const REFRESH_MS = 60_000;

export function useBtcPrice() {
  const [price, setPrice]   = useState(null);   // { ils, usd }
  const [fresh, setFresh]   = useState(false);  // briefly true after each successful fetch
  const [error, setError]   = useState(false);

  useEffect(() => {
    let alive = true;
    let freshTimer;

    async function load() {
      try {
        const res  = await fetch(URL);
        if (!res.ok) throw new Error('network');
        const json = await res.json();
        if (!alive) return;
        setPrice({ ils: json.bitcoin.ils, usd: json.bitcoin.usd });
        setError(false);
        setFresh(true);
        clearTimeout(freshTimer);
        freshTimer = setTimeout(() => setFresh(false), 3000);
      } catch {
        if (alive) setError(true);
      }
    }

    load();
    const interval = setInterval(load, REFRESH_MS);
    return () => {
      alive = false;
      clearInterval(interval);
      clearTimeout(freshTimer);
    };
  }, []);

  return { price, fresh, error };
}
