module.exports = function(app, passport, db) {

// normal routes ===============================================================

    // show the home page (will also have our login links)
    app.get('/', function(req, res) {
      console.log("poop");
        res.render('index.ejs');
    });

//Make a route to specifically get the Allergies and Cuisines they enjoy eating
    //query parameter could be used to direct to cuisine
    // Looking for you to add one new route that contains a query parameter.
    //That query parameter should be used to retrieve something specific from your MongoDB

    // PROFILE SECTION =========================
    app.get('/profile', isLoggedIn, function(req, res) {
        db.collection('allergies').findOne({userId: req.session.passport.user}, (err, result) => {
          console.log(result);
          if (err ) return console.log(err)
          res.render('profile.ejs', {
            user : req.user,
            allergies: result == undefined ? [] : result.allergies
          })
        })
    });

    //Allergy SECTION =======================
    app.get('/allergies', isLoggedIn, function(req, res) {
        db.collection('allergies').findOne({userId: req.session.passport.user}, (err, result) => {
          console.log(result);
          if (err ) return console.log(err)
          res.render('allergies.ejs', {
            user : req.user,
            allergies: result == undefined ? [] : result.allergies
          })
        })
    });

    // LOGOUT ==============================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

// message board routes ===============================================================


  //Creating the allergens list per user
    app.post('/allergies', isLoggedIn, (req, res) => {
      console.log(req.body.allergies)
      console.log(req.session.passport.user)
      let userId = req.session.passport.user
      // db.collection('allergies').findOneAndUpdate({user: req.user.local.email}, {$push: { ingredients: req.body.allergies }}, {upsert: true}, (err, result) => {
      db.collection('allergies').findOneAndUpdate({userId: userId}, {$push: { allergies: req.body.allergies }}, {upsert: true}, (err, result) => {
        if (err) return console.log(err)
        //note: check to put back to the response (John)
        console.log('saved to database')
        res.redirect('/profile')
      })
    })

  //POST - to save the recipes onto profile page






  //PUT - allows the user to update their allergies
    app.put('/allergies', (req, res) => {
      db.collection('allergies').findOneAndUpdate({allergies: req.body.allergies, like: req.body.like, unlike: req.body.unlike}, {
        $set: {
          allergies: req.body.allergies,
          like: req.body.like,
          unlike: req.body.unlike
        }
      }, {
        sort: {_id: -1},
        upsert: false
      }, (err, result) => {
        if (err) return res.send(err)
        res.send(result)
      })
    })

//make a document for each food**** instead.

    //Question: the allergen is being deleted from the db but not on the front end...?

    app.delete('/allergies', (req, res) => {
      db.collection('allergies').findOneAndUpdate({user: req.user.local.email}, {$pull: {allergies: req.body.allergies }}, (err, result) => {
        if (err) return res.send(500, err)
        res.send(200, 'OK')
      })
    })

// =============================================================================
// AUTHENTICATE (FIRST LOGIN) ==================================================
// =============================================================================

    // locally --------------------------------
        // LOGIN ===============================
        // show the login form
        app.get('/login', function(req, res) {
            res.render('login.ejs', { message: req.flash('loginMessage') });
        });

        // process the login form
        app.post('/login', passport.authenticate('local-login', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/login', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

        // SIGNUP =================================
        // show the signup form
        app.get('/signup', function(req, res) {
            res.render('signup.ejs', { message: req.flash('signupMessage') });
        });

        // process the signup form
        app.post('/signup', passport.authenticate('local-signup', {
            successRedirect : '/allergies', // redirect to the secure profile section  //successRedirect : '/profile',
            failureRedirect : '/signup', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

// =============================================================================
// UNLINK ACCOUNTS =============================================================
// =============================================================================
// used to unlink accounts. for social accounts, just remove the token
// for local account, remove email and password
// user account will stay active in case they want to reconnect in the future

    // local -----------------------------------
    app.get('/unlink/local', isLoggedIn, function(req, res) {
        var user            = req.user;
        user.local.email    = undefined;
        user.local.password = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.redirect('/');
}
