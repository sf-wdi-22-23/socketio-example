// server.js

// require express framework and additional modules
var express = require('express'),
  bodyParser = require('body-parser'),
  mongoose = require('mongoose'),
  session = require('express-session');

// create express app object
var app = express();

// @SOCKETS
// require built-in http module and set up an http server with our app
  // (so we can reuse same server for socket handshake)
var http = require('http');
var httpServer = http.Server(app);
// pull in socket.io module's "Server" constructor
var ioServer = require('socket.io');
// create an io server for us to use, and attach it to our http server
var io = new ioServer(httpServer);



// connect to database and pull in model(s)
mongoose.connect('mongodb://localhost/simple-login');
var User = require('./models/user');

// middleware
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

var sessionMiddleware = session({
  saveUninitialized: true,
  resave: true,
  secret: 'SuperSecretCookie',
  cookie: { maxAge: 30 * 60 * 1000 }
});


app.use(sessionMiddleware);

// SHARE MIDDLEWARE SOLUTION
io.use(function(socket, next){
  // Wrap the express middleware
  sessionMiddleware(socket.request, socket.request.res, next);
});


// @SOCKETS
// main page of site
app.get('/', function(req, res){
  res.render('index');
});

// @SOCKETS
// listen for a connection event
io.on('connection', function(socket){
  // socket.id uniquely identifies a connected user
  console.log('user connected with socket id ', socket.id);
  // AUTH
  // we now have access to socket.request.session, which is the same as req.session
  console.log('socket.request.session is ', socket.request.session);
  // if a user is logged in:
  if (socket.request.session.userId){
     console.log('user id is ', socket.request.session.userId);
     db.Users.findOne({_id: socket.request.session.userId}, function(err, foundUser){
        io.emit('new user connected with email '+ foundUser.email);
     })
  }


  // listen for a custom event type - new chat message
  socket.on('new chat message', function(message){
    console.log('new chat message: socket.request.session is ', socket.request.session);
    console.log('message from '+socket.id + ": " + message);
    // for passing objects in socket events, see: http://socket.io/docs/#using-with-express-3/4
    // db.Users.find({_id: targetUserId}, function(err, foundUser){
    //   if (err) { console.log(err); }
    //   foundUser.messages.push(message);
    //   foundUser.save();
    // });
    io.emit('chat message', message);
  });

  // listen for disconnect
  socket.on('disconnect', function(){
    console.log('user disconnected with socket id ', socket.id);
  });

});


// ROUTES

// show the signup form
app.get('/signup', function (req, res) {
  res.render('signup');
});

// create a user 
app.post('/users', function (req, res) {
  console.log(req.body)
  User.createSecure(req.body.email, req.body.password, function (err, newUser) {
    req.session.userId = newUser._id;
    res.redirect('/profile');
  });
});

// show the login form
app.get('/login', function (req, res) {
  res.render('login');
});

// authenticate the user and set the session
app.post('/login', function (req, res) {
  // call authenticate function to check if password user entered is correct
  User.authenticate(req.body.email, req.body.password, function (err, loggedInUser) {
    if (err){
      console.log('authentication error: ', err);
      res.status(500).send();
    } else {
      console.log('setting sesstion user id ', loggedInUser._id);
      req.session.userId = loggedInUser._id;
      res.redirect('/profile');
    }
  });
});

// show user profile page
app.get('/profile', function (req, res) {
  console.log('session user id: ', req.session.userId);
  // find the user currently logged in
  User.findOne({_id: req.session.userId}, function (err, currentUser) {
    if (err){
      console.log('database error: ', err);
      res.redirect('/login');
    } else {
      // render profile template with user's data
      console.log('loading profile of logged in user');
      res.render('user-show.ejs', {user: currentUser});
    }
  });
});

app.get('/logout', function (req, res) {
  // remove the session user id
  req.session.userId = null;
  // redirect to login (for now)
  res.redirect('/login');
});

//@SOCKETS
// change to use the httpServer variable to listen
// listen on port 3000 - @TODO necessary?
httpServer.listen(3000, function () {
  console.log('server started on locahost:3000');
});