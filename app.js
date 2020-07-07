//jshint esversion
require('dotenv').config();
const express = require("express")
const bodyParser = require("body-parser");
const ejs = require("ejs");
const { static } = require("express");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");


const app = express();

mongoose.connect("mongodb://localhost:27017/userDB", { useNewUrlParser: true });

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const UserSchema = new mongoose.Schema({
    username: String,
    password: String
});

UserSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ["password"] });

const User = mongoose.model("user", UserSchema);

app.get("/", function(req, res) {
    res.render("home");
});

app.route("/login").get(function(req, res) {
        res.render("login");
    })
    .post(function(req, res) {
        const username = req.body.username;
        const password = req.body.password;
        User.findOne({ username: username }, function(err, user) {
            if (!err) {
                if (user.password === password) {
                    // res.send("authentication successfull");
                    res.render("secrets");
                } else {
                    res.send("invalid passoword")
                }
            } else {
                res.send("invalid username");
            }
        })

    });

app.route("/register").get(function(req, res) {

        res.render("register");
    })
    .post(function(req, res) {
        const newUser = new User({
            username: req.body.username,
            password: req.body.password
        });
        newUser.save(function(err) {
            if (!err) {
                console.log("saved successfully");
                res.render("secrets");
            } else
                console.log(err)
        });
    });

app.listen("3000", function() {
    console.log("server started on port 3000");
});