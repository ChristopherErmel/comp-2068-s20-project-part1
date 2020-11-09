
 const {new: _new, modeChange, index, indexXbox, xboxSearchResults, indexPS, psSearchResults, show, create, comment, tradeComment, myoffers, deleteOffer, edit, update, delete: _delete, home, myblock} = require('../controllers/TradesController');

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
     router.get('/XboxTrades', indexXbox); //public       
     router.get('/PSTrades', indexPS); //public  

     router.post('/modeChange', modeChange);//Public
     
     
     router.post('/xboxSearchResults', auth,  xboxSearchResults); //authenticated
     router.post('/psSearchResults', auth,  psSearchResults); //authenticated
    //  router.post('/trades/delete',  _delete);

     router.get('/trades/new', auth, _new); //authenticated          
     router.post('/trades', auth, create); //authenticated
     router.post('/trades/update', auth, update); //authenticated
     router.post('/trades/delete', auth, _delete);//authenticated

     //router.post('/trades/deleteOffer', auth, deleteOffer);//authenticated



     router.get('/trades/home', auth, home);//authenticated   
     router.get('/trades/myblock', auth, myblock);//authenticated   
     router.get('/trades/myblock/myoffers', auth, myoffers);//authenticated   


     
       
     router.post('/trades/comment', auth, comment); //authenticated  
     router.get('/trades/:id/edit', auth, edit); //authenticated   
     router.get('/trades/:id', show); //public
     router.post('/trades/:id', auth, tradeComment); //authenticated  
 };