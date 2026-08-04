const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const { OpenAI } = require('openai');
const express = require('express');
const cors = require('cors');
const pino = require('pino');

require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// تهيئة OpenAI باستخدام متغير البيئة
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, 
});

let sock;
let connectionStatus = 'DISCONNECTED';

async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
    
    sock = makeWASocket({
        auth: state,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: true
    });

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;
        
        if (qr) {
            console.log('امسح رمز الـ QR التالي من تطبيق واتساب الخاص بك');
        }

        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut;
            connectionStatus = 'DISCONNECTED';
            console.log('تم انقطاع الاتصال، جاري إعادة المحاولة...', shouldReconnect);
            if (shouldReconnect) {
                connectToWhatsApp();
            }
        } else if (connection === 'open') {
            connectionStatus = 'CONNECTED';
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

            console.log(`رسالة واردة من ${senderPhone}: ${messageText}`);

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
                console.log(`تم الرد بنجاح على ${senderPhone}`);

            } catch (error) {
                console.error('خطأ أثناء توليد الرد بالذكاء الاصطناعي:', error);
            }
        }
    });
}

// نقطة نهاية لفحص حالة الخادم واتصال واتساب
app.get('/api/status', (req, res) => {
    res.json({ status: connectionStatus });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`الخادم يعمل بنجاح على المنفذ ${PORT}`);
    connectToWhatsApp();
});
