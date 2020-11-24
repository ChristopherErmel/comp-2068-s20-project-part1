const {currentPlayers, update, updateGoalies, console} = require('../controllers/PlayerInfoController');


//to check for loged in status
function auth (req, res, next) {    
    if(!req.isAuthenticated()){
        req.flash('danger', 'You need to login.');
        return res.redirect('/login');
    }    
    next();
  }



module.exports = router => {
    // router.get('/playerInfo', index);
    router.get('/superUser/update', auth, update);
    router.get('/superUser/updateGoalies', auth, updateGoalies);

    router.get('/superUser/console', auth, console);
    router.get('/superUser/currentPlayers', auth, currentPlayers);
};