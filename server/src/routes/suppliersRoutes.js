const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/suppliersController');

router.post('/', ctrl.createSupplier);
router.get('/', ctrl.listSuppliers);
router.get('/:id', ctrl.getSupplier);
router.patch('/:id', ctrl.updateSupplier);
router.delete('/:id', ctrl.deleteSupplier);

module.exports = router;
