const express = require('express');

const router = express.Router();

const controller = require('./admin.controller');

const authMiddleware =
    require('../auth/middleware/auth.middleware');

const authorize =
    require('../auth/middleware/roles.middleware');


router.get(
    '/dashboard',
    authMiddleware,
    authorize('ADMIN'),
    controller.getDashboard
);


module.exports = router;