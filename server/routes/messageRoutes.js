const express = require('express');
const router = express.Router();
const { Message } = require('../models');
const { requireAuth } = require('../middleware/auth');

// GET /api/messages/:courseId — last 50 messages, so a student opening a
// course's discussion sees history, not just messages sent after they join.
router.get('/:courseId', requireAuth, async (req, res, next) => {
  try {
    const rows = await Message.findAll({ where: { courseId: req.params.courseId }, order: [['date', 'DESC']], limit: 50 });
    res.json(rows.reverse());
  } catch (err) { next(err); }
});

module.exports = router;
