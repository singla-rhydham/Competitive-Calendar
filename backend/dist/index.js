"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const express_session_1 = __importDefault(require("express-session"));
const passport_1 = __importDefault(require("passport"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const auth_js_1 = __importDefault(require("./routes/auth.js"));
const subscription_js_1 = __importDefault(require("./routes/subscription.js"));
const passport_js_1 = require("./config/passport.js");
const contestUpdater_js_1 = __importDefault(require("./services/contestUpdater.js"));
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Middleware
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Session configuration
app.use((0, express_session_1.default)({
    secret: process.env.SESSION_SECRET || 'fallback-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));
// Passport middleware
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
// Initialize Passport strategies
(0, passport_js_1.initializePassport)();
// Connect to MongoDB
mongoose_1.default.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/contest-calendar')
    .then(() => console.log('Connected to MongoDB'))
    .catch((error) => console.error('MongoDB connection error:', error));
// Routes
app.use('/auth', auth_js_1.default);
app.use('/api', subscription_js_1.default);
// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
});
// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    // Initialize contest updater (starts the cron job)
    console.log('Initializing contest updater...');
    // Trigger initial contest update
    setTimeout(() => {
        contestUpdater_js_1.default.triggerUpdate();
    }, 5000); // Wait 5 seconds after server start
});
