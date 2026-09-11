const { Op } = require('sequelize');
const { Notification } = require('../models');

// GET /api/notifications/:userId  (own id enforced via route guard)
async function listNotifications(req, res, next) {
  try {
    const userId = req.params.userId;
    const items = await Notification.findAll({
      where: { [Op.or]: [{ userId }, { userId: 'all' }] },
      order: [['date', 'DESC']],
      limit: 200,
    });
    res.json(items);
  } catch (err) { next(err); }
}

// PUT /api/notifications/:userId/read
async function markAllRead(req, res, next) {
  try {
    const userId = req.params.userId;
    await Notification.update({ read: true }, { where: { [Op.or]: [{ userId }, { userId: 'all' }] } });
    res.json({});
  } catch (err) { next(err); }
}

module.exports = { listNotifications, markAllRead };
