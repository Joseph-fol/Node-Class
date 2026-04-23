const express = require('express')
const ejs = require('ejs')
const app = express()
const cors = require('cors')
const dotenv = require("dotenv")
const userRoute = require('./routes/user.route')
const mongoose = require("mongoose")
// const user = []

app.set("view engine", 'ejs')
app.use(cors())

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

dotenv.config()

const port = process.env.PORT
const URI = process.env.MONGO_URI

const dns = require('node:dns');
// This forces Node.js to use Google's DNS servers instead of local one
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '8.8.4.4']);

mongoose.connect(URI)
    .then(() => {
        console.log("Connected to MongoDB");
    })
    .catch((err) => {
        console.log("Error connecting to DB", err);
    })

app.use('/user', userRoute)

app.listen(port, () => {
    console.log("Server is running at " + port);
})