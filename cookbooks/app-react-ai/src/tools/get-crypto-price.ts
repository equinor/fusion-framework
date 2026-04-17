import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';

const BINANCE_API = 'https://api.binance.com/api/v3/ticker/24hr';

const cryptoPriceSchema: z.ZodObject<{ symbol: z.ZodString }> = z.object({
  symbol: z
    .string()
    .describe(
      'Crypto trading pair symbol for Binance, e.g. BTCUSDT, ETHUSDT, SOLUSDT. Must include the quote asset (usually USDT).',
    ),
});

/** Tool that retrieves a live crypto price from the Binance public API. */
// @ts-expect-error — DynamicStructuredTool + Zod triggers TS2589 (excessively deep type instantiation)
export const getStockPriceTool: DynamicStructuredTool = new DynamicStructuredTool({
  name: 'get_crypto_price',
  description:
    'Get the current cryptocurrency price from Binance. Accepts a trading pair symbol like BTCUSDT, ETHUSDT, or SOLUSDT and returns the last price, 24h change, high, low, and volume.',
  schema: cryptoPriceSchema,
  func: async ({ symbol }: { symbol: string }): Promise<string> => {
    const pair = symbol.toUpperCase();
    const url = `${BINANCE_API}?${new URLSearchParams({ symbol: pair })}`;

    const res = await fetch(url);
    if (!res.ok) {
      if (res.status === 400) {
        return `Invalid symbol "${pair}". Use a valid Binance trading pair like BTCUSDT, ETHUSDT, or SOLUSDT.`;
      }
      return `Binance API error: ${res.status} ${res.statusText}`;
    }

    const data = (await res.json()) as {
      symbol: string;
      lastPrice: string;
      priceChangePercent: string;
      highPrice: string;
      lowPrice: string;
      volume: string;
      quoteVolume: string;
    };

    const change = Number.parseFloat(data.priceChangePercent);
    const direction = change >= 0 ? '+' : '';

    return [
      `${data.symbol}: ${Number.parseFloat(data.lastPrice).toLocaleString()} (${direction}${change.toFixed(2)}% 24h)`,
      `24h High: ${Number.parseFloat(data.highPrice).toLocaleString()}`,
      `24h Low: ${Number.parseFloat(data.lowPrice).toLocaleString()}`,
      `24h Volume: ${Number.parseFloat(data.quoteVolume).toLocaleString()} USDT`,
    ].join('\n');
  },
});
