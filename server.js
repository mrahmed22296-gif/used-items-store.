const qrcode = require('qrcode');

// تعديل مسار الصفحة الرئيسية لعرض الـ QR بصورة مرئية مباشرة
app.get('/', async (req, res) => {
    if (connectionStatus === 'CONNECTED') {
        return res.send('<h1>البوت متصل بنجاح مع واتساب! 🎉</h1>');
    }
    if (!latestQR) {
        return res.send('<h1>جاري توليد رمز QR، يرجى تحديث الصفحة بعد قليل...</h1>');
    }
    try {
        const qrImage = await qrcode.toDataURL(latestQR);
        res.send(`
            <div style="text-align:center; margin-top:50px;">
                <h2>امسح رمز الـ QR لربط واتساب</h2>
                <img src="${qrImage}" alt="WhatsApp QR Code" style="width:300px;height:300px;" />
                <p>قم بتحديث الصفحة إذا لم يظهر أو انقطع الاتصال.</p>
            </div>
        `);
    } catch (err) {
        res.status(500).send('خطأ في توليد صورة الباركود');
    }
});
