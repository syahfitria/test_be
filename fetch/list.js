const sqlite = require("sqlite3").verbose();
const db = new sqlite.Database("./database.db", sqlite.OPEN_READWRITE, (err)=> {
  if (err) return console.error(err);
});

const sql = "CREATE TABLE product (ID INTEGER PRIMARY KEY, uuid, komoditas, area_provinsi, area_kota, size, price, price_usd, tgl_parsed, timestamp)"
db.run(sql)