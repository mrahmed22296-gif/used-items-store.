sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;
    for (const msg of messages) {
        if (!msg.message || msg.key.fromMe) continue;
        
        const senderPhone = msg.key.remoteJid;
        
        // استخراج النص بجميع الطرق الممكنة لضمان عدم تجاهل أي رسالة
        const messageText = msg.message.conversation || 
                            msg.message.extendedTextMessage?.text || 
                            msg.message.imageMessage?.caption;
                            
        if (!messageText) continue;

        console.log(`تم استلام رسالة من ${senderPhone}: ${messageText}`);

        try {
            const aiResponse = await openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [
                    { role: 'system', content: 'أنت مساعد افتراضي ودود ومحترف لخدمة العملاء. أجب على استفسارات العملاء بدقة باللغة العربية.' },
                    { role: 'user', content: messageText }
                ],
            });
            
            const replyText = aiResponse.choices[0].message.content;
            console.log(`الرد المولّد من الذكاء الاصطناعي: ${replyText}`);
            
            await sock.sendMessage(senderPhone, { text: replyText });
            console.log('تم إرسال الرد بنجاح!');
        } catch (error) {
            console.error('خطأ تفصيلي أثناء توليد أو إرسال الرد:', error);
        }
    }
});
