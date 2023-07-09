if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require("helmet");
const MongoStore = require('connect-mongo');

const User = require('./models/user');
const campgroundsRoutes = require('./routers/campgrounds');
const reviewsRoutes = require('./routers/reviews');
const userRoutes = require('./routers/user');

const app = express();
const port = process.env.PORT || 3000;
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/YelpCamp';
const secret = process.env.SECRET || 'thishouldbeabettersecret!';

/* ------Mongoose Setting----- */

// Connection
mongoose.connect(dbUrl)
    .then(() => {
        console.log('Database Connected! ');
    })
    .catch(err => console.log(err.message));

// Session
const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,   // time period in seconds to update the session, but will always update if change happens
    crypto: { secret }
});

store.on("error", function (err) {
    console.log("SESSION STORE ERROR:", err.message);
})


/* ----------express setting--------- */
app.engine('ejs', ejsMate);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(mongoSanitize());
app.use(helmet());


const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
//This is the array that needs added to
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            'img-src': [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dbcxqmkq0/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);


const sessionConfig = {
    store,
    name: 'session',    // can change the default name to hide the session
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,     // cookie can only be accessed through http
        // secure: true,       // cookie can only work over https
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.listen(port, () => {
    console.log(`Serving on port ${port}`);
})


// flash
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

// logger
app.use((req, res, next) => {
    console.log(req.method, req.path);
    next();
})


/* -------------------------express routing-------------------------- */

// Home Page
app.get('/', (req, res) => {
    res.render('home', { title: "Home" });
})

// YelpCamp Register Routing
app.use('/', userRoutes);

// campgrounds routing
app.use('/campgrounds', campgroundsRoutes);

// campgrounds reviews routing
app.use('/campgrounds/:id/review', reviewsRoutes);


// Handle Unexpected Error
app.use((err, req, res, next) => {
    const { status = 500, message = "Something went wrong!" } = err;
    res.status(500);
    res.render('alert', {
        title: "Unexpected Error",
        info: message,
        backTo: "/campgrounds"
    });
})

// 404 Not Found
app.all('*', (req, res) => {
    res.status(404);
    res.render('notFound', { title: "Not Found" });
})

