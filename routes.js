const router = require('express').Router();

(require('./routes/pages'))(router);
(require('./routes/users'))(router);
(require('./routes/sessions'))(router);
(require('./routes/playerInfos'))(router);

// Step 1: Add your resource routes to the router composer
(require('./routes/trades'))(router);


module.exports = router;