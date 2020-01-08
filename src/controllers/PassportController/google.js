import passport from "passport";
import passportGG from "passport-google-oauth";
import userModel from "./../../models/userModel"
import {transErrors, transSuccess} from "./../../../lang/vi"

let ggStrategy = passportGG.OAuth2Strategy;

let ggAppId = process.env.GG_APP_ID;
let ggAppSecret = process.env.GG_APP_SECRET;
let ggAppCallbackUrl = process.env.GG_CALLBACK_URL;


/**
 *  Valid user amount type: Google
 */
let initPassportGG = () => {
    passport.use(new ggStrategy({
        clientID: ggAppId,
        clientSecret: ggAppSecret,
        callbackURL: ggAppCallbackUrl,
        passReqToCallback: true
    }, async (req, accessToken, refreshToken, profile, done) => {
        try {
            let user = await userModel.findByGoogleUid(profile.id);
            if (user){
                return done(null, user, req.flash("success", transSuccess.loginSuccess(user.username)));
            }
            let newUserItem = {
                username: profile.displayName,
                gender: profile.gender,
                local: {isActive: true},
                google: {
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

module.exports = initPassportGG;