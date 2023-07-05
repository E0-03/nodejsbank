const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const app = express();
const port = 3000;

// Database configuration
const dbConfig = {
  host: 'localhost',
  port: 3306,
  database: 'nodelogin',
  user: 'root',
  password: 'freefrag'
};

// Initialize the app and add middleware
app.set('view engine', 'pug'); // Setup the pug
app.use(bodyParser.urlencoded({ extended: true })); // Setup the body parser to handle form submits
app.use(session({ secret: 'super-secret' })); // Session setup

// Create a MySQL connection pool
const pool = mysql.createPool(dbConfig);

/** Handle login display and form submit */
app.get('/login', (req, res) => {
  if (req.session.isLoggedIn === true) {
    return res.redirect('/');
  }
  res.render('login', { error: false });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Check the username and password against the database
  pool.execute('SELECT * FROM accounts WHERE username = ?', [username], (err, results) => {
    if (err) {
      console.error('Error executing the query:', err);
      return res.render('login', { error: 'Internal server error' });
    }

    if (results.length === 0 || results[0].password !== password) {
      return res.render('login', { error: 'Username or password is incorrect' });
    }

    // Store the username in the session
    req.session.isLoggedIn = true;
    req.session.username = username;
    
    res.redirect(req.query.redirect_url ? req.query.redirect_url : '/');
  });
});

/** Handle logout function */
app.get('/logout', (req, res) => {
  req.session.isLoggedIn = false;
  res.redirect('/');
});

/** Simulated bank functionality */
app.get('/', (req, res) => {
  res.render('index', { isLoggedIn: req.session.isLoggedIn });
});

app.get('/balance', (req, res) => {
  if (req.session.isLoggedIn === true) {
    res.send('Your account balance is $1234.52');
  } else {
    res.redirect('/login?redirect_url=/balance');
  }
});

app.get('/account', (req, res) => {
  if (req.session.isLoggedIn === true) {
    res.send('Your account number is ACL9D42294');
  } else {
    res.redirect('/login?redirect_url=/account');
  }
});

app.get('/contact', (req, res) => {
  res.send('Our address: 321 Main Street, Beverly Hills.');
});

// View Email option
app.get('/email', (req, res) => {
  if (req.session.isLoggedIn === true) {
    // Retrieve the email from the accounts table
    const username = req.session.username;
    pool.execute('SELECT email FROM accounts WHERE username = ?', [username], (err, results) => {
      if (err) {
        console.error('Error executing the query:', err);
        return res.send('Error retrieving email');
      }

      const email = results.length > 0 ? results[0].email : 'No email found';
      res.send(`Your email is: ${email}`);
    });
  } else {
    res.redirect('/login?redirect_url=/email');
  }
});

// Change Email option
app.get('/change-email', (req, res) => {
  if (req.session.isLoggedIn === true) {
    res.render('change-email');
  } else {
    res.redirect('/login');
  }
});

// Handle email update form submission
app.post('/update-email', (req, res) => {
  if (req.session.isLoggedIn === true) {
    const username = req.session.username;
    const newEmail = req.body.email;

    pool.execute('UPDATE accounts SET email = ? WHERE username = ?', [newEmail, username], (err, results) => {
      if (err) {
        console.error('Error executing the query:', err);
        return res.send('Error updating email');
      }

      res.redirect('/email');
    });
  } else {
    res.redirect('/login');
  }
});

/** App listening on port */
app.listen(port, () => {
  console.log(`MyBank app listening at http://localhost:${port}`);
});
