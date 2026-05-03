const express = require('express');
const router = express.Router();
const { 
  getAllPayments, 
  getPaymentsByUser, 
  getPaymentByTicket, 
  getByInvoice, 
  createPayment, 
  markAsPaid, 
  deletePayment 
} = require('../controllers/paymentController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', protect, admin, getAllPayments);
router.get('/user/:userId', protect, getPaymentsByUser);
router.get('/ticket/:ticketId', protect, getPaymentByTicket);
router.get('/invoice/:invoiceNumber', protect, getByInvoice);
router.post('/', protect, admin, createPayment);
router.patch('/:id/pay', protect, markAsPaid);
router.delete('/:id', protect, admin, deletePayment);

module.exports = router;
