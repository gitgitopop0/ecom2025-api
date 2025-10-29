const express = require("express")
const router = express.Router()
const { register, login, currentUser, currentAdmin } = require("../contollers/auth")
const { auth, admin } = require("../middleware/auth")

router.post("/register", register)
router.post("/login", login)
router.post("/current-user", auth, currentUser)
router.post("/current-admin", auth, admin, currentAdmin)

module.exports = router