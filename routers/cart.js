const express = require("express")
const router = express.Router()
const { getCart, addtoCart } = require("../contollers/cart")
const { auth } = require("../middleware/auth")

router.get("/cart/", auth, getCart)
router.post("/cart", auth, addtoCart)

module.exports = router