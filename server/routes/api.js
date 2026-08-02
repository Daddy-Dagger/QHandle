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
    const { departmentId, studentName, studentId } = req.body;

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
    const newToken = await QueueToken.create({
      tokenNumber,
      department: departmentId,
      counter: selectedCounter._id,
      status: 'Waiting',
      studentName: studentName || 'Guest Student',
      studentId: studentId || 'N/A',
    });

    return res.json({
      success: true,
      tokenNumber,
      counter: selectedCounter.name,
      position: selectedCounter.currentQueueCount,
      studentName: newToken.studentName,
      studentId: newToken.studentId,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/staff/:departmentId/counters - Return all counters for selected department
router.get('/staff/:departmentId/counters', async (req, res) => {
  try {
    const { departmentId } = req.params;
    const counters = await Counter.find({ department: departmentId }).lean();

    const countersWithServing = await Promise.all(
      counters.map(async (counter) => {
        const servingToken = await QueueToken.findOne({
          counter: counter._id,
          status: 'Serving',
        });
        return {
          ...counter,
          currentServingToken: servingToken || null,
        };
      })
    );

    res.json(countersWithServing);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/staff/:departmentId/queue - Return waiting QueueTokens grouped by counter
router.get('/staff/:departmentId/queue', async (req, res) => {
  try {
    const { departmentId } = req.params;
    const counters = await Counter.find({ department: departmentId });

    const groupedQueue = {};
    counters.forEach((c) => {
      groupedQueue[c.name] = [];
    });

    const waitingTokens = await QueueToken.find({
      department: departmentId,
      status: 'Waiting',
    })
      .sort({ createdAt: 1 })
      .populate('counter', 'name');

    waitingTokens.forEach((token) => {
      const counterName = token.counter?.name;
      if (counterName) {
        if (!groupedQueue[counterName]) {
          groupedQueue[counterName] = [];
        }
        groupedQueue[counterName].push(token);
      }
    });

    res.json(groupedQueue);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/staff/:counterId/call-next - Call next waiting token for counter
router.post('/staff/:counterId/call-next', async (req, res) => {
  try {
    const { counterId } = req.params;

    const token = await QueueToken.findOne({
      counter: counterId,
      status: 'Waiting',
    }).sort({ createdAt: 1 });

    if (!token) {
      return res.status(404).json({ success: false, message: 'No waiting tokens for this counter' });
    }

    token.status = 'Serving';
    await token.save();

    return res.json({
      success: true,
      token,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/staff/:counterId/complete - Mark currently serving token complete
router.post('/staff/:counterId/complete', async (req, res) => {
  try {
    const { counterId } = req.params;

    const counter = await Counter.findById(counterId);
    if (!counter) {
      return res.status(404).json({ success: false, message: 'Counter not found' });
    }

    const servingToken = await QueueToken.findOne({
      counter: counterId,
      status: 'Serving',
    });

    if (servingToken) {
      servingToken.status = 'Completed';
      await servingToken.save();
    }

    counter.currentQueueCount = Math.max(0, counter.currentQueueCount - 1);
    await counter.save();

    return res.json({
      success: true,
      message: 'Token completed successfully',
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
