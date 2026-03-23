// Custom request logging middleware
const logger = (req, res, next) => {
    const now = new Date().toISOString();
    console.log(`[${now}] ${req.method} ${req.originalUrl} - IP: ${req.ip}`);
    next();
};

module.exports = logger;
