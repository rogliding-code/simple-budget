import React, { useState } from 'react';
import { TrendingUp, ArrowRight, Shield, CheckCircle } from 'lucide-react';

const PAYMENT_LINK = "https://simple-budget.lemonsqueezy.com/checkout/buy/variant_id"; 

interface LandingPageProps {
  onEnterApp: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp }) => {
  const [coupon, setCoupon] = useState('');
  const [isValid, setIsValid] = useState(false);

  const handleCouponCheck = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase();
    setCoupon(val);
    if (val === 'GRATIS2025') {
      setIsValid(true);
    } else {
      setIsValid(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white flex flex-col font-sans transition-colors duration-200">
      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-6">
        <div className="w-20 h-20 bg-indigo-600 rounded-2xl flex items-center justify-center mb-4 shadow-xl rotate-3 transform hover:rotate-6 transition-transform">
          <TrendingUp className="text-white w-10 h-10" />
        </div>
        
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
          Domina tu dinero,<br />
          <span className="text-indigo-600">define tu futuro.</span>
        </h1>
        
        <p className="text-lg text-gray-500 dark:text-gray-400 max-w-md mx-auto">
          La herramienta minimalista para gestionar gastos y alcanzar metas de ahorro sin complicaciones.
        </p>

        {/* Pricing / Coupon Section */}
        <div className="w-full max-w-sm bg-gray-50 dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-lg mt-8">
          <div className="mb-4">
            <span className="text-3xl font-bold">{isValid ? 'GRATIS' : '$4.99'}</span>
            {!isValid && <span className="text-gray-500 text-sm ml-2">/ pago único</span>}
          </div>

          <div className="space-y-3">
            <input 
              type="text" 
              placeholder="¿TIENES UN CÓDIGO?" 
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all uppercase text-center tracking-widest font-bold"
              value={coupon}
              onChange={handleCouponCheck}
            />

            {isValid ? (
              <button 
                onClick={onEnterApp}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-2 animate-pulse"
              >
                INGRESAR AHORA <ArrowRight className="w-5 h-5" />
              </button>
            ) : (
              <a 
                href={PAYMENT_LINK}
                target="_blank"
                rel="noreferrer"
                className="block w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-2"
              >
                COMPRAR AHORA
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Features Footer */}
      <div className="bg-gray-50 dark:bg-gray-800 py-8 px-6">
        <div className="max-w-4xl mx-auto flex justify-center gap-8 text-sm text-gray-500">
           <div className="flex items-center gap-1"><Shield className="w-4 h-4" /> 100% Privado</div>
           <div className="flex items-center gap-1"><CheckCircle className="w-4 h-4" /> Pago único</div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;