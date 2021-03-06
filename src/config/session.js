import session from "express-session";
import connectMongo from "connect-mongo";

let mongoStore = connectMongo(session);

/**
 * Save session in mongoDB
 */
let sessionStore = new mongoStore({
    url: `${process.env.DB_CONNECTION}://${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
    autoReconnect: true,
    // autoRemove: "navtive"
});

/**
 * Config session for app
 * @param app from express
 */
let config = (app) => {
    app.use(session({
        key: process.env.SESSION_KEY,
        secret: process.env.SESSION_SECRET,
        store: sessionStore,
        resave: true,
        saveUninitialized: false,
        cookie: {
            maxAge: 1000*60*60*24 // 86400000 seconds = 1 day
        }
    }));
};

module.exports = {
    config: config,
    sessionStore: sessionStore
};