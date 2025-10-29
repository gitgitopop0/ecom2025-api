const mysql = require("mysql2")
const dotenv = require("dotenv")
const fs = require("fs")
dotenv.config()

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    ssl: {
        ca: fs.readFileSync(__dirname + '/isrgrootx1.pem')
    }
})

db.connect((err) => {
    if (err) {
        console.log("Database connection failed!!", err)
    } else {
        console.log("Database connected")
    }
})

module.exports = db