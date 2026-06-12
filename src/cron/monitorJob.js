const cron = require('node-cron');
const axios = require('axios');
const db = require('../config/database');

function startMonitoring() {
    cron.schedule('* * * * *', () => {
        console.log('🔄 ...');

        db.all('SELECT * FROM sites', [], (err, rows) => {
            if (err) return console.error(err.message);

            rows.forEach(site => {
                const startTime = Date.now();

                axios.head(site.url, { 
                    timeout: 5000, // 5 segundos é suficiente para um ping de HEAD
                    headers: {
                        'User-Agent': 'UptimePulseBot/1.0 (+https://github.com)'
                    }
                })
                .then(response => {
                    const responseTime = Date.now() - startTime;
                    atualizarStatus(site, 'ONLINE', responseTime);
                })
                .catch(error => {
                    
                    if (error.response && error.response.status === 405) {
                        axios.get(site.url, { timeout: 5000, headers: { 'User-Agent': 'UptimePulseBot/1.0' } })
                            .then(response => {
                                const responseTime = Date.now() - startTime;
                                atualizarStatus(site, 'ONLINE', responseTime);
                            })
                            .catch(getErr => {
                                const responseTime = Date.now() - startTime;
                                atualizarStatus(site, 'OFFLINE', responseTime, getErr.message);
                            });
                    } else {
                        const responseTime = Date.now() - startTime;
                        atualizarStatus(site, 'OFFLINE', responseTime, error.message);
                    }
                });
            });
        });
    });
}

function atualizarStatus(site, novoStatus, responseTime, errorMsg = '') {
    const agora = new Date().toISOString();

   
    db.run(
        `UPDATE sites SET status = ?, last_checked = ? WHERE id = ?`,
        [novoStatus, agora, site.id],
        (err) => {
            if (err) return console.error(err.message);

            // 2. Salva o registro atual na tabela de logs (Histórico)
            db.run(
                `INSERT INTO logs (site_id, status, response_time, checked_at) VALUES (?, ?, ?, ?)`,
                [site.id, novoStatus, responseTime, agora],
                (insertErr) => {
                    if (insertErr) return console.error(insertErr.message);

                    // 3. Só dispara o webhook se o status mudou (ONLINE <-> OFFLINE) de fato
                    if (site.status !== 'PENDING' && site.status !== novoStatus) {
                        
                        // Busca o histórico recente de logs para anexar ao corpo do Webhook
                        db.all(
                            `SELECT status, response_time, checked_at FROM logs WHERE site_id = ? ORDER BY id DESC LIMIT 10`,
                            [site.id],
                            (queryErr, logs) => {
                                if (!queryErr) {
                                    notificarWebhook(site, novoStatus, responseTime, errorMsg, logs);
                                }
                            }
                        );
                    }
                }
            );
        }
    );
}

function notificarWebhook(site, status, responseTime, errorMsg, logs) {
    if (!site.webhook_url) return;

    const emoji = status === 'ONLINE' ? '🟩' : '🟥';
    
    // Monta a string de texto com a listagem das últimas checagens
    let historicoTexto = '';
    if (logs && logs.length > 0) {
        logs.forEach(log => {
            const hora = new Date(log.checked_at).toLocaleTimeString();
            const statusEmoji = log.status === 'ONLINE' ? '🟢' : '🔴';
            historicoTexto += `> ${statusEmoji} [${hora}] — ${log.response_time}ms\n`;
        });
    } else {
        historicoTexto = '> Nenhuma checagem prévia registrada.';
    }

    // Estrutura de Payload rica compatível com Discord (Embeds) e coletores comuns de JSON
    const payload = {
        content: `${emoji} **Alerta de Disponibilidade | UptimePulse**`,
        embeds: [
            {
                title: `O site "${site.name}" mudou para: **${status}**`,
                url: site.url,
                color: status === 'ONLINE' ? 3066993 : 15158332, // Verde (#2ECC71) ou Vermelho (#E74C3C) em decimal
                fields: [
                    {
                        name: "🔗 URL do Site",
                        value: site.url,
                        inline: false
                    },
                    {
                        name: "⏱️ Latência da Resposta",
                        value: `${responseTime}ms`,
                        inline: true
                    },
                    {
                        name: "📊 Histórico de Monitoramento (Últimos 10 logs)",
                        value: historicoTexto,
                        inline: false
                    }
                ],
                footer: {
                    text: `UptimePulse Worker • ${new Date().toLocaleTimeString()}`
                }
            }
        ]
    };

    if (errorMsg && status === 'OFFLINE') {
        payload.embeds[0].fields.splice(2, 0, {
            name: "⚠️ Causa do Erro",
            value: `\`${errorMsg}\``,
            inline: false
        });
    }

    axios.post(site.webhook_url, payload)
        .catch(err => console.error(`[Webhook Error] Falha ao enviar para ${site.name}:`, err.message));
}

module.exports = startMonitoring;
