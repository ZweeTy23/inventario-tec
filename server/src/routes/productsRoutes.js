const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/productsController');

router.post('/', ctrl.createProduct);
router.get('/', ctrl.listProducts);
router.get('/:id', ctrl.getProduct);
router.patch('/:id', ctrl.updateProduct);
router.delete('/:id', ctrl.deleteProduct);

module.exports = router;
