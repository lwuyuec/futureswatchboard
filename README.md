# 国内期货看盘（分时预览）

一个模仿券商 App「分时预览」列表的国内期货看盘页面：左侧品种与代码，中间当前交易日 1 分钟分时走势，右侧最新价与涨跌幅（红涨绿跌）。

<img width="889" height="811" alt="image" src="https://github.com/user-attachments/assets/660c0fa6-df05-468a-a952-7bad8f09f95c" />


## 技术方案

### 架构

浏览器 (index.html) → fetch /api/quotes?ids=... → Vercel Serverless Function (api/quotes.js) → 新浪财经公开行情

- 数据中间层放在 Serverless Function，而不是让浏览器直连新浪：可以规避跨域(Referer/UA)限制、集中缓存、保护免费上游，也方便失败降级。
- 自选可配置：前端把自选保存在浏览器 `localStorage`，通过 `?ids=AG0,RB0,...` 传给接口按序返回；“编辑自选”面板从 `/api/catalog` 拉取可添加品种目录，支持搜索添加与点击移除。
- Vercel 免费版即可运行，无需数据库、无需 API key。

### 数据来源（全部免费、稳定、无需注册）

| 用途 | 接口 | 说明 |
| --- | --- | --- |
| 实时报价 | `https://hq.sinajs.cn/list=nf_AG0,nf_SP0,...` | 需带 `Referer: https://finance.sina.com.cn`；`nf_` 后缀 `0` 表示主连 |
| 分时预览 | `stock2.finance.sina.com.cn/...InnerFuturesNewService.getMinLine?symbol=AG0` | 返回当前交易日 1 分钟分时 `[[时间,价格,均价,成交,持仓],...]` |
| 昨结算核对 | `...InnerFuturesNewService.getDailyKLine?symbol=AG0` | 日线的 `s` 字段为当日结算价（用于校验昨结） |

重点：涨跌幅必须基于昨结算（上一交易日结算价），即 `nf_` 报价字段下标 `10`，而不是昨收盘或今开。这是本项目修正过的关键点。

### 可配置自选品种（lib/catalog.js）

“可添加品种”目录在 [lib/catalog.js](lib/catalog.js)，目前包含 61 个商品期货主连（上期所 / 大商所 / 郑商所 / 上能源 / 广期所），均已实测能取到有效价格。页面展示用 `ag9999` 这类代码，底层请求用新浪的 `0` 主连代码（如 `AG0`、`SP0`、`RB0`）。常见对照见下：

| 品种 | 展示代码 | 新浪代码 |
| --- | --- | --- |
| 沪银主连 | ag9999 | AG0 |
| 纸浆主连 | sp9999 | SP0 |
| 红枣主连 | CJ9999 | CJ0 |
| PVC主连 | v9999 | V0 |
| 螺纹钢主连 | rb9999 | RB0 |
| 豆粕主连 | m9999 | M0 |
| 菜粕主连 | RM9999 | RM0 |
| 玻璃主连 | FG9999 | FG0 |
| 纯碱主连 | SA9999 | SA0 |
| 尿素主连 | UR9999 | UR0 |

> 说明：金融期货（中金所 IF/IH/IC/IM、国债 T/TF/TS/TL）在新浪的报价字段布局与商品期货不同，为避免显示错误数据，暂未放入目录。如需支持，可在 `api/quotes.js` 的 `parseQuotes` 里按“首字段是否为数字”区分金融期货布局。

## 本地运行

项目是 Vercel 结构（静态前端 + `api/` 下的 Serverless Function）。本地预览最简单的方式是部署到 Vercel 后访问线上地址；若想在本机查看，可用任意支持 Serverless 的本地框架（如 `vercel dev`）启动：

```bash
npm i -g vercel
vercel dev
```

然后浏览器打开 `http://localhost:3000`。

## 部署到 Vercel（免费）

1. 把整个文件夹推到 GitHub：

   ```bash
   git add -A
   git commit -m "futures watch board"
   git branch -M main
   git remote add origin https://github.com/<你的用户名>/<仓库名>.git
   git push -u origin main
   ```

2. 打开 [vercel.com](https://vercel.com)，用 GitHub 登录，点 Add New Project，导入刚才的仓库。
3. Framework Preset 留默认即可：Vercel 会自动识别 `api/quotes.js` 为 Serverless Function、`index.html` 为静态前端。无需填写构建命令和输出目录。
4. 点 Deploy，稍等即可得到 `https://<项目名>.vercel.app`。
5. 以后每次 `git push` 会自动重新部署（Hobby 免费计划足够）。

### 部署后注意事项

- 缓存：接口已设置 `Cache-Control: public, s-maxage=50, stale-while-revalidate=120`，前端每 60 秒刷新，多数命中 CDN，减小对免费上游的压力。
- 时长：`vercel.json` 里把函数时长调到 `20s`；即使免费计划上限更低，代码在 10 秒内也能完成（报价 + 10 个分时并行请求）。
- 自选数量：每个自选会额外产生一次分时请求，建议控制在 30 个以内，避免过多上游请求或变慢。
- 非交易时段：周末、长假或行情异常时，会稳定返回最近一个交易日的分时与价格；个别合约可能无最新价，页面显示“暂无行情”。

## 免责声明

数据来自新浪财经公开行情，仅供学习与展示，不构成投资建议。“主连”为连续主力合约指数，不是可直接交易的合约；行情可能延迟，请以交易所官方数据为准。
