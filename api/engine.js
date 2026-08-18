// ==========================================
// GAIA VERCEL MULTIMEDIA ENGINE (SECURE)
// ==========================================

export default async function handler(req, res) {
    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

    const { action, offset, file_id } = req.query;

    // ------------------------------------------
    // 1. TRANSMIT SIGNAL (Website -> Telegram)
    // ------------------------------------------
    if (action === 'send' && req.method === 'POST') {
        const { name, email, message, fileData, fileName, fileType } = req.body || {};
        
        try {
            // A) MIT DATEI / BILD
            if (fileData) {
                const base64Clean = fileData.split(',')[1] || fileData;
                const buffer = Buffer.from(base64Clean, 'base64');
                const blob = new Blob([buffer], { type: fileType || 'application/octet-stream' });

                const formData = new FormData();
                formData.append('chat_id', CHAT_ID);
                formData.append('caption', `⚡ <b>NEUE MEDIA TRANSMISSION</b> ⚡\n\n<b>Alias:</b> ${name || 'Anonym'}\n<b>Frequenz:</b> ${email || 'Keine'}\n\n<b>Message:</b>\n${message || ''}`);
                formData.append('parse_mode', 'HTML');

                const isPhoto = fileType && fileType.startsWith('image/');
                const endpoint = isPhoto ? 'sendPhoto' : 'sendDocument';
                formData.append(isPhoto ? 'photo' : 'document', blob, fileName || 'file');

                const telegramRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/${endpoint}`, {
                    method: 'POST',
                    body: formData
                });
                const data = await telegramRes.json();
                return res.status(200).json(data);
            } 
            
            // B) REINER TEXT
            else {
                const text = `⚡ <b>NEUES GAIA SIGNAL</b> ⚡\n\n<b>Alias:</b> ${name || 'Anonym'}\n<b>Frequenz:</b> ${email || 'Keine'}\n\n<b>Message:</b>\n${message || ''}`;
                const telegramRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        chat_id: CHAT_ID,
                        text: text,
                        parse_mode: 'HTML'
                    })
                });
                const data = await telegramRes.json();
                return res.status(200).json(data);
            }
        } catch (error) {
            return res.status(500).json({ ok: false, error: error.message });
        }
    }

    // ------------------------------------------
    // 2. POLL REPLIES (Telegram -> Website)
    // ------------------------------------------
    if (action === 'poll') {
        try {
            const telegramRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getUpdates?offset=${offset || 0}`);
            const data = await telegramRes.json();
            return res.status(200).json(data);
        } catch (error) {
            return res.status(500).json({ ok: false, error: error.message });
        }
    }

    // ------------------------------------------
    // 3. IMAGE PROXY (Liefert Bilder sicher aus)
    // ------------------------------------------
    if (action === 'file' && file_id) {
        try {
            const fileInfoRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getFile?file_id=${file_id}`);
            const fileInfo = await fileInfoRes.json();

            if (fileInfo.ok && fileInfo.result.file_path) {
                const imgRes = await fetch(`https://api.telegram.org/file/bot${BOT_TOKEN}/${fileInfo.result.file_path}`);
                const arrayBuffer = await imgRes.arrayBuffer();
                const contentType = imgRes.headers.get('content-type') || 'image/jpeg';

                res.setHeader('Content-Type', contentType);
                res.setHeader('Cache-Control', 'public, max-age=86400');
                return res.status(200).send(Buffer.from(arrayBuffer));
            }
        } catch (error) {
            return res.status(500).json({ ok: false, error: error.message });
        }
    }

    return res.status(400).json({ ok: false, message: 'Invalid Action' });
}