const Customer = require("../models/user.model")
const bcrypt = require("bcryptjs")
const nodemailer = require("nodemailer")
const jwt = require("jsonwebtoken")

const JWT_Secret = process.env.jwtSecretKey
console.log("JWT_Secret loaded:", JWT_Secret ? "✓ PRESENT" : "✗ MISSING")

const getSignUp = (req, res) => {
    res.render('signup')
}

const getSignin = (req, res) => {
    const signupSuccess = req.query.signup === "success"
    const errorMessage = req.query.error === "invalid" ? "Invalid email or password" : null
    res.render("signin", { signupSuccess, errorMessage })
}

const postSignUp = (req, res) => {
    let salt = bcrypt.genSaltSync(10)
    let hashedPassword = bcrypt.hashSync(req.body.password, salt)

    // overwrite
    req.body.password = hashedPassword
    const userDetail = req.body
    // user.push(userDetail)
    // console.log(user);
    // res.send("You have successfully registered")
    Customer.findOne({ email: req.body.email })
        .then((userExist) => {
            if (userExist) {
                console.log("User already exists");
                return res.status(409).json({
                    message: "User already exists",
                    email: userExist.email
                })
            }
            else {
                const newCustomer = new Customer(userDetail)
                newCustomer.save()
                    .then(() => {
                        console.log('Customer saved', userDetail);
                        res.redirect("/user/signin?signup=success")
                        // Transporter means the information about the service you are using to send the email
                        let transporter = nodemailer.createTransport({
                            service: "gmail",
                            auth: {
                                user: "olawoyinjoseph05@gmail.com",
                                pass: "tyig bqlg ehmv hzpq",
                            }
                        })

                        // This is the information about the mail you are sending
                        let mailOptions = {
                            from: "Fintek",
                            to: [userDetail.email, "olawoyinjosephfolasakin@gmail.com"],
                            subject: "Welcome to our website",
                            html: `
                        <div style="background-color: black; padding: 0 0 10px; border-radius: 30px 30px 0 0  ;">
                            <div style="padding-top: 20px; height: 100px; border-radius: 30px 30px 0 0 ; background: linear-gradient(-45deg, #f89b29 0%, #ff0f7b 100% );">
                                <h1 style="color:white; text-align: center;">Welcome to our Application</h1>
                            </div>

                            <div style="padding: 30px ; text-align: center;">
                                <p style="font-size: 18px;"><span style="font-weight: 600;">Congratulations!</span> Your sign-up was successful!</p>

                                <p style= "line-height: 25px; padding: 30px;">Welcome to <a href="#">FinTek</a>, one of the fastest growing online quiz/cbt platform in Nigeria. By joining us you have taken the first step toward unlocking your full experience in taking online quiz <br>
                                
                                    We will like to hear from you if you have any complaint on your account
                                </p>

                                <div style="padding: 20px 0;">
                                    <hr style="width: 50%;">
                                    <p style="margin-bottom: 10px;">Best Regards</p>
                                    <p style="color: #f89b29; margin-top: 0;">Dev Joseph</p>
                                </div>
                            </div>
                        </div>
                    `
                        }

                        // This is what will send the gmail to the user
                        transporter.sendMail(mailOptions, function (error, info) {
                            if (error) {
                                console.error("Email sending failed", error.message);
                            }

                            else {
                                console.log("Email sent: " + info.response);
                            }
                        })
                    })
            }
        })
        .catch((err) => {
            console.error("Error saving to DB", err);
            return res.status(500).json({ message: "Signup failed: " + err.message })
        })
}

const postSignin = async (req, res) => {
    try {
        // Destructuring
        const { email, password } = req.body;

        // Input validation
        if (!email || !password) {
            console.log("Missing email or password");
            return res.status(400).json({ message: "Email and password are required" })
        }

        const foundCustomer = await Customer.findOne({ email })

        if (!foundCustomer) {
            console.log("Invalid email");
            return res.redirect('/user/signin?error=invalid')
        }

        const isMatch = bcrypt.compareSync(password, foundCustomer.password)

        if (!isMatch) {
            console.log("Invalid password");
            return res.redirect('/user/signin?error=invalid')
        }

        // Check if JWT_Secret is set
        // if (!JWT_Secret) {
        //     console.error("JWT_Secret not configured");
        //     return res.status(500).json({ message: "Server configuration error" })
        // }

        const token = jwt.sign({ email: foundCustomer.email }, JWT_Secret, { expiresIn: "1h" })
        console.log("Generated Token for:", foundCustomer.email);

        // For Frontend to use 
        return res.json({
            message: "Login Successful",
            user: {
                id: foundCustomer._id,
                email: foundCustomer.email,
                firstName: foundCustomer.firstName,
                lastName: foundCustomer.lastName,
                token: token
            }
        })
    } catch (err) {
        console.error("Error during signin:", err.message);
        return res.status(500).json({ message: "Internal server error" })
    }
}

const getAllUser = (req, res) => {
    Customer.find()
        .then((allUsers) => {
            console.log("All users", allUsers);
            res.status(200).json({
                message: "Registered Users",
                users: allUsers
            })
        })
        .catch((err) => {
            console.error("Error fetching user", err);
            res.status(500).send("Internal Server Error")
        })
}

const getDashboard = (req, res) => {
    const signinSuccess = req.query.signin === "success"
    res.render("dashboard", { signinSuccess })
    let token = req.headers.authorization.split(" ")[1]

    jwt.verify(token, JWT_Secret, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: "Invalid or expired token" })
        }
        else {
            console.log("Decoded token data:", decoded);
            let userEmail = decoded.email
            Customer.findOne({ email: userEmail })
                .then((user) => {
                    if (!user) {
                        return res.status(404).json({ message: "User Not Found" })
                    }
                    console.log("User Found:", user);
                    res.json({
                        message: "Dashboard accessed Successfully",
                        user: {
                            email: user.email,
                            firstName: user.firstName
                        }
                    })
                })
                .catch((err) => {
                    console.log("Error fetching user", err);
                    return res.status(500).json({ message: "Internal server error" })
                })
        }
    })

}

module.exports = { postSignUp, getSignUp, postSignin, getSignin, getDashboard, getAllUser }