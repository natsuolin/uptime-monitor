const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Listar todos os sites com o último tempo de resposta
router.get('/sites', (req, res) => {
    const query = `
        SELECT s.*, 
        (SELECT response_time FROM logs WHERE site_id = s.id ORDER BY id DESC LIMIT 1) as last_response_time
        FROM sites s
    `;
    db.all(query, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Cadastrar novo site
router.post('/sites', (req, res) => {
    const { name, url, webhook_url } = req.body;
    if (!name || !url) return res.status(400).json({ error: 'Nome e URL são obrigatórios.' });

    db.run(
        `INSERT INTO sites (name, url, webhook_url) VALUES (?, ?, ?)`,
        [name, url, webhook_url],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: this.lastID, name, url, status: 'PENDING' });
        }
    );
});

// Deletar site
router.delete('/sites/:id', (req, res) => {
    db.run(`DELETE FROM sites WHERE id = ?`, req.params.id, function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

// Histórico de logs de um site específico
router.get('/sites/:id/logs', (req, res) => {
    db.all(
        `SELECT * FROM logs WHERE site_id = ? ORDER BY id DESC LIMIT 10`,
        req.params.id,
        (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows);
        }
    );
});

module.exports = router;