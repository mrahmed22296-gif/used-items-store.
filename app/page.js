export default function Home() {
  const products = [
    {
      id: 1,
      title: "أداة منزلية / جهاز فحص",
      price: "25 د.ك",
      category: "أدوات",
      condition: "بحالة ممتازة، تم الفحص والتنظيف",
      image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&auto=format&fit=crop&q=60",
      whatsapp: "965XXXXXXXX"
    },
    {
      id: 2,
      title: "طقم أثاث منزلي مصغر",
      price: "15 د.ك",
      category: "أثاث",
      condition: "بحالة جيدة جداً",
      image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&auto=format&fit=crop&q=60",
      whatsapp: "965XXXXXXXX"
    }
  ];

  return (
    <div dir="rtl" style={{ fontFamily: 'Tahoma, sans-serif', backgroundColor: '#f8fafc', minHeight: '100vh', margin: 0, padding: 0 }}>
      {/* رأس الصفحة */}
      <header style={{ backgroundColor: '#1e293b', color: 'white', padding: '40px 20px', textAlign: 'center', borderBottom: '4px solid #16a34a' }}>
        <h1 style={{ margin: '0 0 10px 0', fontSize: '32px', fontWeight: 'bold' }}>سوق المنتجات المستعملة</h1>
        <p style={{ margin: 0, color: '#94a3b8', fontSize: '16px' }}>أفضل العروض والصفقات للسلع بحالة ممتازة وبأسعار تنافسية</p>
      </header>

      {/* محتوى المنتجات */}
      <main style={{ maxWidth: '1200px', margin: '30px auto', padding: '0 20px' }}>
        <h2 style={{ fontSize: '24px', color: '#1e293b', marginBottom: '20px', borderRight: '6px solid #16a34a', paddingRight: '10px' }}>المنتجات المتاحة</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          {products.map(product => (
            <div key={product.id} style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', overflow: 'hidden', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
              <img src={product.image} alt={product.title} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                <span style={{ backgroundColor: '#e0f2fe', color: '#0369a1', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', width: 'fit-content', marginBottom: '10px' }}>{product.category}</span>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', color: '#1e293b' }}>{product.title}</h3>
                <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '15px' }}>الحالة: {product.condition}</p>
                <div style={{ color: '#dc2626', fontWeight: 'bold', fontSize: '22px', marginBottom: '20px', marginTop: 'auto' }}>{product.price}</div>
                <a 
                  href={`https://wa.me/${product.whatsapp}?text=مرحباً، أنا مهتم بشراء ${product.title}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ display: 'block', backgroundColor: '#16a34a', color: 'white', textAlign: 'center', padding: '12px', textDecoration: 'none', borderRadius: '8px', fontWeight: 'bold', transition: 'background 0.2s' }}
                >
                  تواصل للشراء عبر واتساب
                </a>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
