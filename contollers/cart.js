const db = require("../db")

exports.getCart = async (req, res) => {
    try {
        const user_id = req.user.id
        const [items] = await db.promise().query(
            `SELECT
                c.id AS cart_id,
                p.id AS product_id,
                p.name,
                p.description,
                p.price,
                p.image,
                ci.quantity,
                (p.price * ci.quantity) AS total
            FROM carts c
            JOIN carts_item ci ON ci.cart_id = c.id
            JOIN products p ON ci.products_id = p.id
            WHERE c.user_id = ?`,
            [user_id]
        )

        const total_price = items.reduce((sum, item) => sum + Number(item.total), 0)

        res.status(200).json({
            message: "Cart fetched successfully",
            cart: items,
            total: total_price
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server error" })
    }
}


exports.addtoCart = async (req, res) => {
    try {
        const { user_id, products_id, quantity } = req.body

        if (!user_id || !products_id || !quantity) {
            return res.status(400).json({ message: "user_id, products_id, and quantity are required" })
        }

        const [productRows] = await db.promise().query(
            "SELECT stock, name FROM products WHERE id = ?",
            [products_id]
        )

        if (productRows.length === 0) {
            return res.status(404).json({ message: "Product not found" })
        }

        const product = productRows[0]
        if (product.stock <= 0) {
            return res.status(400).json({ message: `สินค้า ${product.name} หมดสต็อก ไม่สามารถเพิ่มลงตะกร้าได้` })
        }

        const [existingCart] = await db.promise().query(
            "SELECT id FROM carts WHERE user_id = ?",
            [user_id]
        )

        let cartId
        if (existingCart.length > 0) {
            cartId = existingCart[0].id
        } else {
            const [result] = await db.promise().query(
                "INSERT INTO carts (user_id) VALUES (?)",
                [user_id]
            )
            cartId = result.insertId
        }

        const [existingItem] = await db.promise().query(
            "SELECT id, quantity FROM carts_item WHERE cart_id = ? AND products_id = ?",
            [cartId, products_id]
        );

        if (existingItem.length > 0) {
            if (quantity > product.stock) {
                return res.status(400).json({ message: `สินค้า ${product.name} มีไม่เพียงพอในสต็อก` })
            }

            await db.promise().query(
                "UPDATE carts_item SET quantity = ? WHERE id = ?",
                [quantity, existingItem[0].id]
            )
        } else {
            if (quantity > product.stock) {
                return res.status(400).json({ message: `สินค้า ${product.name} มีไม่เพียงพอในสต็อก` })
            }

            await db.promise().query(
                "INSERT INTO carts_item (cart_id, products_id, quantity) VALUES (?, ?, ?)",
                [cartId, products_id, quantity]
            )
        }

        res.status(200).json({ message: "Product added to cart successfully" })

    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Server error" })
    }
}