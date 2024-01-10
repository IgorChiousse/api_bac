const router = require('express').Router();
const billController = require('../controllers/bill.controller');
const authMiddleware = require('../middleware/authenticate');

// Route pour la création de produits en tant qu'admin en drenant en compte authMiddleware.authenticate
router.post('/create-bill', authMiddleware.authenticate, billController.createBill);

module.exports = router;
