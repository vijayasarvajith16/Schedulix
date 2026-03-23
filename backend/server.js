require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

// Import DB config
const connectDB = require('./config/db');

// Import custom middleware
const logger = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');

// Import routes (Modular Routing via express.Router())
const authRoutes = require('./routes/auth');
const facultyRoutes = require('./routes/faculty');
const subjectRoutes = require('./routes/subjects');
const batchRoutes = require('./routes/batches');
const mappingRoutes = require('./routes/mappings');
const timetableRoutes = require('./routes/timetable');

// Connect to MongoDB
connectDB();

// ── Express App Initialization ──────────────────────────────────────────────
const app = express();

// ── Body Parsing Middleware ─────────────────────────────────────────────────
app.use(express.json());                            // express.json()
app.use(express.urlencoded({ extended: true }));    // express.urlencoded()

// ── CORS ────────────────────────────────────────────────────────────────────
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:4200', 'http://localhost:55608', 'https://schedulix-register.netlify.app'],
    credentials: true,
}));

// ── HTTP Logging (morgan) ───────────────────────────────────────────────────
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// ── Custom Logger Middleware ─────────────────────────────────────────────────
app.use(logger);

// ── Static File Serving ──────────────────────────────────────────────────────
// Serve React build (copied to backend/public during build)
app.use(express.static(path.join(__dirname, 'public')));
// Serve uploaded/public assets
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// ── API Routes (Routing: app.use()) ─────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/batches', batchRoutes);
app.use('/api/mappings', mappingRoutes);
app.use('/api/timetable', timetableRoutes);

// ── Health Check Route ───────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
    res.status(200).json({ success: true, message: 'Timetable API is running', timestamp: new Date() });
});

// ── Serve React for all non-API routes (client-side routing support) ─────────
const fs = require('fs');
app.get(/^(?!\/api).*/, (req, res) => {
    const htmlPath = path.join(__dirname, 'public', 'index.html');
    if (fs.existsSync(htmlPath)) {
        res.sendFile(htmlPath);
    } else if (process.env.NODE_ENV === 'production') {
        res.status(500).send('Frontend build not found. The Render build step failed or the public folder is missing.');
    } else {
        // In dev: redirect to React dev server
        res.redirect('http://localhost:3000');
    }
});

// ── Global Error Handling Middleware ─────────────────────────────────────────
app.use(errorHandler);

// ── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`\nServer running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    console.log(`API: http://localhost:${PORT}/api`);
    console.log(`Health: http://localhost:${PORT}/api/health\n`);
});

module.exports = app;
