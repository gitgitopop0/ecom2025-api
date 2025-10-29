const express = require("express")
const router = express()
const { getOrder, createOrder, getOrderbyid, updateOrder, removeOrder } = require("../contollers/order")
const { auth, admin } = require("../middleware/auth")

router.get("/order", auth, getOrder)
router.get("/order/:id", auth, getOrderbyid)
router.post("/order", auth, createOrder)
router.put("/order/:id", auth, updateOrder)
router.delete("/order/:id", auth, removeOrder)

module.exports = router