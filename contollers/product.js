const db = require("../db")


exports.get = async (req, res) => {
    try {
        const query = "SELECT * FROM products"
        const [rows] = await db.promise().query(query)

        const products = rows.map(row => ({
            ...row,
            image: row.image || []
        }))

        res.status(200).json({
            message: "products fetched successfully",
            products
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Server error"
        })
    }
}

exports.getProductById = async (req, res) => {
    try {
        const { id } = req.params
        const query = "SELECT * FROM products WHERE id = ?"
        const [rows] = await db.promise().query(query, [id])

        if (rows.length === 0) {
            return res.status(404).json({ message: "Product not found" })
        }

        const products = rows.map(row => ({
            ...row,
            image: row.image || []
        }))

        res.status(200).json({ products })
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Server error" })
    }
}

exports.getProductsLimit = async (req, res) => {
    try {
        const { limit } = req.params
        let query
        let params = []

        if (limit) {
            query = "SELECT * FROM products LIMIT ?"
            params = [parseInt(limit)]
        } else {
            return res.status(400).json({
                message: "Limit query parameter is required"
            })
        }

        if (isNaN(params[0]) || params[0] <= 0) {
            return res.status(400).json({
                message: "Invalid limit value"
            })
        }


        const [rows] = await db.promise().query(query, params)

        const products = rows.map(row => ({
            ...row,
            image: row.image || []
        }))

        if (rows.length === 0) {
            return res.status(404).json({
                message: "No products found"
            })
        }

        res.status(200).json({
            count: rows.length,
            products
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({
            message: "Server error"
        })
    }
}

exports.post = async (req, res) => {
    try {
        const { name, description, price, category_id, stock = 0 } = req.body
        const image = req.files ? req.files.map(file => file.filename) : []

        if (!name || !price || !category_id) {
            return res.status(400).json({
                message: "name, price and category_id are required"
            })
        }

        if (isNaN(price) || price <= 0) {
            return res.status(400).json({
                message: "Invalid price"
            })
        }

        const [cats] = await db.promise().query("SELECT * FROM categories WHERE id = ?", [category_id])

        if (cats.length === 0) {
            return res.status(400).json({
                message: "Invalid category"
            })
        }

        const query = "INSERT INTO products (name,description,price,stock,image,category_id) VALUES (?, ?, ?, ?, ?, ?)"
        const [result] = await db.promise().query(query, [name, description, price, stock, JSON.stringify(image), category_id])

        res.status(201).json({
            message: "Product added successfully",
            productsId: result.insertId,
            products: { name, price, stock, image, description, category_id }
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Server error"
        })
    }
}

exports.update = async (req, res) => {
    try {
        const { id } = req.params
        const { name, description, price, category_id, stock, oldImages, sales } = req.body

        if (!name || !price || !category_id) {
            return res.status(400).json({
                message: "name, price and category_id are required"
            })
        }

        if (isNaN(price) || price <= 0) {
            return res.status(400).json({
                message: "Invalid price"
            })
        }

        const [cats] = await db.promise().query("SELECT * FROM categories WHERE id = ?", [category_id])
        if (cats.length === 0) {
            return res.status(400).json({
                message: "Invalid category"
            })
        }

        const newImages = req.files ? req.files.map(file => file.filename) : []

        const allImages = [...(Array.isArray(oldImages) ? oldImages : [oldImages]), ...newImages]

        const query = "UPDATE products SET name = ?, description = ?, price = ?, stock = ?, image = ?, category_id = ?, sales = ? WHERE id = ?"
        const [result] = await db.promise().query(query, [name, description, price, stock, JSON.stringify(allImages), category_id, sales || 0, id])

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Product not found"
            })
        }

        res.status(200).json({
            message: "Product Updated seccessfully",
            products: { id, name, description, price, stock, image: allImages, category_id }
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
        const query = "DELETE FROM products WHERE id = ?"
        const [result] = await db.promise().query(query, [id])

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Product not found"
            })
        }

        res.status(200).json({
            message: "Product deleted successfully",
            productsId: id
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Server error"
        })
    }
}

exports.search = async (req, res) => {
    try {
        const { query, category_id, price } = req.body
        let sql = "SELECT * FROM products WHERE 1=1"
        const params = []

        if (query) {
            sql += " AND name LIKE ?"
            params.push(`%${query}%`)
        }

        if (category_id && category_id.length > 0) {
            const placeholders = category_id.map(() => '?').join(',')
            sql += ` AND category_id IN (${placeholders})`
            params.push(...category_id)
        }

        if (price && price.length === 2) {
            sql += " AND price BETWEEN ? AND ?"
            params.push(price[0], price[1])
        }

        const [products] = await db.promise().query(sql, params)
        res.json({ products })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Search error" })
    }
}
