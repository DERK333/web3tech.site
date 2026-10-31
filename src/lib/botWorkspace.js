import { base44 } from "@/api/base44Client";

// Gives a signed-in user their own bot workspace: one config they own and a
// starter watchlist. Runs once — anything already there is left untouched.
const DEFAULT_WATCHLIST = [
  { symbol: "SPY", asset_class: "etf" },
  { symbol: "QQQ", asset_class: "etf" },
  { symbol: "AAPL", asset_class: "stock" },
  { symbol: "BTC", asset_class: "crypto" },
  { symbol: "ETH", asset_class: "crypto" },
  { symbol: "SOL", asset_class: "crypto" },
];

export async function ensureBotWorkspace() {
  const user = await base44.auth.me();
  if (!user?.id) return null;

  const configs = await base44.entities.BotConfig.filter({ owner_id: user.id });
  if (!configs?.length) {
    await base44.entities.BotConfig.create({
      owner_id: user.id,
      mode: "paper",
      starting_cash: 100000,
      cash_balance: 100000,
      max_position_pct: 12,
      max_positions: 8,
      min_entry_score: 66,
      max_order_usd: 100,
      min_cash_reserve_pct: 20,
      stop_loss_pct: 8,
      take_profit_pct: 30,
      auto_tune: true,
      live_enabled: false,
      alpaca_paper: true,
    });
  }

  const assets = await base44.entities.BotAsset.filter({ owner_id: user.id });
  if (!assets?.length) {
    await base44.entities.BotAsset.bulkCreate(
      DEFAULT_WATCHLIST.map((asset) => ({ ...asset, owner_id: user.id, enabled: true }))
    );
  }

  return user;
}