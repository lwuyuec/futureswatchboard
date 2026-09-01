// 国内期货行情中间层：Vercel Serverless Function
// 上游全部为新浪公开行情接口，免费、无需 token、支持 主连(0) 合约。
//
// 1) 实时报价:   https://hq.sinajs.cn/list=nf_AG0,nf_SP0,...   (需带 Referer)
//    nf_ 字段: [0]名称 [2]今开 [3]最高 [4]最低 [8]最新价 [10]昨结算
// 2) 分时预览:   https://stock2.finance.sina.com.cn/futures/api/jsonp.php/...
//                ...InnerFuturesNewService.getMinLine?symbol=AG0
//    返回当前交易日 1 分钟分时 [[时间, 价格, 均价, 成交, 持仓], ...]
//
// 自选股可配置：前端通过 ?ids=AG0,RB0,... 传入要展示的合约（按序返回）。

const { CATALOG, DEFAULT_IDS } = require("../lib/catalog.js");

const CATALOG_BY_ID = new Map(CATALOG.map((c) => [c.id, c]));

const QUOTE_URL = "https://hq.sinajs.cn/list=";
const minuteUrl = (id) =>
  `https://stock2.finance.sina.com.cn/futures/api/jsonp.php/var%20_${id}=/InnerFuturesNewService.getMinLine?symbol=${id}`;

const headers = {
  "User-Agent": "Mozilla/5.0 (compatible; FuturesBoard/1.0)",
  Referer: "https://finance.sina.com.cn/"
};

function num(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers,
    signal: AbortSignal.timeout(9000)
  });
  if (!response.ok) throw new Error(`upstream returned ${response.status}`);
  return response.text(); // 数字为 ASCII，中文名称统一走本地 CATALOG
}

// ?ids=AG0,RB0,...  → 展开为 { id, name, code, exchange, decimals } 列表（去重、保序）
function resolveItems(param) {
  let tokens = [];
  if (typeof param === "string") tokens = param.split(",");
  else if (Array.isArray(param)) tokens = param;
  tokens = tokens.map((s) => String(s).trim()).filter(Boolean);

  const source = tokens.length ? tokens : DEFAULT_IDS;
  const seen = new Set();
  const items = [];
  for (const raw of source) {
    const id = String(raw).toUpperCase();
    if (seen.has(id)) continue;
    seen.add(id);
    const catalog = CATALOG_BY_ID.get(id);
    items.push(
      catalog
        ? { id, name: catalog.name, code: catalog.code, exchange: catalog.exchange, decimals: catalog.decimals ?? 0 }
        : { id, name: id, code: id, exchange: "", decimals: 0 }
    );
  }
  return items;
}

function parseQuotes(source) {
  const rows = new Map();
  for (const match of source.matchAll(/var hq_str_nf_([A-Za-z0-9]+)="([^"]*)"/g)) {
    const fields = match[2].split(",");
    const last = num(fields[8]);
    const previous = num(fields[10]); // 昨结算（上一交易日结算价）
    // last<=0 可能出现在盘前或金融期货字段错位；统一视为不可用
    if (last == null || last <= 0 || previous == null) continue;
    rows.set(match[1].toUpperCase(), {
      last,
      previous,
      open: num(fields[2]),
      high: num(fields[3]),
      low: num(fields[4])
    });
  }
  return rows;
}

function parseMinutes(source) {
  const start = source.indexOf("[");
  const end = source.lastIndexOf("]");
  if (start < 0 || end <= start) return [];
  try {
    const rows = JSON.parse(source.slice(start, end + 1));
    return rows.map((row) => num(row[1])).filter((price) => price != null);
  } catch {
    return [];
  }
}

module.exports = async (request, response) => {
  response.setHeader("Cache-Control", "public, s-maxage=45, stale-while-revalidate=120");
  response.setHeader("Content-Type", "application/json; charset=utf-8");

  const items = resolveItems(request.query && request.query.ids);
  const ids = items.map((item) => item.id);

  try {
    const quoteUrl = QUOTE_URL + ids.map((id) => `nf_${id}`).join(",");
    const quoteSource = await fetchText(quoteUrl);
    const quoteRows = parseQuotes(quoteSource);

    const minuteResults = await Promise.allSettled(
      ids.map((id) => fetchText(minuteUrl(id)))
    );
    const minutes = minuteResults.map((result) =>
      result.status === "fulfilled" ? parseMinutes(result.value) : []
    );

    const quotes = items.map((item, index) => {
      const quote = quoteRows.get(item.id);
      const series = minutes[index] || [];
      if (!quote) {
        return { ...item, available: false, series: [], changePct: null, last: null };
      }
      const changePct = ((quote.last - quote.previous) / quote.previous) * 100;
      return {
        ...item,
        available: true,
        last: quote.last,
        previous: quote.previous,
        open: quote.open,
        high: quote.high,
        low: quote.low,
        changePct,
        series
      };
    });

    response.status(200).json({
      source: "新浪财经公开行情",
      refreshedAt: new Date().toISOString(),
      refreshSeconds: 60,
      quotes
    });
  } catch (error) {
    response.status(502).json({
      error: "暂时无法获取公开行情，请在一分钟后重试。",
      refreshedAt: new Date().toISOString(),
      quotes: items.map((item) => ({ ...item, available: false, series: [] }))
    });
  }
};
