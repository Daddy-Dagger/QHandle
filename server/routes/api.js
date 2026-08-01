import express from 'express';
import Department from '../models/Department.js';
import Counter from '../models/Counter.js';
import QueueToken from '../models/QueueToken.js';

const router = express.Router();

// GET /api/departments - Return all active departments
router.get('/departments', async (req, res) => {
  try {
    const departments = await Department.find({ isActive: true });
    res.json(departments);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/queue/join - Join department queue
router.post('/queue/join', async (req, res) => {
  try {
    const { departmentId } = req.body;

    if (!departmentId) {
      return res.status(400).json({ success: false, message: 'departmentId is required' });
    }

    const department = await Department.findById(departmentId);
    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }

    // Find all open counters for this department
    const openCounters = await Counter.find({ department: departmentId, isOpen: true });
    if (!openCounters || openCounters.length === 0) {
      return res.status(400).json({ success: false, message: 'No open counters available in this department.' });
    }

    // Select counter with lowest currentQueueCount
    openCounters.sort((a, b) => a.currentQueueCount - b.currentQueueCount);
    const selectedCounter = openCounters[0];

    // Generate token number using department code
    const tokenCount = await QueueToken.countDocuments({ department: departmentId });
    const nextNumber = tokenCount + 1;
    const tokenNumber = `${department.code}-${String(nextNumber).padStart(3, '0')}`;

    // Increment selected counter's queue count
    selectedCounter.currentQueueCount += 1;
    await selectedCounter.save();

    // Create QueueToken document
    await QueueToken.create({
      tokenNumber,
      department: departmentId,
      counter: selectedCounter._id,
      status: 'Waiting',
    });

    return res.json({
      success: true,
      tokenNumber,
      counter: selectedCounter.name,
      position: selectedCounter.currentQueueCount,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
