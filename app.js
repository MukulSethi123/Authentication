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
// const bcrypt = require("bcrypt");
// const saltRounds = 10;


/****************COOKIES AND AUTHENTICATION WITH PASSPORT************************************** *****/
const session = require('express-session'); // STEP:- NUMBER 1
const passport = require('passport'); //STEP 2
const passportLocalMongoose = require('passport-local-mongoose'); //STEP 3

const app = express();

mongoose.connect("mongodb://localhost:27017/userDB", { useNewUrlParser: true });
mongoose.set("useCreateIndex", true);

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

//this should be below all the other app.use()
app.use(session({
    secret: "Our little secret.",
    resave: false,
    saveUninitialized: false
}));
//once we set up our session we can only use passport 
//initialize passport
app.use(passport.initialize());
app.use(passport.session());

const UserSchema = new mongoose.Schema({
    username: String,
    password: String
});
//last package setup pasport local mogoose
UserSchema.plugin(passportLocalMongoose);

// UserSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ["password"] });

const User = mongoose.model("user", UserSchema);
//add serialize below the model 
// this serialize and deserialize is only necessary when using sessions
//serialize create a cookie and stores values within it 
// deserialize will destroy the cookie

// CHANGE: USE "createStrategy" INSTEAD OF "authenticate"
passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});

app.get("/", function(req, res) {
    res.render("home");
});

app.route("/login").get(function(req, res) {
        res.render("login");
    })
    .post(function(req, res) {
        const user = new User({
                username: req.body.username,
                password: req.body.password
            })
            //once the user is created we user passport to authenticate the user
        req.login(user, function(err) {
            if (err) {
                console.log(err)
            } else {
                passport.authenticate("local")(req, res, function() {
                    res.redirect("/secrets");
                });
            }
        })
    });

app.get("/logout", function(req, res) {
    req.logOut();
    res.redirect("/");
})


app.get("/secrets", function(req, res) {
    // inside this we will check if the user is authenticated or not
    // we make sure that if the user is already logged-in then we will render the secrets page 
    // if the user is not already logged in then well will redirect him to the login page
    if (req.isAuthenticated()) {
        res.render("secrets");
    } else {
        res.redirect("/login");
    }
});
app.route("/register").get(function(req, res) {
        res.render("register");
    })
    .post(function(req, res) {
        User.register({ username: req.body.username }, req.body.password, function(err, user) {
            if (err) {
                console.log(err);
                res.redirect("/register");
            } else {
                // this will create a logged in session for our user 
                // bcz of which we will need to create a new route for our secrets page
                // by doing this once our user logs in we he will derectly be able to use the serets page
                passport.authenticate("local")(req, res, function() {
                    res.redirect("/secrets");
                })
            }
        })
    });

app.listen("3000", function() {
    console.log("server started on port 3000");
});