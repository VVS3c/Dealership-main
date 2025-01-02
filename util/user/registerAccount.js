const db = require("../db");
const bcrypt = require("bcrypt");

async function registerAccount(username, password) {
 
  const [rows] = await db.query("SELECT * FROM users WHERE username = ?", [
    username,
  ]);
  if (rows.length > 0) {
    throw new Error("Username already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);


  await db.query("INSERT INTO users (username, password) VALUES (?, ?)", [
    username,
    hashedPassword,
  ]);
}

module.exports = registerAccount;

