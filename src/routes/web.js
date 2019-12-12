import express from "express";
import {home, auth, user, contact} from "./../controllers/index";
import {authValid, userValid, contactValid} from "./../validation/index";
import passport from "passport";
import initPassportLocal from "./../controllers/PassportController/local";
import initPassportFacebook from "./../controllers/PassportController/facebook";
import initPassportGG from "./../controllers/PassportController/google";


// Init all passport
initPassportLocal();
initPassportFacebook();
initPassportGG();

let router = express.Router();

/**
 * Init routes
 * @param app from express 
 */
let initRoutes = (app) => {
    router.get("/login-register", auth.checkLoggedOut, auth.getLoginRegister);
    router.post("/register", auth.checkLoggedOut, authValid.register, auth.postRegister);
    router.get("/verify/:token", auth.checkLoggedOut, auth.verifyAccount);

    router.post("/login", auth.checkLoggedOut, passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "/login-register",
        successFlash: true,
        failureFlash: true
    }));

    router.get("/auth/facebook", auth.checkLoggedOut, passport.authenticate("facebook", {scope: ["email"]}));
    router.get("/auth/facebook/callback", auth.checkLoggedOut, passport.authenticate("facebook", {
        successRedirect: "/",
        failureRedirect: "/login-register"
    }));
    router.get("/auth/google", auth.checkLoggedOut, passport.authenticate("google", {scope: ["email"]}));
    router.get("/auth/google/callback", auth.checkLoggedOut, passport.authenticate("google", {
        successRedirect: "/",
        failureRedirect: "/login-register"
    }));

    router.get("/", auth.checkLoggedIn, home.getHome);
    router.get("/logout", auth.checkLoggedIn, auth.getLogout);
    router.put("/user/update-avatar", auth.checkLoggedIn, user.updateAvatar);
    router.put("/user/update-info", auth.checkLoggedIn, userValid.updateInfo, user.updateInfo);
    router.put("/user/update-password", auth.checkLoggedIn, userValid.updatePassword, user.updatePassword);
    router.get("/contact/find-users/:keyword", auth.checkLoggedIn, contactValid.findUsersContact, contact.findUsersContact);
    
    return app.use("/", router);
};

module.exports = initRoutes;