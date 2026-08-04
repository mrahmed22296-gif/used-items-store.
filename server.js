const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const { GoogleGenAI } = require('@google/genai');
const express = require('express');
const cors = require('cors');
const pino = require('pino');
const path = require('path');

require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// خدمة الملفات الثابتة وتوجيه الصفحة الرئيسية لملف index.html مباشرة
app.use(express.static(path.join(__dirname)));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// تمرير مفتاح Gemini بشكل صريح ومباشر
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

let sock;
let connectionStatus = 'DISCONNECTED';
let latestQR = '';

async function connectToWhatsApp() {
    try {
        const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
        
        sock = makeWASocket({
            auth: state,
            logger: pino({ level: 'silent' }),
            printQRInTerminal: true,
            browser: ["Ubuntu", "Chrome", "20.04"]
        });

        sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect, qr } = update;

            if (qr) {
                latestQR = qr;
            }

            if (connection === 'close') {
                const shouldReconnect = (lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut;
                connectionStatus = 'DISCONNECTED';
                latestQR = '';
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
                const messageText = msg.message.conversation || 
                                    msg.message.extendedTextMessage?.text || 
                                    msg.message.imageMessage?.caption;
                                    
                if (!messageText) continue;

                console.log(`تم استلام رسالة من ${senderPhone}: ${messageText}`);

                try {
                    const response = await ai.models.generateContent({
                        model: 'gemini-1.5-flash',
                        contents: [
                            { role: 'user', parts: [{ text: `أنت مساعد افتراضي ودود ومحترف لخدمة العملاء. أجب على رسالة العميل التالية باللغة العربية باحترافية: ${messageText}` }] }
                        ]
                    });

                    const replyText = response.text;
                    console.log(`الرد المولّد من Gemini: ${replyText}`);
                    
                    await sock.sendMessage(senderPhone, { text: replyText });
                    console.log('تم إرسال الرد بنجاح!');
                } catch (error) {
                    console.error('خطأ أثناء توليد أو إرسال الرد عبر Gemini:', error);
                }
            }
        });
    } catch (e) {
        console.error('خطأ في الاتصال:', e);
    }
}

// نقطة النهاية (API) لجلب الحالة والـ QR للواجهة الأمامية
app.get('/api/status', (req, res) => {
    res.json({
        status: connectionStatus,
        qr: latestQR
    });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`الخادم يعمل على المنفذ ${PORT}`);
    connectToWhatsApp();
});
