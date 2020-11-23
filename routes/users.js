const { new: _new, create, upgrade, upgradeProcess, upgradeSuccess, upgradeError } = require('../controllers/UsersController');

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

  router.get('/upgrade', auth, upgrade);
  router.get('/upgradeProcess', auth, upgradeProcess);
  router.get('/upgradeSuccess', upgradeSuccess);
  router.get('/upgradeError', upgradeError);  
};