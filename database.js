import sqlite3 from "sqlite3";

//THIS CODE JUST PERFORMS CRUD ON THE TOKEN GIVEN
var db = new sqlite3.Database("tokens.db");

db.run(
  "CREATE TABLE IF NOT EXISTS tokens (token_address TEXT, decimals INTEGER, symbol TEXT, group_id INTEGER)"
);

export const insert_token = async (token, group_id, decimals, symbol) => {
  const res = db.run(
    `INSERT INTO tokens (token_address, decimals, symbol, group_id) VALUES ('${token}', ${decimals}, '${symbol}', ${group_id})`
  );
};

export const fetch_tokens = async (token) => {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT * FROM tokens WHERE token_address = '${token}'`,
      function (err, rows) {
        // console.log(rows);
        if (err) {
          console.log(err);
          console.log("Error occured");
          resolve();
        }
        // return rows;
        return resolve(rows);
      }
    );
  });
};

export const delete_token = async (token, group_id) => {
  return new Promise((resolve, reject) => {
    db.run(
      `DELETE FROM tokens WHERE token_address = '${token}' AND group_id = ${group_id}`
    );
    resolve();
  });
};

export const checkExist = async (token, group_id) => {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT * FROM tokens WHERE token_address = '${token}' AND group_id = ${group_id}`,
      function (err, rows) {
        if (err) {
          resolve();
        }
        resolve(rows);
      }
    );
  });
};
