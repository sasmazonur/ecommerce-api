const router = require("express").Router();
const User = require("../models/User")
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");


// REGISTER
// it takes couple ms to save the user on the database
// so we use async function
router.post("/register", async (req, res) => {
    const newUser = new User({
        username: req.body.username,
        email: req.body.email,
        password: CryptoJS.AES.encrypt(req.body.password, process.env.PASS_SECRET).toString(),
    });

    try{
        const savedUser = await newUser.save();
        res.status(201).json(savedUser);
    }
    catch(err){
        res.status(500).json(err);
    }
})

// LOGIN

router.post('/login', async (req, res) => {
    try{
        const user = await User.findOne(
            {
                username: req.body.username
            }
        );

        if (!user) {
            res.status(404).json("User not found");
            return;
          }

        const hashedPassword = CryptoJS.AES.decrypt(
            user.password,
            process.env.PASS_SECRET
        );

        const originalPassword = hashedPassword.toString(CryptoJS.enc.Utf8);

        if (originalPassword != req.body.password) {
            res.status(401).json("Wrong Password");
            return;
          }        
        
        const accessToken = jwt.sign(
        {
            id: user._id,
            isAdmin: user.isAdmin,
        },
        process.env.JWT_SECRET,
            {expiresIn:"3d"}
        );

        const { password, ...others } = user._doc;  

        res.status(200).json({...others, accessToken});

    }
    catch(err){
        res.status(500).json(err);
    }

});

module.exports = router;