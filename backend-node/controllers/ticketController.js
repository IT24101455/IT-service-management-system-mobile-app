const Ticket = require('../models/Ticket');
const Notification = require('../models/Notification');
const User = require('../models/User');
const TechnicianLeave = require('../models/TechnicianLeave');

const calculateSlaDeadline = (priority) => {
  const now = new Date();
  if (!priority) return new Date(now.getTime() + 24 * 60 * 60 * 1000);
  switch (priority.toUpperCase()) {
    case 'CRITICAL': return new Date(now.getTime() + 2 * 60 * 60 * 1000);
    case 'HIGH': return new Date(now.getTime() + 4 * 60 * 60 * 1000);
    case 'LOW': return new Date(now.getTime() + 48 * 60 * 60 * 1000);
    default: return new Date(now.getTime() + 24 * 60 * 60 * 1000);
  }
};

exports.getAllTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find().sort({ createdAt: -1 });
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getTicketById = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getTicketsByUser = async (req, res) => {
  try {
    const tickets = await Ticket.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getTicketsByTechnician = async (req, res) => {
  try {
    const tickets = await Ticket.find({ technicianId: req.params.technicianId }).sort({ createdAt: -1 });
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createTicket = async (req, res) => {
  try {
    const ticketData = {
      ...req.body,
      status: req.body.technicianId ? 'OPEN' : 'PENDING',
      slaDeadline: calculateSlaDeadline(req.body.priority)
    };

    const ticket = await Ticket.create(ticketData);
    const io = req.app.get('io');

    // Notification for admin
    const adminNotif = await Notification.create({
      title: 'New Ticket Created',
      message: `Ticket '${ticket.title}' has been submitted by ${ticket.userName}`,
      type: 'TICKET_CREATED',
      ticketId: ticket._id,
      relatedId: ticket._id.toString(),
      userId: 'ADMIN' // Logical grouping
    });
    io.emit('notification', adminNotif);

    // Notify technician if assigned
    if (ticket.technicianId) {
      const techNotif = await Notification.create({
        userId: ticket.technicianId,
        title: 'New Ticket Assigned',
        message: `You have been assigned a new ticket: ${ticket.title}`,
        type: 'TICKET_ASSIGNED',
        ticketId: ticket._id,
        relatedId: ticket._id.toString()
      });
      io.to(ticket.technicianId.toString()).emit('notification', techNotif);
    }

    res.status(201).json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    const updates = req.body;
    if (updates.priority && updates.priority !== ticket.priority) {
      updates.slaDeadline = calculateSlaDeadline(updates.priority);
    }

    if (updates.status && updates.status !== ticket.status) {
      if (updates.status === 'RESOLVED') {
        updates.resolvedAt = new Date();
      }
      
      const io = req.app.get('io');
      const notif = await Notification.create({
        userId: ticket.userId,
        title: updates.status === 'RESOLVED' ? 'Ticket Resolved' : 'Ticket Status Updated',
        message: `Your ticket '${ticket.title}' is now ${updates.status}.`,
        type: updates.status === 'RESOLVED' ? 'TICKET_RESOLVED' : 'TICKET_UPDATED',
        ticketId: ticket._id,
        relatedId: ticket._id.toString()
      });
      io.to(ticket.userId.toString()).emit('notification', notif);
    }

    Object.assign(ticket, updates);
    await ticket.save();
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.assignTechnician = async (req, res) => {
  try {
    const { technicianId, technicianName } = req.body;
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    if (technicianId) {
      const tech = await User.findById(technicianId);
      if (!tech) return res.status(404).json({ message: 'Technician not found' });
      
      if (!tech.active) {
        return res.status(400).json({ message: 'Cannot assign to an inactive technician. Their account may be suspended or unpaid.' });
      }

      // Check if on leave
      const activeLeave = await TechnicianLeave.findOne({
        technicianId: tech._id,
        status: 'APPROVED',
        startDate: { $lte: new Date() },
        endDate: { $gte: new Date() }
      });

      if (activeLeave) {
        return res.status(400).json({ message: 'Cannot assign this technician because they are currently on leave.' });
      }
    }

    ticket.technicianId = technicianId;
    ticket.technicianName = technicianName;
    ticket.status = 'IN_PROGRESS';
    await ticket.save();

    const io = req.app.get('io');
    const notif = await Notification.create({
      userId: ticket.userId,
      title: 'Ticket Assigned',
      message: `Your ticket has been assigned to ${technicianName}`,
      type: 'TICKET_UPDATED',
      ticketId: ticket._id,
      relatedId: ticket._id.toString()
    });
    io.to(ticket.userId.toString()).emit('notification', notif);

    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteTicket = async (req, res) => {
  try {
    await Ticket.findByIdAndDelete(req.params.id);
    res.json({ message: 'Ticket deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getStats = async (req, res) => {
  try {
    const total = await Ticket.countDocuments();
    const pending = await Ticket.countDocuments({ status: 'PENDING' });
    const inProgress = await Ticket.countDocuments({ status: 'IN_PROGRESS' });
    const resolved = await Ticket.countDocuments({ status: 'RESOLVED' });
    const closed = await Ticket.countDocuments({ status: 'CLOSED' });

    res.json({ total, pending, inProgress, resolved, closed });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
