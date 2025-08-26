import express from 'express';
const router = express.Router();

// @desc    Get global leaderboard
// @route   GET /api/leaderboards
// @access  Public
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Get leaderboard endpoint',
    data: []
  });
});

// @desc    Get leaderboard for specific scenario
// @route   GET /api/leaderboards/scenario/:scenarioId
// @access  Public
router.get('/scenario/:scenarioId', (req, res) => {
  res.json({
    success: true,
    message: 'Get scenario leaderboard endpoint',
    data: { scenarioId: req.params.scenarioId }
  });
});

export default router;