const db = require("../db")

exports.get = async (req, res) => {
    try {
        const query = "SELECT * FROM categories"
        const [rows] = await db.promise().query(query)
        res.status(200).json({
            message: "category fetched successfully",
            category: rows
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
        const query = "SELECT * FROM categories WHERE id = ?"
        const [rows] = await db.promise().query(query, [id])
        if (rows.length === 0) {
            return res.status(404).json({
                message: "category not found"
            })
        }

        res.status(200).json({
            category: rows[0]
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Server error"
        })
    }
}

exports.create = async (req, res) => {
    try {
        const { name, description } = req.body
        const query = "INSERT INTO categories (name,description) VALUES (?, ?)"
        const [result] = await db.promise().query(query, [name, description])

        res.status(201).json({
            message: "category added successfully",
            categoryId: result.insertId,
            category: { name, description }
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
        const {id} = req.params
        const query = "DELETE FROM categories WHERE id = ?"
        const [result] = await db.promise().query(query, [id])
        if(result.affectedRows===0){
            return res.status(404).json({
                message: "category not found"
            })
        }
        res.status(200).json({
            message: "category deleted successfully",
            categoryId: id
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Server error"
        })
    }
}