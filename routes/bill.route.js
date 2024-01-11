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

// Route pour la modifier de facture en tant qu'admin en drenant en compte authMiddleware.authenticate
router.put(
	'/update-bill/:id',
	authMiddleware.authenticate,
	upload.single('image'),
	billController.updateBill
);

// Route pour récupérer toutes les factures
router.get('/all-bill', billController.getAllBills);

// Route pour récupérer une seule facture avec son id
router.get('/bill/:id', billController.getBillById);

// Route pour supprimer une facture uniquement par l admin
router.delete('/delete-bill/:id', authMiddleware.authenticate, billController.deleteBill);

module.exports = router;
