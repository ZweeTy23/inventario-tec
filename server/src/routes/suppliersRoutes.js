const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/suppliersController');
const { authenticate } = require('../middlewares/auth.middleware');
const { loadUserPermissions } = require('../middlewares/permissions.middleware');

router.post('/', authenticate, loadUserPermissions, ctrl.createSupplier);
router.get('/', ctrl.listSuppliers);
router.get('/:id', ctrl.getSupplier);
router.patch('/:id', authenticate, loadUserPermissions, ctrl.updateSupplier);
router.delete('/:id', authenticate, loadUserPermissions, ctrl.deleteSupplier);

module.exports = router;
