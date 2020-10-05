
 const {new: _new, index, show, create, comment, edit, update, delete: _delete, home} = require('../controllers/TradesController');

 //to check for loged in status
 function auth (req, res, next) {    
     if(!req.isAuthenticated()){
         req.flash('danger', 'You need to login.');
         return res.redirect('/login');
     }
     next();
 }

 
  module.exports = router => {
     router.get('/trades', index); //public       
     router.get('/trades/new', auth, _new); //authenticated
          
     router.post('/trades', auth, create); //authenticated
     router.post('/trades/update', auth, update); //authenticated
     router.post('/trades/delete', auth, _delete);//authenticated



     router.get('/trades/home', auth, home);//authenticated   


     
       
     router.post('/trades/comment', auth, comment);
     router.get('/trades/:id/edit', auth, edit); //authenticated   
     router.get('/trades/:id', show); //public
 };