import express from 'express';
import Department from '../models/Department.js';
import Counter from '../models/Counter.js';
import QueueToken from '../models/QueueToken.js';
import Student from '../models/Student.js';

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

// POST /api/students/register - New student registration (Sign Up)
router.post('/students/register', async (req, res) => {
  try {
    const { studentId, name, email, department } = req.body;

    if (!studentId || !studentId.trim()) {
      return res.status(400).json({ success: false, message: 'Student Roll No / ID is required' });
    }
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Student Full Name is required' });
    }

    const cleanId = studentId.trim();
    const cleanName = name.trim();

    // Check if student already registered
    const existingStudent = await Student.findOne({ studentId: cleanId });
    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: 'This Student ID is already registered! Please use Sign In.',
      });
    }

    const newStudent = await Student.create({
      studentId: cleanId,
      name: cleanName,
      email: email ? email.trim() : '',
      department: department ? department.trim() : 'General',
    });

    return res.json({
      success: true,
      message: 'Registration successful!',
      student: {
        studentId: newStudent.studentId,
        name: newStudent.name,
        email: newStudent.email,
        department: newStudent.department,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/students/login - Student login (Sign In)
router.post('/students/login', async (req, res) => {
  try {
    const { studentId, name } = req.body;

    if (!studentId || !studentId.trim()) {
      return res.status(400).json({ success: false, message: 'Student Roll No / ID is required' });
    }

    const cleanId = studentId.trim();
    const cleanName = name ? name.trim() : 'Student';

    // Find or create student record for quick access
    let student = await Student.findOne({ studentId: cleanId });
    if (!student && name) {
      student = await Student.create({
        studentId: cleanId,
        name: cleanName,
      });
    }

    return res.json({
      success: true,
      student: {
        studentId: student ? student.studentId : cleanId,
        name: student ? student.name : cleanName,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
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

    const today = new Date().toISOString().split('T')[0];

    // Daily reset check: Atomically reset token sequence to 0 if lastResetDate is not today
    if (department.lastResetDate !== today) {
      const resetDept = await Department.findOneAndUpdate(
        { _id: departmentId, lastResetDate: { $ne: today } },
        { $set: { tokenSequence: 0, lastResetDate: today } },
        { returnDocument: 'after' }
      );
      if (resetDept) {
        // Reset active counter queue counts on a new day
        await Counter.updateMany({ department: departmentId }, { $set: { currentQueueCount: 0 } });
        selectedCounter.currentQueueCount = 0;
      }
    }

    let newToken;
    let tokenNumber;
    let updatedCounter;
    const maxRetries = 3;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        // Atomically increment department token sequence to prevent race conditions
        const updatedDept = await Department.findByIdAndUpdate(
          departmentId,
          { $inc: { tokenSequence: 1 } },
          { returnDocument: 'after' }
        );

        const nextNumber = updatedDept.tokenSequence;
        tokenNumber = `${department.code}-${String(nextNumber).padStart(3, '0')}`;

        // Increment selected counter's queue count atomically
        updatedCounter = await Counter.findByIdAndUpdate(
          selectedCounter._id,
          { $inc: { currentQueueCount: 1 } },
          { returnDocument: 'after' }
        );

        // Create QueueToken document with today's date
        newToken = await QueueToken.create({
          tokenNumber,
          department: departmentId,
          counter: selectedCounter._id,
          status: 'Waiting',
          date: today,
          studentName: studentName || 'Guest Student',
          studentId: studentId || 'N/A',
        });

        break;
      } catch (err) {
        if (updatedCounter) {
          await Counter.findByIdAndUpdate(selectedCounter._id, { $inc: { currentQueueCount: -1 } });
          updatedCounter = null;
        }

        if (err.code === 11000 && attempt < maxRetries - 1) {
          continue;
        }
        throw err;
      }
    }

    return res.json({
      success: true,
      tokenNumber,
      counter: selectedCounter.name,
      position: updatedCounter.currentQueueCount,
      studentName: newToken.studentName,
      studentId: newToken.studentId,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/queue/leave - Leave / cancel student queue token
router.post('/queue/leave', async (req, res) => {
  try {
    const { tokenNumber, departmentId } = req.body;

    if (!tokenNumber) {
      return res.status(400).json({ success: false, message: 'tokenNumber is required' });
    }

    const today = new Date().toISOString().split('T')[0];

    // Find waiting token for today
    const token = await QueueToken.findOne({
      tokenNumber,
      ...(departmentId ? { department: departmentId } : {}),
      status: 'Waiting',
      date: today,
    });

    if (!token) {
      return res.status(404).json({
        success: false,
        message: 'Token not found or is no longer in waiting state.',
      });
    }

    // Update status to Cancelled
    token.status = 'Cancelled';
    await token.save();

    // Decrement assigned counter's currentQueueCount if greater than 0
    if (token.counter) {
      await Counter.updateOne(
        { _id: token.counter, currentQueueCount: { $gt: 0 } },
        { $inc: { currentQueueCount: -1 } }
      );
    }

    return res.json({
      success: true,
      message: 'Successfully left the queue',
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/departments/:departmentId/reset-sequence - Manual reset of daily token sequence
router.post('/departments/:departmentId/reset-sequence', async (req, res) => {
  try {
    const { departmentId } = req.params;
    const today = new Date().toISOString().split('T')[0];

    const updatedDept = await Department.findByIdAndUpdate(
      departmentId,
      { $set: { tokenSequence: 0, lastResetDate: today } },
      { returnDocument: 'after' }
    );

    if (!updatedDept) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }

    await Counter.updateMany({ department: departmentId }, { $set: { currentQueueCount: 0 } });

    return res.json({
      success: true,
      message: `Token sequence reset to 0 for department ${updatedDept.name}`,
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

    const token = await QueueToken.findOneAndUpdate(
      { counter: counterId, status: 'Waiting' },
      { status: 'Serving' },
      { returnDocument: 'after', sort: { createdAt: 1 } }
    );

    if (!token) {
      return res.status(404).json({ success: false, message: 'No waiting tokens for this counter' });
    }

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

    const servingToken = await QueueToken.findOneAndUpdate(
      { counter: counterId, status: 'Serving' },
      { status: 'Completed' },
      { returnDocument: 'after' }
    );

    if (servingToken) {
      await Counter.updateOne(
        { _id: counterId, currentQueueCount: { $gt: 0 } },
        { $inc: { currentQueueCount: -1 } }
      );
    }

    return res.json({
      success: true,
      message: 'Token completed successfully',
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
