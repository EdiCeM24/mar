const express = require("express");
const cors = require("cors");
const session = require("express-session");
const dotenv = require("dotenv");
const path = require("path");
const { Pool } = require('pg');
const bodyParser = require('body-parser');
const bcryptSalt = require('bcryptjs');
const saltRounds = 10;
const passport = require("passport");
const flash = require("express-flash");
const jwt = require("jsonwebtoken");
const { message } = require("statuses");
const methodOverride = require("method-override");
const { ensureAuthenticated } = require("./middleware/auth.middleware.js");
const initializePassport  = require("./middleware/passport.config.js");


dotenv.config()

const app = express();
const PORT = process.env.PORT || 3040;
const pool = new Pool({
  host: process.env.PG_HOST,
  port: process.env.PG_PORT,
  database: process.env.PG_DATABASE,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
});
const JWT_SECRET = process.env.JWT_SECRET || 'default_jwt_secret';

 // Optional: Test the connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
      console.error('Error connecting to PostgreSQL:', err);
  } else {
      console.log('Connected to PostgreSQL:', res.rows[0].now);
    }
});

app.use(methodOverride('_method'));
app.use(cors());
app.use(express.urlencoded({ extended: false }))
app.use(express.json())
app.use(session({
  secret: process.env.SESSION_SECRET || 'defaultsecret',
  resave: false,
  saveUninitialized: false,
}));
app.use(express.static(path.join(__dirname, 'public')))
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

const users = []; // This should be replaced with a proper database in production

// In a separate config file or at the top of index.js
initializePassport(
  passport, 
  email => {
  return users.find(user => user.email === email); // Implement this function to get user by email from your DB
  //   return pool.query('SELECT * FROM users WHERE email = $1', [email])
  //     .then(result => result.rows[0])
  //     .catch(err => console.error('Error fetching user by email:', err));
  },
  id => {
    return users.find(user => user.id === id); // Implement this function to get user by ID from your DB
    //   return pool.query('SELECT * FROM users WHERE id = $1', [id])
  }  
);


// app.use((req, res, next) => {
//   res.locals.ensureAuthenticated = req.isAuthenticated();
//   next();
// });

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


// THESE ARE THE SECTIONS FOR GET ROUTES
app.get("/", ensureAuthenticated, (req, res) => {
  res.render('index', {name: req.body.name, title: "Home Page", user: req.user, message: "this is a simple server app."})
});

app.get("/api/dashboard", ensureAuthenticated, async(req, res) => {
  try {
    const result = await pool.query("SELECT * FROM edimar ORDER BY id ASC");
     res.render('dashboard', { items: result.rows }); // Render 'items.ejs' with the fetched data
  } catch (error) {
    console.error('Error executing query', err);
    res.status(500).send('Server Error');
  }
});

app.get("/api/signup", checkNotAuthenticated, (req, res) => {
  const result = pool.query("SELECT id, fullname, username, email, is_active FROM users ORDER BY id ASC");
  res.render('signup', {userid: result.rows, title: "Sign Up" ,message: "Welcome to our website!"})
});

app.get("/api/login", checkNotAuthenticated, (req, res) => {
  res.render('login', {message: "Welcome to our website and feel free to explore!"})
});

app.get("/api/skills", (req, res) => {
  res.render('skills', {message: "Welcome to our website and feel free to explore!"})
});



// THESE ARE THE SECTIONS FOR POST ROUTES
app.post("/api/contacts", (req, res) => {
  const {name, email, message, subject, website} = req.body;
  try {
    const query = 'INSERT INTO edimar (name, email, message, subject, website) VALUES ($1, $2, $3, $4, $5)';
    const values = [name, email, message, subject, website];
    pool.query(query, values, (err, result) => {
      if (err) {
        console.error('Error inserting contact:', err);
        res.status(500).json({ error: 'Error inserting contact' });
      } else {
        console.log('Contact inserted:', result.rows[0]);
        res.status(201).json({ message: 'Contact inserted successfully!' });
        return res.redirect('/');
      }
    });
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post("/api/signup", checkNotAuthenticated, async(req, res) => {
  const {fullname, username, email, password} = req.body;

  // req.body.is_active will be 'on' if checked, or 'off' (from the hidden input) if unchecked
  const isActivateString = req.body.is_active;

   // Convert the string value to a PostgreSQL-compatible boolean
  // PostgreSQL accepts TRUE, FALSE, 't', 'f', '1', '0', 'yes', 'no' etc.
  const isActiveBoolean = (isActivateString === 'on');  // This will be `true` if 'on', `false` otherwis

  try {
    if (!fullname || !username || !email || !password) {
      return res.status(400).json({ message: "Please provide all credentials!" })
    }

    // Check if user already exists (basic validation)
    const existingUser = `
      SELECT EXISTS (
        SELECT 1 FROM users WHERE username = $1 OR email = $2 
      ) AS user_exists;
    `;
    const { rows } = await pool.query(existingUser, [username, email]);
    const userExists = rows[0].user_exists;

    if (userExists) {
      // If the user exists, render the registration page again with an error
      return res.render('signup', {
        errorMessage: 'A user with that email or username already exists. Please choose another credentials!',
        username: username,
        email: email
      });
    }

    const hashedPassword = await bcryptSalt.hash(password, saltRounds);

    const query = "INSERT INTO users (fullname, username, email, hashedPassword, is_active) VALUES($1, $2, $3, $4, $5) RETURNING *";
    const values = [fullname, username, email, hashedPassword, isActiveBoolean];
    const results = pool.query(query, values, (err, result) => {
      if(err) {
        console.log("Error in processing data to server: ", err);
        return res.status(400).json({ error: "Error in sending data." })
      }else {
        return res.status(201).json({ 
          message: "User registered successfully!", 
          results: result.rows[0], results 
        }); 
        res.redirect('/api/login');  // Redirect to login page after registration
        
      }
    });
    

  } catch (error) {
    console.log("Error from the server: ", error);
    res.status(400).json({ error: "Internal server error" })
  }
});

app.post("/api/login", checkNotAuthenticated, passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/api/login',
  failureFlash: true
}));
  

// POST /logout
app.post('/api/logout', (req, res, next) => {
  req.logout(function(err) { // Passport v0.6+
    if (err) { return next(err); }
    res.redirect('/');
  });
});


app.post("/api/delete/:id", async (req, res) => {
  const { id } = req.params.id;
 try {
    console.log(req.params);
    const result = await pool.query('DELETE FROM edimar WHERE id = $1', [id]);
    if(result.rowCount > 0) {
      res.redirect('/dashboard');
      res.status(200).send({ message: "Contact deleted successfully!"});
    }else {
      res.status(404).send({ message: "Contact not found!"});
    }
 } catch (error) {
   console.log(error);
   res.status(500).send({ message: "Error deleting contact"});
 }
});

app.put("/api/view", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error logging out:", err);
      res.status(500).json({ error: "Error logging out" });
    } else {
      res.status(200).json({ message: "Logged out successfully" });
    }
    return res.redirect('/api/login');
  });
});

// Error handling middleware
// Checks if the user is authenticated
function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    res.redirect('/');
  }
  next();
}


app.listen(PORT, () => {
  console.log(`Server is running on port localhost:${PORT}`);
});
