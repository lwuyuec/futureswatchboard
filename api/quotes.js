// 国内期货行情中间层：Vercel Serverless Function
// 上游全部为新浪公开行情接口，免费、无需 token、支持 主连(0) 合约。
//
// 1) 实时报价:   https://hq.sinajs.cn/list=nf_AG0,nf_SP0,...   (需带 Referer)
//    nf_ 字段: [0]名称 [2]今开 [3]最高 [4]最低 [8]最新价 [10]昨结算
// 2) 分时预览:   https://stock2.finance.sina.com.cn/futures/api/jsonp.php/...
//                ...InnerFuturesNewService.getMinLine?symbol=AG0
//    返回当前交易日 1 分钟分时 [[时间, 价格, 均价, 成交, 持仓], ...]

const WATCHLIST = [
  { id: "AG0", name: "沪银主连", code: "ag9999", decimals: 0 },
  { id: "SP0", name: "纸浆主连", code: "sp9999", decimals: 0 },
  { id: "CJ0", name: "红枣主连", code: "CJ9999", decimals: 0 },
  { id: "V0", name: "PVC主连", code: "v9999", decimals: 0 },
  { id: "RB0", name: "螺纹钢主连", code: "rb9999", decimals: 0 },
  { id: "M0", name: "豆粕主连", code: "m9999", decimals: 0 },
  { id: "RM0", name: "菜粕主连", code: "RM9999", decimals: 0 },
  { id: "FG0", name: "玻璃主连", code: "FG9999", decimals: 0 },
  { id: "SA0", name: "纯碱主连", code: "SA9999", decimals: 0 },
  { id: "UR0", name: "尿素主连", code: "UR9999", decimals: 0 }
];

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
  // 新浪返回 GBK，数字为 ASCII 不受影响；中文名称统一用本地 WATCHLIST。
  return response.text();
}

// 解析 hq.sinajs.cn 的 nf_ 报价
function parseQuotes(source) {
  const rows = new Map();
  for (const match of source.matchAll(/var hq_str_nf_([A-Za-z0-9]+)="([^"]*)"/g)) {
    const fields = match[2].split(",");
    const last = num(fields[8]);
    const previous = num(fields[10]); // 昨结算（上一交易日结算价）
    if (last == null || previous == null) continue;
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

// 解析 getMinLine 返回的 [[时间,价格,均价,成交,持仓], ...]，只保留价格序列
function parseMinutes(source) {
  const start = source.indexOf("[");
  const end = source.lastIndexOf("]");
  if (start < 0 || end <= start) return [];
  try {
    const rows = JSON.parse(source.slice(start, end + 1));
    return rows
      .map((row) => num(row[1]))
      .filter((price) => price != null);
  } catch {
    return [];
  }
}

module.exports = async (request, response) => {
  // s-maxage 让 Vercel/CDN 缓存约 50 秒，客户端每 30~60 秒刷新即可；
  // stale-while-revalidate 让上游偶尔变慢时也能秒回旧数据，从而保护免费上游。
  response.setHeader("Cache-Control", "public, s-maxage=50, stale-while-revalidate=120");
  response.setHeader("Content-Type", "application/json; charset=utf-8");

  try {
    const ids = WATCHLIST.map((item) => item.id);
    const quoteUrl = QUOTE_URL + ids.map((id) => `nf_${id}`).join(",");

    const quoteSource = await fetchText(quoteUrl);
    const quoteRows = parseQuotes(quoteSource);

    // 并行拉取 10 个合约的分时序列；单个失败不影响整页。
    const minuteResults = await Promise.allSettled(
      ids.map((id) => fetchText(minuteUrl(id)))
    );
    const minutes = minuteResults.map((result) =>
      result.status === "fulfilled" ? parseMinutes(result.value) : []
    );

    const quotes = WATCHLIST.map((item, index) => {
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
      quotes: WATCHLIST.map((item) => ({ ...item, available: false, series: [] }))
    });
  }
};
