const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const { OpenAI } = require('openai');
const express = require('express');
const cors = require('cors');
const pino = require('pino');

require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, 
});

let sock;
let connectionStatus = 'DISCONNECTED';
let latestQR = '';

async function connectToWhatsApp() {
    try {
        const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
        
        sock = makeWASocket({
            auth: state,
            logger: pino({ level: 'silent' }),
            printQRInTerminal: false,
            browser: ["Chrome", "Macintosh", "10.15.7"]
        });

        sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect, qr } = update;
            
            if (qr) {
                latestQR = qr;
                console.log('تم استلام رمز QR جديد وجاهز للعرض.');
            }

            if (connection === 'close') {
                const shouldReconnect = (lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut;
                connectionStatus = 'DISCONNECTED';
                latestQR = '';
                console.log('انقطع الاتصال، جاري إعادة المحاولة...', shouldReconnect);
                if (shouldReconnect) {
                    setTimeout(connectToWhatsApp, 3000);
                }
            } else if (connection === 'open') {
                connectionStatus = 'CONNECTED';
                latestQR = '';
                console.log('تم اتصال واتساب بنجاح!');
            }
        });

        sock.ev.on('creds.update', saveCreds);

        sock.ev.on('messages.upsert', async ({ messages, type }) => {
            if (type !== 'notify') return;
            for (const msg of messages) {
                if (!msg.message || msg.key.fromMe) continue;
                const senderPhone = msg.key.remoteJid;
                const messageText = msg.message.conversation || msg.message.extendedTextMessage?.text;
                if (!messageText) continue;

                try {
                    const aiResponse = await openai.chat.completions.create({
                        model: 'gpt-4o-mini',
                        messages: [
                            { role: 'system', content: 'أنت مساعد افتراضي ودود ومحترف لخدمة العملاء. أجب على استفسارات العملاء بدقة باللغة العربية.' },
                            { role: 'user', content: messageText }
                        ],
                    });
                    const replyText = aiResponse.choices[0].message.content;
                    await sock.sendMessage(senderPhone, { text: replyText });
                } catch (error) {
                    console.error('خطأ في الرد الآلي:', error);
                }
            }
        });
    } catch (e) {
        console.error('خطأ في تهيئة واتساب:', e);
    }
}

app.get('/api/status', (req, res) => {
    res.json({ status: connectionStatus, qr: latestQR });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`الخادم يعمل بنجاح على المنفذ ${PORT}`);
    connectToWhatsApp();
});
