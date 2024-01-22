const router = require('express').Router();
const billController = require('../controllers/bill.controller');
const authMiddleware = require('../middleware/authenticate');
const cloudinaryUpload = require('../middleware/cloudinaryUpload');

// Route pour la création de produits en tant qu'admin en drenant en compte authMiddleware.authenticate
router.post(
	'/api/create-bill',
	authMiddleware.authenticate,
	cloudinaryUpload,
	billController.createBill
);

// Route pour la modifier de facture en tant qu'admin en drenant en compte authMiddleware.authenticate
router.put(
	'/api/update-bill/:id',
	authMiddleware.authenticate,
	cloudinaryUpload,
	billController.updateBill
);

// Route pour récupérer toutes les factures
router.get('/api/all-bill', billController.getAllBills);

// Route pour récupérer une seule facture avec son id
router.get('/api/bill/:id', billController.getBillById);

// Route pour supprimer une facture uniquement par l admin
router.delete('/api/delete-bill/:id', authMiddleware.authenticate, billController.deleteBill);

module.exports = router;
