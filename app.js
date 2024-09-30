const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');

const mongoURI = 'mongodb+srv://bitani:ciFM9Uwo13QninZp@cluster5.fnvlk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster5'
// mongoose.connect('mongodb+srv://bitani:ciFM9Uwo13QninZp@cluster5.fnvlk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster5')

mongoose.connect(mongoURI);


let db = mongoose.connection;

//Check connection
db.once('open', function () {
    console.log('Connected to MongoDB');
})

//check for DB errors
db.on('error', function (err) {
    console.log(err);
});

const app = express();

//Bring in Models
let Article = require('./models/article');
let Users = require('./models/user');

//Load View Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

//Body Parser Middleware

app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));

//Set Public folder

app.use(express.static('public'));

// Session setup
app.use(session({
    secret: 'yourSecretKey', // Change this to a secure key in production
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Set to true if using HTTPS
}));

app.get('/', async (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/login'); // Redirect if not logged in
    }
    try {
        const articles = await Article.find();
        console.log('Articles fetched:', articles); // Log the full article objects

        const formattedCheckIn = new Date(articles.CheckIn).toDateString();
        const formattedCheckOut = new Date(articles.CheckOut).toDateString();

        articles.forEach(article => {
            const formattedCheckIn = new Date(articles.CheckIn).toDateString();
            console.log(article.formattedCheckIn);
        })
    
        // Log each article's title to the console
        articles.forEach(article => {
            console.log('Customer booked:', article.FirstName);
            console.log('Customer Check In time:', new Date(article.CheckIn).toDateString());
        });
        const SessionFirstName = req.session.FirstName;
        console.log("logged in as", SessionFirstName);
        res.render('index', {
            title: SessionFirstName,
            articles: articles
        });


    } catch (err) {
        console.error('Error fetching bookings:', err);
        res.status(500).render('error', { message: 'Failed to load articles', error: err });
    }
});

app.get('/articles/add', function (req, res) {
    res.render('add', {
        title: 'Book a room'
    });
});

//Add Submit POST route

app.post('/articles/add', async (req, res) =>{

    try {
        let booking = new Article();
        booking.FirstName = req.body.FirstName;
        booking.LastName = req.body.LastName;

        //Parse the checkIn and Checkout dates
        const checkInDate = new Date(req.body.CheckIn);
        const checkOutDate = new Date(req.body.CheckOut);

        //Calculate the number of nights
        const millisecondsPerNight = 24 * 60 * 60 * 1000; // Milliseconds in a day
        const numberOfNights = Math.ceil((checkOutDate - checkInDate) / millisecondsPerNight);

        //Calculate the cost
        const costPerNight = 100;
        const totalCost = numberOfNights * costPerNight;

        //Calculate the Karma Points;
        const karmaPerNight = 12;
        const totalKarma = numberOfNights * karmaPerNight;

        booking.CheckIn = checkInDate;
        booking.CheckOut = checkOutDate;
        booking.EmailAddress = req.body.EmailAddress; // Change this line from `-` to `=`
        booking.Cost = totalCost;
        booking.kPoints = totalKarma;

        // Save the article without a callback
        await booking.save(); // No callback function here

        console.log(booking.FirstName); // Log the title for verification
        res.redirect('/'); // Redirect after successful save
    } catch (err) {
        console.error('Error saving article:', err); // Log any errors
        res.status(500).send('Error saving article'); // Send a response if there's an error
    }
});

//Get Booking details

app.get('/articles/:id', async (req, res) => {
    try {
        const article = await Article.findById(req.params.id);

        console.log(article);
        res.render('single-reservation', {
            article: article
        });
    } catch (err) {
        console.error(err);
       
    }
});

app.get('/login/', (req, res) => {
    res.render('login', {

    });
})

app.get('/signup/', (req, res) => {
    res.render('signup', {
        title: "Personal details"
    });
})

//Signup POST request

app.post('/signup', async (req, res) =>{

    try {
        let user = new Users();
        user.FirstName = req.body.FirstName;
        user.LastName = req.body.LastName;
        user.DOB = req.body.DOB;
        user.EmailAddress = req.body.EmailAddress;
        user.PhoneNumber =req.body.PhoneNumber;
        user.Password = req.body.Password;
        user.Nationality = req.body.Nationality;
        user.Gender = req.body.Gender;
        user.Address = req.body.Address;

        // Save the article without a callback
        await user.save(); // No callback function here
        console.log("User successfully created: ", user.EmailAddress);
        res.redirect('/login/'); // Redirect after successful save
    } catch (err) {
        console.error('Error signing up the user :', err); // Log any errors
        res.status(500).send('Error signing up'); // Send a response if there's an error
    }
});

app.post('/login/', async (req, res) =>{
    const {EmailAddress, Password} = req.body;

    try{
        const user = await Users.findOne({EmailAddress: EmailAddress});

        if(!user){
            return res.status(401).send('Invalid email or password');
        }

        //Compare the password with the entered password

        if(user.Password != Password){
            return res.status(401).send('Invalid email or password');
        }

        req.session.userId = user._id;
        req.session.FirstName = user.FirstName; // Save first name in session
        res.redirect('/');
    } catch(err){
        console.error('Error during login:', err);
        res.status(500).send('Internal Server Error');
    }

});

// Example of a protected route
app.get('/dashboard', (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/login'); // Redirect if not logged in
    }

    const firstName = req.session.FirstName; // Retrieve the first name from session
    res.send(`Welcome to your dashboard, ${firstName}!`); // Display the first name
});

// Logout route
app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).send('Error logging out');
        }

        // Optionally, clear the session cookie
        res.clearCookie('connect.sid'); // 'connect.sid' is the default session cookie name
        res.redirect('/'); // Redirect to the login page after logout
    });
});

//Start Server
app.listen(3000, function () {
    console.log('Server started on Port 3000')
});

