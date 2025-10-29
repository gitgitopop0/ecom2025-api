const db = require("../db")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
require("dotenv").config()

exports.register = async (req, res) => {
    try {

        const checkUser = "SELECT email FROM user WHERE email =?"

        const [rows] = await db.promise().query(checkUser, [req.body.email])

        if (rows.length > 0) {
            return res.status(409).json({ message: "User already exists" })
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(req.body.password, salt)

        const insertUser = "INSERT INTO user (name, email, password) VALUES (?)"
        const values = [
            req.body.name,
            req.body.email,
            hashedPassword
        ]

        const [result] = await db.promise().query(insertUser, [values])


        res.status(201).json({
            message: "registered successfully",
            userId: result.insertId
        })
    } catch (error) {
        console.error("Register Error:", error)
        res.status(500).json({ message: "Server error", error: error.message })
    }
}

exports.login = async (req, res) => {
    try {

        const { password, email } = req.body

        const query = "SELECT * FROM user WHERE email = ?"
        const [rows] = await db.promise().query(query, [email])
        if (rows.length === 0) {
            return res.status(404).json({
                message: "User not found"
            })
        }

        const user = rows[0]

        const passwordRows = await bcrypt.compare(password, user.password)
        if (!passwordRows) {
            return res.status(401).json({
                message: "Incorrect password"
            })
        }

        const payRoad = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        }

        const token = jwt.sign(payRoad, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_SECRET_EXPIRES_IN
        })
        console.log(token)

        res.status(200).json({
            message: "Login successfull",
            payload: payRoad,
            token: token
        })
    } catch (error) {
        console.error("Register Error:", error)
        res.status(500).json({ message: "Server error", error: error.message })
    }
}

exports.currentUser = async (req, res) => {
    try {
        const query = "SELECT id,name,email,role FROM user WHERE email = ?"
        const [rows] = await db.promise().query(query, [req.user.email])


        res.status(200).json({
            user: rows[0]
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Server Error"
        })
    }
}

exports.currentAdmin = async (req, res) => {
    try {
        const query = "SELECT id,name,email,role FROM user WHERE email = ?"
        const [rows] = await db.promise().query(query, [req.user.email])


        res.status(200).json({
            user: rows[0]
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Server Error"
        })
    }
}