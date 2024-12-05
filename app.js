//Require Modules
const express = require('express');
const morgan = require('morgan');
const methodOverride = require('method-override');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');


const itemRoutes = require('./routes/itemRoutes');
const userRoutes = require('./routes/userRoutes');
const offerRoutes = require('./routes/offerRoutes');



//Create app
const app = express();

//Configure app
let port = 3000;
let host = 'localhost';
let url = 'mongodb+srv://proj123:project3access@cluster0.acjbkam.mongodb.net/project3?retryWrites=true&w=majority'
app.set('view engine', 'ejs');

//Connect to MongoDB
mongoose.connect(url)
.then(()=>{
    //Start server
    app.listen(port, host, ()=>{
    console.log('Server is running on port: ', port);
});
})
.catch(err=>console.log(err.message));

//Mount Middleware
app.use(morgan('tiny'));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static('public'));
app.use(methodOverride('_method'));

//Session
app.use(session({
    secret: 'adsfasdf33423adfassdaf4df4ghyj',
    resave: false,
    saveUninitialized: false,
    cookie: {maxAge: 60*60*1000},
    store: new MongoStore({mongoUrl: url})
}));

//Flash messages
app.use(flash());

app.use((req, res, next)=>{
    console.log(req.session);
    res.locals.user = req.session.user||null;
    res.locals.successMessages = req.flash('success');
    res.locals.errorMessages = req.flash('error');
    next();
});

//Routes
app.get('/', (req, res)=>{
    res.render('index');
});

app.use('/users', userRoutes);

app.use('/items', itemRoutes);

app.use('/items/:id', offerRoutes);

//app.use('/', offerRoutes);


//Error handling
app.use((req, res, next)=>{
    let err = new Error('The server cannot locate ' + req.url);
    err.status = 404;
    next(err);
});

app.use((err, req, res, next)=>{
    console.log(err.stack);
    if(!err.status){
        err.status = 500;
        err.message = ("Internal Server Error");
    }

    res.status(err.status);
    res.render('error', {error: err});
});

