// 国内期货“主连”合约目录（新浪代码 = 品种拼音大写 + '0'）。
// id: 新浪内部代码（用于 hq.sinajs.cn 与 getMinLine）
// name / code: 页面展示用（code 沿用 ag9999 这种主连写法）
// exchange: 简写，便于自选管理面板分组/检索

const CATALOG = [
  // 上期所 SHFE
  { id: "CU0", name: "沪铜主连", code: "cu9999", exchange: "上期所" },
  { id: "AL0", name: "沪铝主连", code: "al9999", exchange: "上期所" },
  { id: "ZN0", name: "沪锌主连", code: "zn9999", exchange: "上期所" },
  { id: "PB0", name: "沪铅主连", code: "pb9999", exchange: "上期所" },
  { id: "NI0", name: "沪镍主连", code: "ni9999", exchange: "上期所" },
  { id: "SN0", name: "沪锡主连", code: "sn9999", exchange: "上期所" },
  { id: "AU0", name: "沪金主连", code: "au9999", exchange: "上期所", decimals: 2 },
  { id: "AG0", name: "沪银主连", code: "ag9999", exchange: "上期所" },
  { id: "RB0", name: "螺纹钢主连", code: "rb9999", exchange: "上期所" },
  { id: "HC0", name: "热卷主连", code: "hc9999", exchange: "上期所" },
  { id: "SS0", name: "不锈钢主连", code: "ss9999", exchange: "上期所" },
  { id: "FU0", name: "燃料油主连", code: "fu9999", exchange: "上期所" },
  { id: "BU0", name: "沥青主连", code: "bu9999", exchange: "上期所" },
  { id: "SP0", name: "纸浆主连", code: "sp9999", exchange: "上期所" },
  { id: "RU0", name: "橡胶主连", code: "ru9999", exchange: "上期所" },
  { id: "WR0", name: "线材主连", code: "wr9999", exchange: "上期所" },

  // 大商所 DCE
  { id: "A0", name: "豆一主连", code: "a9999", exchange: "大商所" },
  { id: "B0", name: "豆二主连", code: "b9999", exchange: "大商所" },
  { id: "M0", name: "豆粕主连", code: "m9999", exchange: "大商所" },
  { id: "Y0", name: "豆油主连", code: "y9999", exchange: "大商所" },
  { id: "P0", name: "棕榈主连", code: "p9999", exchange: "大商所" },
  { id: "C0", name: "玉米主连", code: "c9999", exchange: "大商所" },
  { id: "CS0", name: "淀粉主连", code: "cs9999", exchange: "大商所" },
  { id: "JD0", name: "鸡蛋主连", code: "jd9999", exchange: "大商所" },
  { id: "I0", name: "铁矿石主连", code: "i9999", exchange: "大商所" },
  { id: "J0", name: "焦炭主连", code: "j9999", exchange: "大商所" },
  { id: "JM0", name: "焦煤主连", code: "jm9999", exchange: "大商所" },
  { id: "V0", name: "PVC主连", code: "v9999", exchange: "大商所" },
  { id: "PP0", name: "聚丙烯主连", code: "pp9999", exchange: "大商所" },
  { id: "L0", name: "塑料主连", code: "l9999", exchange: "大商所" },
  { id: "EG0", name: "乙二醇主连", code: "eg9999", exchange: "大商所" },
  { id: "EB0", name: "苯乙烯主连", code: "eb9999", exchange: "大商所" },
  { id: "PG0", name: "液化石油气主连", code: "pg9999", exchange: "大商所" },
  { id: "LH0", name: "生猪主连", code: "lh9999", exchange: "大商所" },
  { id: "RR0", name: "粳米主连", code: "rr9999", exchange: "大商所" },

  // 郑商所 CZCE
  { id: "SR0", name: "白糖主连", code: "SR9999", exchange: "郑商所" },
  { id: "CF0", name: "棉花主连", code: "CF9999", exchange: "郑商所" },
  { id: "CY0", name: "棉纱主连", code: "CY9999", exchange: "郑商所" },
  { id: "FG0", name: "玻璃主连", code: "FG9999", exchange: "郑商所" },
  { id: "SA0", name: "纯碱主连", code: "SA9999", exchange: "郑商所" },
  { id: "RM0", name: "菜粕主连", code: "RM9999", exchange: "郑商所" },
  { id: "OI0", name: "菜油主连", code: "OI9999", exchange: "郑商所" },
  { id: "TA0", name: "PTA主连", code: "TA9999", exchange: "郑商所" },
  { id: "MA0", name: "甲醇主连", code: "MA9999", exchange: "郑商所" },
  { id: "PF0", name: "短纤主连", code: "PF9999", exchange: "郑商所" },
  { id: "PX0", name: "对二甲苯主连", code: "PX9999", exchange: "郑商所" },
  { id: "UR0", name: "尿素主连", code: "UR9999", exchange: "郑商所" },
  { id: "SM0", name: "锰硅主连", code: "SM9999", exchange: "郑商所" },
  { id: "SF0", name: "硅铁主连", code: "SF9999", exchange: "郑商所" },
  { id: "AP0", name: "苹果主连", code: "AP9999", exchange: "郑商所" },
  { id: "CJ0", name: "红枣主连", code: "CJ9999", exchange: "郑商所" },
  { id: "PK0", name: "花生主连", code: "PK9999", exchange: "郑商所" },
  { id: "RS0", name: "菜籽主连", code: "RS9999", exchange: "郑商所" },
  { id: "SH0", name: "烧碱主连", code: "SH9999", exchange: "郑商所" },

  // 上海国际能源交易中心 INE
  { id: "SC0", name: "原油主连", code: "sc9999", exchange: "上海能源" },
  { id: "LU0", name: "低硫燃料油主连", code: "lu9999", exchange: "上海能源" },
  { id: "NR0", name: "20号胶主连", code: "nr9999", exchange: "上海能源" },
  { id: "BC0", name: "国际铜主连", code: "bc9999", exchange: "上海能源" },
  { id: "EC0", name: "集运指数(欧线)主连", code: "ec9999", exchange: "上海能源" },

  // 广期所 GFEX
  { id: "SI0", name: "工业硅主连", code: "si9999", exchange: "广期所" },
  { id: "LC0", name: "碳酸锂主连", code: "lc9999", exchange: "广期所" }
];

const DEFAULT_IDS = ["AG0", "SP0", "CJ0", "V0", "RB0", "M0", "RM0", "FG0", "SA0", "UR0"];

module.exports = { CATALOG, DEFAULT_IDS };
