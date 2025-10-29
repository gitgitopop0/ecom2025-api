const db = require("../db")
const bcrypt = require("bcrypt")

exports.get = async (req, res) => {
    try {
        const query = "SELECT id, name, email, role FROM user"
        const [rows] = await db.promise().query(query)
        res.status(200).json({
            message: "users fetched seccessfully",
            users: rows
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Server error"
        })
    }
}

exports.getByid = async (req, res) => {
    try {
        const { id } = req.params
        const query = "SELECT id, name, email, role FROM user WHERE id = ?"
        const [rows] = await db.promise().query(query, [id])

        if (rows.length === 0) {
            return res.status(404).json({
                message: "User not found"
            })
        }

        res.status(200).json({
            user: rows[0]
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Server error"
        })
    }
}

exports.updateProfile = async (req, res) => {
    try {
        const { id } = req.params
        const { name, email, password, currentpassword, confirmpassword } = req.body

        if (!name || !email) {
            return res.status(400).json({
                message: "name and email are required"
            })
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                message: "Invalid email format"
            })
        }

        const [existing] = await db.promise().query("SELECT id FROM user WHERE email = ? AND id != ?",
            [email, id]
        )

        if (existing.length > 0) {
            return res.status(400).json({
                message: "Email already in use"
            })
        }

        const [userRows] = await db.promise().query("SELECT password FROM user WHERE id = ?", [id])
        if (userRows.length === 0) {
            return res.status(404).json({
                message: "User not found"
            })
        }
        const user = userRows[0]

        let hashedPassword = null
        if (password || currentpassword) {
            if (!currentpassword) {
                return res.status(400).json({
                    message: "currentpassword is required to change password"
                })
            }

            const isMatch = await bcrypt.compare(currentpassword, user.password)
            if (!isMatch) {
                return res.status(400).json({
                    message: "currentpassword is incorrect"
                })
            }

            if (password !== confirmpassword) {
                return res.status(400).json({
                    message: "password and confirmpassword do not match"
                })
            }

            const salt = await bcrypt.genSalt(10)
            hashedPassword = await bcrypt.hash(password, salt)
        }

        const query = `UPDATE user SET name = ?, email = ? ${hashedPassword ? ",password = ?" : ""} WHERE id = ?`
        const values = hashedPassword ? [
            name,
            email,
            hashedPassword,
            id
        ] : [
            name,
            email,
            id
        ]

        const [result] = await db.promise().query(query, values)

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "User not found"
            })
        }

        res.status(200).json({
            message: "User Updated seccessfully",
            user: { id, name, email }
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Server error"
        })
    }
}

exports.remove = async (req, res) => {
    try {
        const { id } = req.params
        const query = "DELETE FROM user WHERE id = ?"
        const [result] = await db.promise().query(query, [id])
        if (result.affectedRows === 0) {
            return res.status(400).json({
                message: "User not found"
            })
        }

        res.status(200).json({
            message: "User deleted successfully",
            userId: id
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Server error"
        })
    }
}