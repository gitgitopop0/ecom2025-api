const db = require("../db")

exports.getOrder = async (req, res) => {
    try {
        const id = req.user.id

        const query = "SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC"
        const [result] = await db.promise().query(query, [id])

        if (result.length === 0) {
            return res.json({ orders: [] })
        }

        const orderIds = result.map(order => order.id)

        const [items] = await db.promise().query(
            `SELECT 
                oi.*,
                p.name AS name,
                p.image
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id IN (?)
            `,
            [orderIds]
        )

        const itemMap = {}
        for (const item of items) {
            if (!itemMap[item.order_id]) {
                itemMap[item.order_id] = []
            }
            itemMap[item.order_id].push(item)
        }

        const ordersWithItems = result.map(order => ({
            ...order,
            items: itemMap[order.id] || []
        }))

        res.status(200).json({
            orders: ordersWithItems
        })
    } catch (error) {
        console.log("Server error", error)
        res.status(500).json({ message: "Server error" })
    }
}

exports.getOrderbyid = async (req, res) => {
    try {
        const { id } = req.params
        const [orders] = await db.promise().query(
            "SELECT * FROM orders WHERE id = ?", [id]
        )

        if (orders.length === 0) {
            return res.status(404).json({ message: "Order ont found" })
        }

        const order = orders[0]

        const [items] = await db.promise().query(
            `SELECT
                oi.*,
                p.name,
                p.image
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id = ?
            `, [id]
        )

        order.items = items

        res.status(200).json({ order })
    } catch (error) {
        console.log("Server error", error)
        res.status(500).json({ message: "Server error" })
    }
}

exports.createOrder = async (req, res) => {
    try {
        const id = req.user.id
        const { items } = req.body

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: "Items are required" })
        }

        const productIds = items.map(item => item.product_id)
        const [products] = await db.promise().query(
            `SELECT id, price, stock FROM products WHERE id IN (?)`,
            [productIds]
        )

        let total_price = 0
        const orderItemsValues = []

        for (const item of items) {
            const product = products.find(p => p.id === item.product_id)
            if (!product) return res.status(400).json({ message: `Product ${item.product_id} not found` })

            const qty = Number(item.quantity)
            if (isNaN(qty) || qty <= 0) return res.status(400).json({ message: `Invalid quantity for product ${item.product_id}` })

            if (product.stock < qty) return res.status(400).json({ message: `Not enough stock for product ${item.product_id}` })

            total_price += product.price * qty
            orderItemsValues.push([null, item.product_id, qty, product.price])
        }

        const [orderResult] = await db.promise().query(
            "INSERT INTO orders (user_id, total_price) VALUES (?, ?)",
            [id, total_price]
        )
        const orderId = orderResult.insertId

        const finalOrderItems = orderItemsValues.map(item => [orderId, item[1], item[2], item[3]])
        await db.promise().query(
            "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ?",
            [finalOrderItems]
        )

        for (const item of items) {
            await db.promise().query(
                "UPDATE products SET stock = stock - ?, sales = sales + ? WHERE id = ?",
                [item.quantity, item.quantity, item.product_id]
            )
        }

        await db.promise().query(
            `DELETE ci 
             FROM carts_item ci
             JOIN carts c ON ci.cart_id = c.id
             WHERE c.user_id = ?`,
            [id]
        )

        res.status(201).json({ message: "Order created successfully", orderId })

    } catch (error) {
        console.log("Server error", error)
        res.status(500).json({ message: "Server error" })
    }
}


exports.updateOrder = async (req, res) => {
    try {
        const { id } = req.params
        const { status } = req.body

        const validStatuses = ['pending', 'paid', 'shipped', 'completed', 'cancelled']
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: "Invalid status value" })
        }

        const [result] = await db.promise().query(
            "UPDATE orders SET status = ? WHERE id = ?", [status, id]
        )

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Order not found" })
        }

        res.status(200).json({ message: "Order update seccessfully", orderId: id, status })
    } catch (error) {
        console.log("Server error", error)
        res.status(500).json({ message: "Server error" })
    }
}

exports.removeOrder = async (req, res) => {
    try {
        const { id } = req.params

        await db.promise().query("DELETE FROM order_items WHERE order_id = ?", [id])

        const [result] = await db.promise().query("DELETE FROM orders WHERE id = ?", [id])
        if (result.length === 0) {
            return res.status(404).json({ message: "Order not found" })
        }

        res.status(200).json({ message: "Order deleted successfully", orderId: id })
    } catch (error) {
        console.log("Server error", error)
        res.status(500).json({ message: "Server error" })
    }
}