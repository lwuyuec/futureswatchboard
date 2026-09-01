// 自选管理面板使用的“可添加品种”目录。
const { CATALOG } = require("../lib/catalog.js");

module.exports = async (request, response) => {
  response.setHeader("Cache-Control", "public, s-maxage=86400");
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.status(200).json({ catalog: CATALOG });
};
