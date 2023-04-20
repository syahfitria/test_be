const express = require("express");
const bodyParser =  require("body-parser");
const app = express();
const res = require("express/lib/response");
const sqlite = require("sqlite3").verbose();
const axios = require("axios");
const jwtDecode = require("jwt-decode");
const jwt = require("jsonwebtoken");

const db = new sqlite.Database("./database.db", sqlite.OPEN_READWRITE, (err)=> {
  if (err) return console.error(err);
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

function checkJwt(req){
  if (req.headers && req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {

    const token = req.headers.authorization.split(' ')[1];
    const secret = "testefishery";
    const payload = jwt.verify(token, secret, function(err, decoded){
      if (err) return false;
      return decoded;
    })
    return payload;
  } else {
    return false;
  }
};

app.get('/fetchdata', (req,res) => {
  if (checkToken == false) {
    return res.json({
      status: 400,
      error: "Invalid Token"
    });
  }
  try {
    axios.get("https://stein.efishery.com/v1/storages/5e1edf521073e315924ceab4/list")
         .then(function (response) {
            sql = "SELECT * FROM product"

            db.all(sql, [], (err, rows) => {
              if (err) return res.json({status: 300, success: false, error: err});

              if (rows.length < 1) {
                currency = false
                axios.get("https://api.freecurrencyapi.com/v1/latest?apikey=PGfbRbrr4G1OPfvpSEIXV0ZRqO36KXNQjcHI1LIP")
                .then(function (response_currency) {
                  insert_fetch = "INSERT INTO product (uuid, komoditas, area_provinsi, area_kota, size, price, price_usd, tgl_parsed, timestamp)"
                  insert_fetch += "VALUES (?,?,?,?,?,?,?,?,?)"
                  for (let product in Object.keys(response.data)) {
                    if(response.data[product]["uuid"] != null){
                        array_data = [
                          response.data[product]["uuid"],
                          response.data[product]["komoditas"],
                          response.data[product]["area_provinsi"],
                          response.data[product]["area_kota"],
                          response.data[product]["size"],
                          response.data[product]["price"],
                          (response.data[product]["price"]/response_currency.data.data.IDR).toFixed(2),
                          response.data[product]["tgl_parsed"],
                          response.data[product]["timestamp"],
                        ];
                        db.run(insert_fetch, array_data, (err)=>{
                          console.log("sucessfully insert data");
                        });
                    }
                  }
                })
                .catch(function (error) {
                  return res.json({
                    status: 400,
                    success:false
                  })
                });
                return res.json({
                  status: 200,
                  success:true
                })
              }
            })


          })
         .catch(function (error) {
            console.log(error);
            return res.json({
              status: 400,
              success:false
            })
          });


  } catch (error) {
    return res.json({
      status: 400,
      success:false
    });
  }
});

app.get('/list', (req,res) => {
  checkToken = checkJwt(req);
  if (checkToken == false) {
    return res.json({
      status: 400,
      error: "Invalid Token"
    });
  }

  sql = "SELECT * FROM product"
  try {
    db.all(sql, [], (err, rows)=>{
      if (err) return res.json({status: 300, success: false, error: err});
      if (rows.length < 1)  return res.json({status: 300, success: false, error: "Empty data"});
      return res.json({
        status: 200,
        data: rows,
        success:true
      });
    });
  } catch (error) {
    return res.json({
      status: 400,
      success:false
    });
  }
});

app.get('/aggregation', (req,res) => {
  checkToken = checkJwt(req);
  if (checkToken == false) {
    return res.json({
      status: 400,
      error: "Invalid Token"
    });
  }
  sql = "SELECT area_provinsi, MIN(price) as min_price, MAX(price) as max_price, MIN(size) as min_size, MAX(size) as max_size, AVG(size) as avg_size, AVG(price) as avg_price FROM product GROUP BY area_provinsi"

  try {
    if (checkToken.role == "admin"){
      db.all(sql, [], (err, rows)=>{
        if (err) return res.json({status: 300, success: false, error: err});
        if (rows.length < 1)  return res.json({status: 300, success: false, error: "Empty data"});
        return res.json({
          status: 200,
          data: rows,
          success:true
        });
      });
    } else {
      return res.json({
        status: 400,
        error: "User not allowed"
      })
    }

  } catch (error) {
    return res.json({
      status: 400,
      error:error
    });
  }
});


app.listen(9999);