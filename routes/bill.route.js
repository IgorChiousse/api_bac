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

// Route pour récupérer toutes les factures
router.get('/all-bill', billController.getAllBills);

module.exports = router;
