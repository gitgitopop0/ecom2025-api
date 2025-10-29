const express = require("express")
const router = express.Router()
const { get, getProductsLimit, getProductById, post, update, remove, search } = require("../contollers/product")
const { auth, admin } = require("../middleware/auth")
const multer = require("multer");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

router.get("/product", get)
router.get("/product/id/:id", getProductById)
router.get("/product/:limit/", getProductsLimit)
router.post("/product", auth, admin, upload.array('image'), post)
router.put("/product/:id", auth, admin, upload.array('image'), update)
router.delete("/product/:id", auth, admin, remove)
router.post("/search/filters", search)

module.exports = router