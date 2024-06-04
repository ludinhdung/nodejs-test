const express = require("express")
const dotenv = require("dotenv")
const mongoose = require("mongoose")
const morgan = require("morgan")

const bookRouter = require("./bookRouter")
const genreRouter = require("./genreRouter")

dotenv.config()

const app = express()
app.use(express.json())
app.use(morgan("dev"))

const PORT = process.env.PORT || 8080

app.use("/books", bookRouter)
app.use("/genres", genreRouter)

mongoose.connect(process.env.MONGO_URL)
    .then(() => {
        console.log("Connect database ")
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`)
        })
    })


