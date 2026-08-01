import { products } from "@/data/products";

export default function Home() {
  return (
    <div dir="rtl" className="min-h-screen bg-gray-50 font-sans">
      {/* رأس الصفحة */}
      <header className="bg-slate-800 text-white py-8 text-center shadow-md">
        <h1 className="text-3xl font-bold mb-2">سوق المنتجات المستعملة</h1>
        <p className="text-gray-300">أفضل العروض والصفقات للسلع بحالة ممتازة</p>
      </header>

      {/* محتوى المنتجات */}
      <main className="max-w-6xl mx-auto p-6">
        <h2 className="text-2xl font-semibold mb-6 text-slate-700">المنتجات المتاحة حالياً</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 flex flex-col">
              <img src={product.image} alt={product.title} className="w-full h-48 object-cover" />
              <div className="p-4 flex flex-col flex-grow">
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded w-max mb-2">{product.category}</span>
                <h3 className="text-lg font-bold text-slate-800 mb-1">{product.title}</h3>
                <p className="text-sm text-gray-600 mb-3">{product.condition}</p>
                <div className="text-red-600 font-bold text-xl mb-4 mt-auto">{product.price}</div>
                <a 
                  href={`https://wa.me/${product.whatsapp}?text=مرحباً، أنا مهتم بشراء ${product.title}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block text-center bg-green-600 hover:bg-green-700 text-white py-2 rounded-md transition font-medium"
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
