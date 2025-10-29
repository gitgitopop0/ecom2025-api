const express = require("express")
const router = express.Router()
const { get, getByid, updateProfile, remove } = require("../contollers/user")
const { auth, admin } = require("../middleware/auth")

router.get("/user", auth, admin, get)
router.get("/user/:id", auth, admin, getByid)
router.put("/profile/:id", auth, updateProfile)
router.delete("/user/:id", auth, remove)

module.exports = router