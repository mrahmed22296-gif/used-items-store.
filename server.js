const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const { OpenAI } = require('openai');
const express = require('express');
const cors = require('cors');
const pino = require('pino');

require('dotenv').config();

const app = express();
app.use(express.json());

// تفعيل CORS لجميع النطاقات والمواقع
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, 
});

let sock;
let connectionStatus = 'DISCONNECTED';
let latestPairingCode = '';

async function connectToWhatsApp() {
    try {
        const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
        
        sock = makeWASocket({
            auth: state,
            logger: pino({ level: 'silent' }),
            printQRInTerminal: false,
            browser: ["Mac OS", "Chrome", "10.15.7"]
        });

        // طلب كود الربط برقم الهاتف مباشرة إذا لم يكن الحساب مسجلاً
        if (!sock.authState.creds.registered) {
            setTimeout(async () => {
                try {
                    const phoneNumber = "96560085043"; // رقم هاتفك بصيغة دولية
                    const code = await sock.requestPairingCode(phoneNumber);
                    latestPairingCode = code;
                    console.log(`====================================`);
                    console.log(`🔑 رمز الربط الخاص بك هو: ${code}`);
                    console.log(`====================================`);
                } catch (err) {
                    console.error('خطأ أثناء طلب كود الربط:', err);
                }
            }, 6000);
        }

        sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect } = update;

            if (connection === 'close') {
                const shouldReconnect = (lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut;
                connectionStatus = 'DISCONNECTED';
                console.log('انقطع الاتصال، جاري إعادة المحاولة...');
                if (shouldReconnect) {
                    setTimeout(connectToWhatsApp, 3000);
                }
            } else if (connection === 'open') {
                connectionStatus = 'CONNECTED';
                latestPairingCode = '';
                console.log('تم اتصال واتساب بنجاح! 🎉');
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

// مسار لجلب حالة الاتصال ورمز الربط
app.get('/api/status', (req, res) => {
    res.json({ status: connectionStatus, pairingCode: latestPairingCode });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`الخادم يعمل بنجاح على المنفذ ${PORT}`);
    connectToWhatsApp();
});
