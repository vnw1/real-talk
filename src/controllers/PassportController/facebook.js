import passport from "passport";
import passportFacebook from "passport-facebook";
import userModel from "./../../models/userModel"
import {transErrors, transSuccess} from "./../../../lang/vi"

let facebookStrategy = passportFacebook.Strategy;

let fbAppId = process.env.FB_APP_ID;
let fbAppSecret = process.env.FB_APP_SECRET;
let fbAppCallbackUrl = process.env.FB_CALLBACK_URL;


/**
 *  Valid user amount type: facebook
 */
let initPassportFacebook = () => {
    passport.use(new facebookStrategy({
        clientID: fbAppId,
        clientSecret: fbAppSecret,
        callbackURL: fbAppCallbackUrl,
        passReqToCallback: true,
        profileFields: ["email", "gender", "displayName"]
    }, async (req, accessToken, refreshToken, profile, done) => {
        try {
            let user = await userModel.findByFacebookUid(profile.id);
            if (user){
                return done(null, user, req.flash("success", transSuccess.loginSuccess(user.username)));
            }
            let newUserItem = {
                username: profile.displayName,
                gender: profile.gender,
                local: {isActive: true},
                facebook: {
                    uid: profile.id,
                    token: accessToken,
                    email: profile.emails[0].value
                }
            };

            let newUser = await userModel.createNew(newUserItem);
            return done(null, newUser, req.flash("success", transSuccess.loginSuccess(newUser.username)));
            
        } catch (error) {
            console.log(error);
            return done(null, false, req.flash("errors", transErrors.server_error));
        }
    }));

    // Save user id to session
    passport.serializeUser((user, done) => {
        done(null, user._id);
    });

    passport.deserializeUser((id, done) => {
        userModel.findUserByIdForSessionToUse(id)
        .then(user => {
            return done(null, user);
        })
        .catch(error => {
            return done(error, null);
        });
    });
};

module.exports = initPassportFacebook;