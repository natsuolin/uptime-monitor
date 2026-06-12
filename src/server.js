const express = require('express');
const path = require('path');
const apiRoutes = require('./routes/api');
const startMonitoring = require('./cron/monitorJob');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Rotas da API
app.use('/api', apiRoutes);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/index.html'));
});

startMonitoring();

app.listen(PORT, () => {
    console.log(`🚀 http://localhost:${PORT}`);
});
