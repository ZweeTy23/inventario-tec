const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/productsController');
const { authenticate } = require('../middlewares/auth.middleware');
const { loadUserPermissions } = require('../middlewares/permissions.middleware');

router.post('/', authenticate, loadUserPermissions, ctrl.createProduct);
router.get('/', ctrl.listProducts);
router.get('/:id', ctrl.getProduct);
router.patch('/:id', authenticate, loadUserPermissions, ctrl.updateProduct);
router.delete('/:id', authenticate, loadUserPermissions, ctrl.deleteProduct);

module.exports = router;
