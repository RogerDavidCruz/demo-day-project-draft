module.exports = function(app, passport, db, ObjectId) {

  // normal routes ===============================================================

    // show the home page (will also have our login links)
    app.get('/', function(req, res) {
        res.render('index.ejs');
    });

    // PROFILE SECTION =========================
    app.get('/profile', isLoggedIn, function(req, res) {
      console.log(req);
      console.log(res);
      var uId = ObjectId(req.session.passport.user)
      db.collection('foods').findOne({"user": req.user.local.email }, (err, result) => {
        console.log(result);
        if (err) return console.log(err)
        res.render('profile.ejs', {
        user : req.user,
        foods: result=== null ? [] : result.ingredients //result.ingredients //without || [] the result for foods will always be null // == undefined ? [] : result.allergies
        })
      })
    });
      // "ternary" regarding line 20, read later.

    // LOGOUT ==============================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

    // POSTS indivdual posts pages == POSTS individual recipes

    app.get('/foods/:post_id', function(req, res) {
        console.log(req.params.post_id);
        var uId = ObjectId(req.params.post_id) //look at the URL query params
        db.collection('foods').find({"_id": uId}).toArray((err, result) => {
          if (err) return console.log(err)
          res.render('foods.ejs', {
            foods: result
          })
        })
    });


    //Creating the allergens list per user
    /************************************************
      **********************************************/
    // THIS PART OF CODE WORKS!!!!!
      // app.post('/foods', isLoggedIn, (req, res) => {
      //   console.log(req.body.foods)
      //   db.collection('foods').findOneAndUpdate({user: req.user.local.email}, {$push: { ingredients: req.body.foods }}, {upsert: true}, (err, result) => {
      //     if (err) return console.log(err)
      //     console.log('saved to database')
      //     res.redirect('/profile')
      //   })
      // })

      app.post('/foods', isLoggedIn, (req, res) => {
        console.log(req.body.foods)
        db.collection('foods').findOneAndUpdate({user: req.user.local.email}, {$push: { ingredients: req.body.ingredient }}, {upsert: true}, (err, result) => {
          if (err) return console.log(err)
          console.log('saved to database')
          res.redirect('/profile')
        })
      })

      app.put('/foods', (req, res) => {
        db.collection('foods').findOneAndUpdate({foods: req.body.foods, like: req.body.like, unlike: req.body.unlike}, {
          $set: {
            foods: req.body.foods,
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
      /************************************************
        **********************************************/

    // message board routes ===============================================================

        // app.post('/allergies', (req, res) => {
        //   console.log(req.body.allergies) //note for allergy to send to db, form data contained in req.body
        //   var uId = ObjectId(req.session.passport.user)
        //   var uName
        //   db.collection('users').find({"_id": uId}).toArray((err, result) => {
        //     if (err) return console.log(err)
        //     uName = result[0].local.username
        //     db.collection('posts').save({username: uName, allergies: req.body.allergies}, (err, result) => {
        //       if (err) return console.log(err)
        //       console.log('saved to database')
        //       res.redirect('/profile')
        //     })
        //   })
        // })

    // Allergies indivdual posts pages
    // app.get('/posts/:post_id', function(req, res) {
    //   console.log(req.params.post_id);
    //   var uId = ObjectId(req.params.post_id) //look at the URL query params
    //   db.collection('allergies').find({_id: uId}).toArray((err, result) => {
    //     if (err) return console.log(err)
    //     res.render('allergies.ejs', {
    //       posts: result
    //     })
    //   })
    // });

    //Creating the allergens list per user

  //sample try 1
      // app.post('/profile', (req, res) => {
      //   var uId = ObjectId(req.session.passport.user)
      //   var uName
      //   db.collection('users').find({_id: uId}, (err, result) => {
      //     if (err) return console.log(err)
      //     uName = result[0].local.username
      //     db.collection('allergies').save({username: uName}, {$push: { allergies: req.body.allergies }}, {upsert: true})
      //     console.log('saved to database')
      //     res.redirect('/profile')
      //   })
      // })



  //POST - to save the recipes onto profile page

  //PUT - allows the user to update their allergies
    // app.put('/allergies', (req, res) => {
    //   db.collection('allergies').findOneAndUpdate({allergies: req.body.allergies, like: req.body.like, unlike: req.body.unlike}, {
    //     $set: {
    //       allergies: req.body.allergies,
    //       like: req.body.like,
    //       unlike: req.body.unlike
    //     }
    //   }, {
    //     sort: {_id: -1},
    //     upsert: false
    //   }, (err, result) => {
    //     if (err) return res.send(err)
    //     res.send(result)
    //   })
    // })

//make a document for each food**** instead.

    //Question: the allergen is being deleted from the db but not on the front end...?

    app.delete('/profile', (req, res) => {
      db.collection('users').findOneAndUpdate({_id: uId}, {$pull: {allergies: req.body.allergies }}, (err, result) => {
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
            successRedirect : '/profile', // redirect to the secure profile section  //successRedirect : '/profile',
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
