"use client";
import { useState } from "react";
import { products } from "@/data/products";
// سنحتاج لاستيراد أيقونات بسيطة لتعزيز المظهر (اختياري)
// يمكنك إضافة هذا السطر في ملف global.css إذا لم تكن الأيقونات تعمل:
// @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&display=swap');

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState("الكل");

  // استخراج التصنيفات الفريدة
  const categories = ["الكل", ...new Set(products.map(p => p.category))];

  // تصفية المنتجات
  const filteredProducts = selectedCategory === "الكل"
    ? products
    : products.filter(p => p.category === selectedCategory);

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50 font-sans">
      {/* رأس الصفحة - تصميم عصري */}
      <header className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white py-12 px-6 shadow-lg border-b-4 border-green-500">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
          <div className="flex items-center gap-3 mb-4">
             <span className="bg-green-500 p-3 rounded-full text-slate-900 text-2xl">♻️</span>
             <h1 className="text-5xl font-extrabold tracking-tight text-white">سوق<span className='text-green-400'>المستعمل</span></h1>
          </div>
          <p className="text-xl text-gray-300 max-w-2xl mt-2 leading-relaxed">
            اكتشف أفضل العروض والصفقات على مجموعة واسعة من السلع المستعملة بحالة ممتازة وبأسعار تنافسية. تواصل مباشرة مع البائع.
          </p>
        </div>
      </header>

      {/* شريط التصنيفات - تصميم زر حديث */}
      <div className="max-w-7xl mx-auto px-6 py-10 sticky top-0 z-50 bg-gray-50/90 backdrop-blur-sm">
        <div className="flex gap-3 justify-center flex-wrap bg-white p-3 rounded-full shadow-md border border-gray-100">
          {categories.map((cat, index) => (
            <button
              key={index}
              onClick={() => setSelectedCategory(cat)}
              className={`px-6 py-3 rounded-full text-sm font-bold transition-all duration-300 ease-in-out transform hover:-translate-y-0.5 ${
                selectedCategory === cat
                  ? "bg-green-600 text-white shadow-lg scale-105"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900 border border-gray-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* محتوى المنتجات - تصميم شبكي احترافي */}
      <main className="max-w-7xl mx-auto px-6 pb-16">
        <h2 className="text-3xl font-bold text-slate-900 mb-10 border-r-8 border-green-400 pr-4">المنتجات المتاحة الآن ({filteredProducts.length})</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 flex flex-col transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 group">
              
              {/* صورة المنتج مع تأثير زوم */}
              <div className="relative overflow-hidden h-64">
                <img 
                  src={product.image} 
                  alt={product.title} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <span className="absolute top-4 right-4 text-xs bg-green-500/90 text-slate-900 font-extrabold px-3 py-1 rounded-full backdrop-blur-sm">
                  {product.category}
                </span>
              </div>

              {/* تفاصيل المنتج */}
              <div className="p-6 flex flex-col flex-grow bg-white relative">
                
                {/* حالة المنتج */}
                <p className="text-sm font-medium text-green-700 bg-green-50 px-3 py-1 rounded-full w-max mb-3 border border-green-100">
                  الحالة: {product.condition}
                </p>

                {/* عنوان المنتج */}
                <h3 className="text-xl font-extrabold text-slate-900 mb-3 flex-grow hover:text-green-700 leading-snug">
                  {product.title}
                </h3>

                {/* السعر وزر التواصل */}
                <div className="flex items-end justify-between gap-3 mt-5 pt-5 border-t border-gray-100">
                  <div className="text-slate-900">
                    <span className="text-sm text-gray-500 block">السعر</span>
                    <span className="font-black text-3xl">{product.price}</span>
                  </div>
                  
                  <a 
                    href={`https://wa.me/${product.whatsapp}?text=مرحباً، أنا مهتم بشراء ${product.title} المعروض في متجر المستعمل (الرقم: ${product.id})`}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2.5 bg-slate-900 hover:bg-green-600 text-white font-bold px-6 py-3 rounded-xl transition-all duration-300 shadow-md transform hover:scale-105"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.521.149-.174.198-.298.297-.498.098-.199.049-.372-.024-.521-.074-.148-.67-1.613-.918-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.199 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.9a9.848 9.848 0 012.893 6.994c-.001 5.451-4.436 9.884-9.889 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.41 0 .005 5.405.005 12.045c0 2.093.547 4.134 1.586 5.925L0 24l6.339-1.663a11.953 11.953 0 005.711 1.457h.006c6.64 0 12.045-5.405 12.045-12.046 0-3.222-1.256-6.253-3.543-8.54z"/></svg>
                    واتساب
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
