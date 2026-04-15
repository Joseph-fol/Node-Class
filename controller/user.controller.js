const Customer = require("../models/user.model")
const bcrypt = require("bcryptjs")
const nodemailer = require("nodemailer")

const getSignUp = (req, res) => {
    res.render('signup')
}

const getSignin = (req, res) => {
    const signupSuccess = req.query.signup === "success"
    const errorMessage = req.query.error === "invalid" ? "Invalid email or password" : null
    res.render("signin", { signupSuccess, errorMessage })
}

const getDashboard = (req, res) => {
    const signinSuccess = req.query.signin === "success"
    res.render("dashboard", { signinSuccess })
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

    const newCustomer = new Customer(userDetail)
    newCustomer.save()
        .then(() => {
            console.log('Customer saved', userDetail);

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
                        <div style="background-color: #f4f4f4; padding: 0 0 10px; border-radius: 30px 30px 0 0  ;">
                            <div style="padding-top: 20px; height: 100px; border-radius: 30px 30px 0 0 ; background: linear-gradient(-45deg, #f89b29 0%, #ff0f7b 100% );">
                                <h1 style="color:white; text-align: center;">Welcome to our Application</h1>
                            </div>

                            <div style="padding: 30px 0; text-align: center;">
                                <p style="font-size: 18px;"><span style="font-weight: 600;">Congratulations!</span> Your sign-up was successful!</p>

                                <p style= "line-height: 25px;">Welcome to <a href="#">FinTek</a>, one of the fastest growing online quiz/cbt platform in Nigeria. By joining us you have taken the first step toward unlocking your full experience in taking online quiz <br>
                                
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
                    console.log(err);
                }
                else {
                    console.log("Email sent: " + info.response);
                }
                return res.redirect('/user/signin?signup=success')
            })
        })
        .catch((err) => {
            console.error("Error saving to DB", err);
            return res.status(500).send("Error: " + err.message)
        })
}

const postSignin = (req, res) => {
    // Destructuring
    const { email, password } = req.body;
    Customer.findOne({ email })
        .then((foundCustomer) => {
            if (!foundCustomer) {
                console.log("Invalid email");
                return res.redirect('/user/signin?error=invalid')
            }

            const isMatch = bcrypt.compareSync(password, foundCustomer.password)
            if (!isMatch) {
                console.log("Invalid password");
                return res.redirect('/user/signin?error=invalid')
            }

            console.log("Login Successful for", foundCustomer.email);
            return res.redirect('/user/dashboard?signin=success')
            // return res.redirect("/user/dashboard")
        })
        .catch((err) => {
            console.error("Error during signin", err);
            return res.status(500).send("Internal server error")

        })
}

module.exports = { postSignUp, getSignUp, postSignin, getSignin, getDashboard }