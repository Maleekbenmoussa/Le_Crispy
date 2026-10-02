'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import StripeCheckoutModal from '@/components/checkout/StripeCheckoutModal';
import { 
  UtensilsCrossed, 
  Sparkles, 
  Bell, 
  CheckCircle2, 
  ArrowRight, 
  MapPin, 
  ShoppingBag, 
  Gift, 
  Clock, 
  Phone,
  RotateCcw,
  Check,
  ShieldCheck,
  Smartphone
} from 'lucide-react';

function TableContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { tableNumber, setTableNumber, setServiceMode, activateTable, setIsCartOpen, items } = useCart();
  const { t } = useLanguage();

  // Get table from query param (e.g. ?n=07 or ?table=07)
  const rawTableParam = searchParams.get('n') || searchParams.get('table') || '07';
  
  // Format table string (e.g. "Table 07" or "07")
  const cleanNumber = rawTableParam.replace(/[^0-9a-zA-Z]/g, '').replace(/^table/i, '') || '07';
  const formattedTableStr = `Table ${cleanNumber.length === 1 ? '0' + cleanNumber : cleanNumber}`;

  const [currentTable, setCurrentTable] = useState(formattedTableStr);
  const [callWaiterStatus, setCallWaiterStatus] = useState<'idle' | 'calling' | 'called'>('idle');
  const [isEditingTable, setIsEditingTable] = useState(false);
  const [manualTableInput, setManualTableInput] = useState(cleanNumber);

  // Activate table in cart and local storage on load
  useEffect(() => {
    activateTable(currentTable);
  }, [currentTable]);

  // Handle calling a waiter
  const handleCallWaiter = () => {
    setCallWaiterStatus('calling');
    setTimeout(() => {
      setCallWaiterStatus('called');
    }, 800);
  };

  // Handle changing table
  const handleChangeTable = (newNum: string) => {
    const formatted = `Table ${newNum.padStart(2, '0')}`;
    setCurrentTable(formatted);
    activateTable(formatted);
    setIsEditingTable(false);
  };

  const totalCartCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-primary)] text-[var(--text-primary)] selection:bg-[var(--accent-gold)] selection:text-black">
      <Header />

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 sm:py-12 max-w-xl mx-auto w-full text-center space-y-6">
        
        {/* Verified Scan Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[var(--accent-gold)] bg-[var(--bg-secondary)] shadow-[0_0_25px_rgba(201,162,74,0.35)] animate-fadeIn">
          <Smartphone className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span className="text-xs font-extrabold uppercase tracking-widest text-gold-gradient">
            QR Code Table Scanné avec Succès
          </span>
        </div>

        {/* Welcome Header */}
        <div className="space-y-2">
          <h1 className="text-sm sm:text-base font-bold text-stone-300 uppercase tracking-widest">
            Bienvenue au Restaurant Le Crispy
          </h1>
          <h2 className="font-gold text-3xl sm:text-4xl font-extrabold text-gold-gradient">
            Votre Place Est Confirmée !
          </h2>
        </div>

        {/* Big Luxury Table Medallion Card */}
        <div className="w-full card-gold p-6 sm:p-8 space-y-6 bg-stone-950/95 border-2 border-[var(--accent-gold)] shadow-[0_0_50px_rgba(201,162,74,0.35)] rounded-3xl relative overflow-hidden">
          
          {/* Subtle Golden Glow behind the table number */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-[var(--accent-gold)]/10 rounded-full blur-3xl pointer-events-none" />

          {/* Table Icon & Number Badge */}
          <div className="space-y-3 relative z-10">
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full bg-gradient-to-br from-[#c9a24a] via-[#f3e5ab] to-[#8c6b24] p-0.5 shadow-[0_0_30px_rgba(201,162,74,0.6)] flex items-center justify-center">
              <div className="w-full h-full rounded-full bg-black/90 flex items-center justify-center text-[var(--accent-gold)]">
                <UtensilsCrossed className="w-8 h-8 sm:w-10 sm:h-10 animate-pulse" />
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-xs uppercase tracking-widest text-stone-400 font-extrabold">
                Vous êtes installé à la
              </span>
              <div className="font-gold text-4xl sm:text-6xl font-black text-gold-gradient tracking-tight drop-shadow-md">
                {currentTable}
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/60 text-emerald-400 text-xs font-bold">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>Service à Table Activé</span>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed max-w-md mx-auto">
            Toutes vos commandes passées depuis ce smartphone seront automatiquement envoyées en cuisine et servies directement à votre <strong className="text-[var(--accent-gold)]">{currentTable}</strong>.
          </p>

          {/* Table Switcher (Quick Toggle if needed) */}
          <div className="border-t border-[var(--border-gold)]/30 pt-4">
            {!isEditingTable ? (
              <button
                onClick={() => setIsEditingTable(true)}
                className="text-xs text-stone-400 hover:text-[var(--accent-gold)] transition-colors inline-flex items-center gap-1 font-medium"
              >
                <span>Ce n'est pas votre table ?</span>
                <span className="underline text-[var(--accent-gold)] font-bold">Changer de table</span>
              </button>
            ) : (
              <div className="space-y-3 p-3.5 rounded-2xl bg-black border border-stone-800 animate-fadeIn">
                <span className="text-xs font-bold text-stone-300 block">
                  Sélectionnez votre numéro de table :
                </span>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {['01', '02', '03', '04', '05', '06', '07', '08', '09', '10'].map(num => (
                    <button
                      key={num}
                      onClick={() => handleChangeTable(num)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                        currentTable.endsWith(num)
                          ? 'bg-[var(--accent-gold)] text-black shadow-md'
                          : 'bg-stone-900 text-stone-300 hover:border-[var(--accent-gold)] border border-stone-800'
                      }`}
                    >
                      N° {num}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setIsEditingTable(false)}
                  className="text-[11px] text-stone-400 hover:text-white"
                >
                  Annuler
                </button>
              </div>
            )}
          </div>

          {/* Action CTAs */}
          <div className="space-y-3 pt-2">
            
            {/* Primary: Go to Menu */}
            <Link
              href="/menu"
              className="w-full btn-gold py-4 px-6 text-sm sm:text-base font-extrabold flex items-center justify-center gap-2.5 rounded-2xl shadow-[0_0_30px_rgba(201,162,74,0.45)] hover:scale-102 transition-all"
            >
              <ShoppingBag className="w-5 h-5" />
              <span>Consulter le Menu & Commander</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>

            {/* Secondary: Call Waiter */}
            <button
              onClick={handleCallWaiter}
              disabled={callWaiterStatus !== 'idle'}
              className={`w-full py-3.5 px-6 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all border ${
                callWaiterStatus === 'called'
                  ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 shadow-md'
                  : 'btn-gold-outline border-[var(--border-gold)] hover:scale-102'
              }`}
            >
              {callWaiterStatus === 'calling' ? (
                <>
                  <Bell className="w-4 h-4 animate-bounce text-amber-300" />
                  <span>Appel du serveur en cours...</span>
                </>
              ) : callWaiterStatus === 'called' ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Serveur notifié pour la {currentTable} ! Il arrive.</span>
                </>
              ) : (
                <>
                  <Bell className="w-4 h-4 text-[var(--accent-gold)]" />
                  <span>Appeler un Serveur à la {currentTable}</span>
                </>
              )}
            </button>

            {/* View Cart if items exist */}
            {totalCartCount > 0 && (
              <button
                onClick={() => setIsCartOpen(true)}
                className="w-full py-3 px-4 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs font-bold flex items-center justify-between hover:bg-amber-950/60 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-[var(--accent-gold)]" />
                  <span>Votre Panier ({totalCartCount} plat{totalCartCount > 1 ? 's' : ''})</span>
                </span>
                <span className="text-[var(--accent-gold)] underline">Finaliser ma commande →</span>
              </button>
            )}

            {/* Bonus: Wheel Game Link */}
            <Link
              href="/chance"
              className="w-full p-3 rounded-2xl bg-stone-900/90 border border-[var(--border-gold)]/50 text-stone-300 hover:text-white hover:border-[var(--accent-gold)] transition-all flex items-center justify-center gap-2 text-xs font-bold"
            >
              <Gift className="w-4 h-4 text-amber-300" />
              <span>En attendant votre plat : Tournez la Roue Cadeau !</span>
            </Link>

          </div>

        </div>

        {/* Quick Restaurant Info Footer Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full p-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-gold)]/40 text-xs text-stone-400">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <Clock className="w-4 h-4 text-[var(--accent-gold)] shrink-0" />
            <span>Ouvert 7j/7 • 11h - 23h</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <Phone className="w-4 h-4 text-[var(--accent-gold)] shrink-0" />
            <a href="tel:0956070091" className="text-[var(--accent-gold)] font-mono font-bold hover:underline">
              09 56 07 00 91
            </a>
          </div>
          <div className="flex items-center justify-center sm:justify-end gap-2">
            <MapPin className="w-4 h-4 text-[var(--accent-gold)] shrink-0" />
            <span>1 rue Jean de Dormans</span>
          </div>
        </div>

      </main>

      <Footer />

      {/* Cart & Checkout Modal Drawer */}
      <StripeCheckoutModal />
    </div>
  );
}

export default function TablePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center text-[var(--accent-gold)]">
        <div className="text-center space-y-3">
          <UtensilsCrossed className="w-10 h-10 mx-auto animate-spin" />
          <p className="text-xs font-bold tracking-widest uppercase">Chargement de votre table...</p>
        </div>
      </div>
    }>
      <TableContent />
    </Suspense>
  );
}
