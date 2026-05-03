const express = require('express');
const router = express.Router();
const { 
  getAllTickets, 
  getTicketById, 
  getTicketsByUser, 
  getTicketsByTechnician, 
  createTicket, 
  updateTicket, 
  assignTechnician, 
  deleteTicket, 
  getStats 
} = require('../controllers/ticketController');

router.get('/', getAllTickets);
router.get('/stats', getStats);
router.get('/:id', getTicketById);
router.get('/user/:userId', getTicketsByUser);
router.get('/technician/:technicianId', getTicketsByTechnician);
router.post('/', createTicket);
router.put('/:id', updateTicket);
router.patch('/:id/assign', assignTechnician);
router.delete('/:id', deleteTicket);

module.exports = router;
