const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const { GoogleGenAI } = require('@google/genai');
const pino = require('pino');

require('dotenv').config();

// تمرير مفتاح Gemini مباشرة
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function connectToWhatsApp() {
    try {
        const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
        
        const sock = makeWASocket({
            auth: state,
            logger: pino({ level: 'silent' }),
            printQRInTerminal: true, // يطبع رمز الـ QR مباشرة في السجلات
            browser: ["Ubuntu", "Chrome", "20.04"]
        });

        sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect } = update;

            if (connection === 'close') {
                const shouldReconnect = (lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut;
                console.log('انقطع الاتصال، جاري إعادة المحاولة...');
                if (shouldReconnect) {
                    setTimeout(connectToWhatsApp, 3000);
                }
            } else if (connection === 'open') {
                console.log('✅ تم اتصال واتساب بنجاح وجاهز لاستقبال الرسائل!');
            }
        });

        sock.ev.on('creds.update', saveCreds);

        // استقبال الرسائل والرد عليها بالذكاء الاصطناعي
        sock.ev.on('messages.upsert', async ({ messages, type }) => {
            if (type !== 'notify') return;
            for (const msg of messages) {
                if (!msg.message || msg.key.fromMe) continue;
                
                const senderPhone = msg.key.remoteJid;
                const messageText = msg.message.conversation || 
                                    msg.message.extendedTextMessage?.text || 
                                    msg.message.imageMessage?.caption;
                                    
                if (!messageText) continue;

                console.log(`📩 تم استلام رسالة من ${senderPhone}: ${messageText}`);

                try {
                    const response = await ai.models.generateContent({
                        model: 'gemini-1.5-flash',
                        contents: [
                            { role: 'user', parts: [{ text: `أنت مساعد افتراضي ودود ومحترف. أجب على رسالة العميل التالية باللغة العربية باختصار واحترافية: ${messageText}` }] }
                        ]
                    });

                    const replyText = response.text;
                    console.log(`🤖 الرد المولّد من Gemini: ${replyText}`);
                    
                    await sock.sendMessage(senderPhone, { text: replyText });
                    console.log('📤 تم إرسال الرد بنجاح!');
                } catch (error) {
                    console.error('❌ خطأ أثناء توليد أو إرسال الرد عبر Gemini:', error);
                }
            }
        });
    } catch (e) {
        console.error('❌ خطأ في الاتصال:', e);
    }
}

connectToWhatsApp();
