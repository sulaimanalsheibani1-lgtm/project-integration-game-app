import express from 'express';
const router = express.Router();

// @desc    Get all scenarios
// @route   GET /api/scenarios
// @access  Public
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Get scenarios endpoint',
    data: []
  });
});

// @desc    Get scenario by ID
// @route   GET /api/scenarios/:id
// @access  Public
router.get('/:id', (req, res) => {
  res.json({
    success: true,
    message: 'Get scenario details endpoint',
    data: { id: req.params.id }
  });
});

// @desc    Create scenario (admin/instructor only)
// @route   POST /api/scenarios
// @access  Private/Admin
router.post('/', (req, res) => {
  res.json({
    success: true,
    message: 'Create scenario endpoint',
    data: {}
  });
});

export default router;