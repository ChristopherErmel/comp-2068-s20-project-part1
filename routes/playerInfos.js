const {index, update} = require('../controllers/PlayerInfoController');

module.exports = router => {
    router.get('/playerInfo', index);
    router.get('/playerInfo/update', update);
};