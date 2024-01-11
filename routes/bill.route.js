const router = require('express').Router();
const billController = require('../controllers/bill.controller');
const authMiddleware = require('../middleware/authenticate');
const upload = require('../middleware/upload');

// Route pour la création de produits en tant qu'admin en drenant en compte authMiddleware.authenticate
router.post(
	'/create-bill',
	authMiddleware.authenticate,
	upload.single('image'),
	billController.createBill
);

module.exports = router;
