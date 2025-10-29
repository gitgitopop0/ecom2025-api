const express = require("express")
const app = express()
const cors = require("cors")
const bodyParser = require("body-parser")
const { readdirSync, existsSync, mkdirSync } = require("fs")
const morgan = require("morgan")
const path = require("path")

const uploadDir = path.join(__dirname, 'uploads')
if (!existsSync(uploadDir)) {
    mkdirSync(uploadDir, { recursive: true })
    console.log('Created uploads folder')
}

app.use(morgan("dev"))
app.use(cors({ origin: "*" }))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

readdirSync("./routers").map((item) => {
    app.use("/api", require("./routers/" + item))
})


const port = 8080
app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
})