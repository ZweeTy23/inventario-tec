const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth.middleware');
const sessionsController = require('../controllers/sessionsController');

router.use(authenticate);

router.get('/', sessionsController.listSessions);
router.delete('/:id', sessionsController.revokeSession);

module.exports = router;
