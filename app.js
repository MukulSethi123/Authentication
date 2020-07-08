//jshint esversion
require('dotenv').config();
const express = require("express")
const bodyParser = require("body-parser");
const ejs = require("ejs");
const { static } = require("express");
const mongoose = require("mongoose");
/****************************ENCRYPTION PACKAGES***************************************** */
// const encrypt = require("mongoose-encryption");
// const md5 = require("md5");
const bcrypt = require("bcrypt");
const saltRounds = 10;

const app = express();

mongoose.connect("mongodb://localhost:27017/userDB", { useNewUrlParser: true });

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const UserSchema = new mongoose.Schema({
    username: String,
    password: String
});

// UserSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ["password"] });

const User = mongoose.model("user", UserSchema);

app.get("/", function(req, res) {
    res.render("home");
});

app.route("/login").get(function(req, res) {
        res.render("login");
    })
    .post(function(req, res) {
        const username = req.body.username;
        //md5() - a hash function
        // const password = md5(req.body.password);
        User.findOne({ username: username }, function(err, user) {
            if (!err) {
                bcrypt.compare(req.body.password, user.password, function(err, result) {
                    // result == true
                    if (result === true) {
                        // res.send("authentication successfull");
                        res.render("secrets");
                    } else {
                        res.send("invalid passoword")
                    }
                });

            } else {
                res.send("invalid username");
            }
        })

    });

app.route("/register").get(function(req, res) {

        res.render("register");
    })
    .post(function(req, res) {
        bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
            // Store hash in your password DB.
            const newUser = new User({
                username: req.body.username,
                // password: md5(req.body.password)
                password: hash
            });
            newUser.save(function(err) {
                if (!err) {
                    console.log("saved successfully");
                    res.render("secrets");
                } else
                    console.log(err)
            });
        });

    });

app.listen("3000", function() {
    console.log("server started on port 3000");
});