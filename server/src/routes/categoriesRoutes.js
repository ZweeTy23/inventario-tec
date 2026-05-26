const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/categoriesController');
const { authenticate } = require('../middlewares/auth.middleware');
const { loadUserPermissions } = require('../middlewares/permissions.middleware');

router.post('/', authenticate, loadUserPermissions, ctrl.createCategory);
router.get('/', ctrl.listCategories);
router.get('/:id', ctrl.getCategory);
router.patch('/:id', authenticate, loadUserPermissions, ctrl.updateCategory);
router.delete('/:id', authenticate, loadUserPermissions, ctrl.deleteCategory);

module.exports = router;
