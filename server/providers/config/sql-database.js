require("dotenv").config();
const mysql = require("mysql");

function createSQLPool() {
  return mysql.createPool({
    host: process.env.host,
    user: process.env.user,
    password: process.env.password,
    database: process.env.database,
  });
}

exports.connect = () => {
  return createSQLPool();
};
