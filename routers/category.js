const express = require("express")
const router = express.Router()
const { get, getByid, create, remove } = require("../contollers/category")
const { auth, admin } = require("../middleware/auth")

router.get("/category", get)
router.get("/category/:id", getByid)
router.post("/category", auth, admin, create)
router.delete("/category/:id", auth, admin, remove)


module.exports = router