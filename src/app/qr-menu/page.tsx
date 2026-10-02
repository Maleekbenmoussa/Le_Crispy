'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Download, 
  Phone, 
  MapPin, 
  Clock, 
  Sparkles, 
  ShoppingBag, 
  Share2,
  Maximize2
} from 'lucide-react';

export default function QrMenuPage() {
  const [zoomLevel, setZoomLevel] = useState(1);

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.3, 3));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.3, 0.7));
  const handleResetZoom = () => setZoomLevel(1);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <Header />

      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full space-y-6">
        
        {/* Banner Info Top */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full border border-[var(--accent-gold)] bg-[var(--bg-secondary)] text-[var(--accent-gold)] text-xs font-bold uppercase tracking-wider shadow-md">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Carte & Flyer Officiel Le Crispy Dormans</span>
          </div>
          <h1 className="font-gold text-3xl sm:text-4xl font-extrabold text-gold-gradient">
            Menu Officiel & Spécialités
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-xl mx-auto">
            Consultez le menu complet en image haute définition, zoomez sur les plats et commandez directement.
          </p>
        </div>

        {/* Quick Restaurant Bar Info */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-gold)] text-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[var(--accent-gold)]/15 border border-[var(--accent-gold)] flex items-center justify-center text-[var(--accent-gold)] shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold block text-[var(--text-primary)]">Ouvert 7J / 7</span>
              <span className="text-[11px] text-[var(--text-secondary)]">11h00 à 23h00 Non Stop</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[var(--accent-gold)]/15 border border-[var(--accent-gold)] flex items-center justify-center text-[var(--accent-gold)] shrink-0">
              <Phone className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold block text-[var(--text-primary)]">Commander par Téléphone</span>
              <a href="tel:0956070091" className="text-[11px] text-[var(--accent-gold)] font-mono font-bold hover:underline">
                09 56 07 00 91
              </a>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[var(--accent-gold)]/15 border border-[var(--accent-gold)] flex items-center justify-center text-[var(--accent-gold)] shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold block text-[var(--text-primary)]">Adresse</span>
              <span className="text-[11px] text-[var(--text-secondary)]">1 rue Jean de Dormans, 51700</span>
            </div>
          </div>
        </div>

        {/* Action Controls Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-gold)]/50">
          <div className="flex items-center gap-2">
            <button
              onClick={handleZoomIn}
              className="p-2 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-gold)] hover:border-[var(--accent-gold)] text-[var(--text-primary)] hover:text-[var(--accent-gold)] transition-colors flex items-center gap-1.5 text-xs font-bold"
              title="Zoomer (+)"
            >
              <ZoomIn className="w-4 h-4 text-[var(--accent-gold)]" />
              <span>Zoom +</span>
            </button>

            <button
              onClick={handleZoomOut}
              className="p-2 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-gold)] hover:border-[var(--accent-gold)] text-[var(--text-primary)] hover:text-[var(--accent-gold)] transition-colors flex items-center gap-1.5 text-xs font-bold"
              title="Dézoomer (-)"
            >
              <ZoomOut className="w-4 h-4 text-[var(--accent-gold)]" />
              <span>Zoom -</span>
            </button>

            <button
              onClick={handleResetZoom}
              className="p-2 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-gold)] hover:border-[var(--accent-gold)] text-[var(--text-primary)] hover:text-[var(--accent-gold)] transition-colors flex items-center gap-1.5 text-xs font-bold"
              title="Réinitialiser le zoom"
            >
              <RotateCcw className="w-4 h-4 text-[var(--accent-gold)]" />
              <span>Normal (100%)</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/images/menu-flyer.jpg"
              download="Le-Crispy-Menu-Dormans.jpg"
              className="p-2 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-gold)] hover:border-[var(--accent-gold)] text-[var(--text-primary)] hover:text-[var(--accent-gold)] transition-colors flex items-center gap-1.5 text-xs font-bold"
            >
              <Download className="w-4 h-4 text-[var(--accent-gold)]" />
              <span>Télécharger l'Image</span>
            </a>

            <Link
              href="/menu"
              className="btn-gold px-4 py-2 text-xs font-extrabold flex items-center gap-1.5 shadow-md"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Commander en Ligne</span>
            </Link>
          </div>
        </div>

        {/* The Menu Flyer Image Viewer */}
        <div className="card-gold p-2 sm:p-4 overflow-hidden flex items-center justify-center bg-black/90 rounded-3xl shadow-[0_0_50px_rgba(201,162,74,0.25)] min-h-[500px]">
          <div 
            className="overflow-auto max-h-[80vh] w-full flex items-center justify-center transition-all duration-300 select-none cursor-grab active:cursor-grabbing"
            style={{ touchAction: 'pan-x pan-y pinch-zoom' }}
          >
            <img
              src="/images/menu-flyer.jpg"
              alt="Menu Officiel Le Crispy Dormans"
              className="rounded-2xl max-w-full h-auto object-contain transition-transform duration-200 shadow-2xl"
              style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top center' }}
            />
          </div>
        </div>

        {/* Promo Notice */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/60 via-[var(--bg-secondary)] to-amber-950/60 border border-[var(--accent-gold)] text-center space-y-1">
          <span className="font-gold font-extrabold text-base text-[var(--accent-gold)] block">
            🔥 OFFRE SPÉCIALE : 2 PIZZAS ACHETÉES = 1 PIZZA OFFERTE !
          </span>
          <p className="text-xs text-[var(--text-secondary)]">
            Sur Place • À Emporter • Livraison à Dormans et alentours.
          </p>
        </div>

      </main>

      <Footer />
    </div>
  );
}