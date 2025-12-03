"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_1 = __importDefault(require("./routes/auth"));
const database_1 = __importDefault(require("./config/database"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'Server is running!' });
});
database_1.default.authenticate()
    .then(() => {
    console.log("Database connected successfully");
    return database_1.default.sync({ force: false });
})
    .catch((err) => {
    console.error("Database connection failed:", err);
});
// Auth routes
app.use('/api/auth', auth_1.default);
app.listen(PORT, () => {
    console.log('Server is running on port ' + PORT);
});
