const jwt = require("jsonwebtoken")

exports.auth = (req, res, next) => {
    try {
        const authHeader = req.headers["authorization"]

        if (!authHeader) {
            return res.status(401).json({
                message: "No token"
            })
        }

        const token = authHeader.split(' ')[1]
        if (!token) {
            return res.status(401).json({
                message: "No token"
            })
        }

        const verified = jwt.verify(
            token, process.env.JWT_SECRET
        )

        req.user = verified

        next()
    } catch (error) {
        console.error("JWT Error:", error.message)
        res.status(401).json({ message: "Invalid or malformed token" })
    }
}

exports.admin = (req, res, next) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(401).json({
                message: "access denied user only"
            })
        }

        next()
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Server Error"
        })
    }
}