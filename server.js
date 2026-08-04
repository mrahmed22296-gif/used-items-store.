const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const { OpenAI } = require('openai');
const express = require('http'); // أو استخدام express مباشرة
const expressApp = require('express');
const cors = require('cors');
const pino = require('pino');

const app = expressApp();
app.use(expressApp.json());
app.use(cors());

const server = express.createServer(app);

// تهيئة OpenAI (يُفضل وضع مفتاح API الخاص بك في ملف بيئة .env)
const openai = new OpenAI({
    apiKey: 'YOUR_OPENAI_API_KEY', 
});

let sock;
let connectionStatus = 'DISCONNECTED';

// دالة بدء تشغيل واتساب وتوليد الجلسة
async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
    
    sock = makeWASocket({
        auth: state,
        logger: pino({ level: 'silent' }),
        printQRInTerminal: true // سيظهر رمز QR في التيرمنال لمسحه بالهاتف
    });

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;
        
        if (qr) {
            console.log('امسح رمز الـ QR التالي من تطبيق واتساب الخاص بك:');
            // يمكنك هنا إرسال الـ QR للواجهة الأمامية عبر WebSocket أو تخزينه لعرضه بالمتصفح
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

    // استقبال الرسائل والرد عليها بالذكاء الاصطناعي
    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type !== 'notify') return;

        for (const msg of messages) {
            if (!msg.message || msg.key.fromMe) continue;

            const senderPhone = msg.key.remoteJid;
            const messageText = msg.message.conversation || msg.message.extendedTextMessage?.text;

            if (!messageText) continue;

            console.log(`رسالة واردة من ${senderPhone}: ${messageText}`);

            try {
                // إرسال الرسالة إلى OpenAI لتوليد الرد الآلي
                const aiResponse = await openai.chat.completions.create({
                    model: 'gpt-4o-mini',
                    messages: [
                        { role: 'system', content: 'أنت مساعد افتراضي ودود ومحترف لخدمة العملاء. أجب على استفسارات العملاء بدقة باللغة العربية.' },
                        { role: 'user', content: messageText }
                    ],
                });

                const replyText = aiResponse.choices[0].message.content;

                // إرسال الرد تلقائياً إلى العميل عبر واتساب
                await sock.sendMessage(senderPhone, { text: replyText });
                console.log(`تم الرد بنجاح على ${senderPhone}`);

            } catch (error) {
                console.error('خطأ أثناء توليد الرد بالذكاء الاصطناعي:', error);
            }
        }
    });
}

// نقطة نهاية (API) للواجهة الأمامية لمعرفة حالة الاتصال
app.get('/api/status', (req, res) => {
    res.json({ status: connectionStatus });
});

// بدء تشغيل الخادم
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`الخادم يعمل على المنفذ ${PORT}`);
    connectToWhatsApp();
});
