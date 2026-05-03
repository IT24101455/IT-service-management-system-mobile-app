const Payment = require('../models/Payment');

exports.getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find().sort({ createdAt: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPaymentsByUser = async (req, res) => {
  try {
    const payments = await Payment.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPaymentByTicket = async (req, res) => {
  try {
    const payment = await Payment.findOne({ ticketId: req.params.ticketId });
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    res.json(payment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getByInvoice = async (req, res) => {
  try {
    const payment = await Payment.findOne({ invoiceNumber: req.params.invoiceNumber });
    if (!payment) return res.status(404).json({ message: 'Invoice not found' });
    res.json(payment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createPayment = async (req, res) => {
  try {
    const invoiceNumber = `INV-${Date.now()}`;
    const payment = await Payment.create({
      ...req.body,
      invoiceNumber,
      status: 'PENDING'
    });
    res.status(201).json(payment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.markAsPaid = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ message: 'Payment not found' });

    payment.status = 'PAID';
    payment.paymentMethod = req.body.paymentMethod;
    payment.paidAt = new Date();
    await payment.save();

    res.json(payment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deletePayment = async (req, res) => {
  try {
    await Payment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Payment deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
