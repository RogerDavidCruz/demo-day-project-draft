module.exports = function(app, passport, db, ObjectId) {
  const fetch = require('node-fetch');

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
  }); // "ternary" regarding line 20, read later.

  // LOGOUT ==============================
  app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
  });

  app.get('/cuisines', function(req, res){
    res.render('recipes.ejs')
  })


  app.get('/recipes/:cuisine', function(req, res){
    const url = `https://www.themealdb.com/api/json/v1/1/filter.php?a=${req.params.cuisine}`
    fetch(url)

    .then(res => res.json())
    .then(dishes => {
      console.log(dishes)
      console.log("response from fetch")
      res.render('showDishes.ejs', {meals : dishes.meals})

    })
    .catch(err => {
      console.log(`error ${err}`)
      alert("Sorry, there are no results for your category.")
    })
  })

  //***try to avoid the post id, and query for the food category or type.<<<<
  app.get('/foods/:post_id', function(req, res) {
    console.log(req.params.post_id);
    // var uId = ObjectId(req.params.post_id) //look at the URL query params
    db.collection('foods').find({"_id": req.params.post_id}).toArray((err, result) => {
      if (err) return console.log(err)
      res.render('', {
        foods: result
      })
    })
  });

  app.get('/meal/:idMeal', function(req, res){
    const url = `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${req.params.idMeal}`
    fetch(url)

    .then(res => res.json())
    .then(meal => {
      console.log(meal)
      console.log("response from fetch")
      console.log("current user", req.user._id);
      db.collection('foods').findOne({user: req.user.local.email}, (err, foods) => {
        if (err) return console.log(err)
        console.log("foods", foods);
        res.render('meal.ejs', {meal : meal.meals[0], allergens : foods.ingredients})
      })

    })
    .catch(err => {
      console.log(`error ${err}`)
    })
  })

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

  // req.body.foodToDelete & req.body.userId
  // db.collection('foods').findOneAndDelete({_id: id, name: foodToDelete})
  app.delete('/profile', (req, res) => {
    db.collection('foods').findOneAndUpdate({_id: uId}, {$pull: {allergies: req.body.allergies }}, (err, result) => {
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
