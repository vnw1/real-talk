import express from "express";
import ConnectDB from "./config/connectDB";
import configViewEngine from "./config/viewEngine";
import initRoutes from "./routes/web";
import bodyParser from "body-parser";
import connectFlash from "connect-flash";
import configSession from "./config/session";

// Init app
let app = express();

// Connect to MongoDB
ConnectDB();

// Config session
configSession(app);

// Config view engine
configViewEngine(app);

// Enable post data for request
app.use(bodyParser.urlencoded({extended: true}));

// Enable flash message
app.use(connectFlash());

// Init routes
initRoutes(app);

app.listen(process.env.APP_PORT, process.env.APP_HOST, () => {
    console.log(`hello ban ${process.env.APP_HOST}`);
})