// Error handling middleware (to be implemented in Phase 2)

module.exports = {
  errorHandler: (err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  },
};
