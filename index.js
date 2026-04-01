const express = require('express')
const ejs = require('ejs')
const app = express()
const port = 2122
const cors = require('cors')
const user = []

app.set("view engine", 'ejs')
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended:true}))

app.get('/', (req, res) =>{
    res.render("signup")
})

app.get('/', (req, res) =>{
    res.render('signin')
})

app.post('/register', (req, res) =>{
    const userDetail = req.body
    user.push(userDetail)

    console.log(user);
    res.send("You have successfully registered")
})

app.listen(port, () => {
    console.log("Server is running at " + port);
})