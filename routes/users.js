const { new: _new, create, subscribe, subscribeProcess, subscribeSuccess, subscribeError } = require('../controllers/UsersController');

//to check for loged in status
function auth (req, res, next) {    
  if(!req.isAuthenticated()){
      req.flash('danger', 'You need to login.');
      return res.redirect('/login');
  }
  next();
}

module.exports = router => {
  // Step 1: Setup the necessary routes for new and create
  
  router.post('/users', create);
  router.get('/users/new', _new);

  router.get('/subscribe', auth, subscribe);
  router.get('/subscribeProcess', auth, subscribeProcess);
  router.get('/subscribeSuccess', subscribeSuccess);
  router.get('/subscribeError', subscribeError);
};