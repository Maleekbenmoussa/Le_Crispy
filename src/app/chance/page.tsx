'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import confetti from 'canvas-confetti';
import { 
  Sparkles, 
  ArrowLeft, 
  Copy, 
  Check, 
  Send, 
  Clock, 
  Flame, 
  ShieldCheck, 
  Smartphone, 
  Volume2, 
  VolumeX, 
  ShoppingBag,
  Award,
  AlertCircle
} from 'lucide-react';
import { CHANCE_REWARDS, RewardDefinition, PromoCode } from '@/types/chance';

export default function ChanceGamePage() {
  const router = useRouter();

  // Audio mute toggle
  const [isMuted, setIsMuted] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Game state
  const [isGameActive, setIsGameActive] = useState(true);
  const [isSpinning, setIsSpinning] = useState(false);
  const [hasSpun, setHasSpun] = useState(false);
  const [wonReward, setWonReward] = useState<RewardDefinition | null>(null);
  const [generatedCode, setGeneratedCode] = useState<PromoCode | null>(null);
  const [wheelRotation, setWheelRotation] = useState(0);

  // Anti-abuse cooldown state
  const [cooldownMessage, setCooldownMessage] = useState<string | null>(null);
  const [remainingHours, setRemainingHours] = useState<number | null>(null);

  // Contact form state
  const [contactInput, setContactInput] = useState('');
  const [contactSaved, setContactSaved] = useState(false);
  const [contactError, setContactError] = useState<string | null>(null);
  const [isSavingContact, setIsSavingContact] = useState(false);

  // Copy code state
  const [isCopied, setIsCopied] = useState(false);

  // Play click sound using Web Audio API
  const playTickSound = () => {
    if (isMuted) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } catch {
      // Audio fallback silent
    }
  };

  // Check initial game status and local cooldown
  useEffect(() => {
    // 1. Fetch server settings
    fetch('/api/chance/settings')
      .then(res => res.json())
      .then(data => {
        if (data.settings && !data.settings.isGameActive) {
          setIsGameActive(false);
        }
      })
      .catch(() => {});

    // 2. Check local storage for existing spin in the last 24h
    try {
      const localData = localStorage.getItem('le_crispy_chance_spin');
      if (localData) {
        const parsed = JSON.parse(localData);
        const lastSpin = new Date(parsed.timestamp).getTime();
        const elapsedHours = (Date.now() - lastSpin) / (1000 * 3600);

        if (elapsedHours < 24 && parsed.promoCode) {
          setHasSpun(true);
          setWonReward(parsed.reward);
          setGeneratedCode(parsed.promoCode);
          const hoursLeft = Math.ceil(24 - elapsedHours);
          setRemainingHours(hoursLeft);
          setCooldownMessage(`Vous avez déjà tourné la roue aujourd'hui ! Nouveau tirage possible dans ${hoursLeft}h.`);
        }
      }
    } catch {
      // Ignore
    }
  }, []);

  // Spin the wheel handler
  const handleSpin = async () => {
    if (isSpinning || hasSpun || !isGameActive) return;

    setIsSpinning(true);
    setCooldownMessage(null);

    try {
      // Call backend API to obtain reward & unique code
      const res = await fetch('/api/chance/spin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: localStorage.getItem('le_crispy_client_uid') || `cli_${Date.now()}`,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        if (data.existingCode) {
          setHasSpun(true);
          setGeneratedCode(data.existingCode);
          setCooldownMessage(data.error);
          setIsSpinning(false);
          return;
        }
        throw new Error(data.error || 'Erreur lors du tirage.');
      }

      const { reward, sliceIndex, promoCode } = data;

      // Slice geometry: 6 slices, 60 degrees each.
      // 12 o'clock pointer: slice 0 center is at 30 deg, slice 1 at 90 deg, slice i at (i*60 + 30) deg.
      // Rotation needed for slice i center to align at top (0 deg):
      const sliceCenter = sliceIndex * 60 + 30;
      // Add slight random jitter (between -12° and +12°) for natural realism
      const jitter = (Math.random() - 0.5) * 24;
      const targetAngleInCircle = (360 - sliceCenter + jitter + 360) % 360;

      // 7 to 9 full spins
      const fullRotations = 360 * 8;
      const finalAngle = fullRotations + targetAngleInCircle;

      setWheelRotation(finalAngle);

      // Audible click ticks as wheel spins
      let tickInterval: any;
      let tickCount = 0;
      const maxTicks = 45;
      const intervalSpeed = 80;
      tickInterval = setInterval(() => {
        playTickSound();
        tickCount++;
        if (tickCount >= maxTicks) {
          clearInterval(tickInterval);
        }
      }, intervalSpeed);

      // Wait for wheel animation (4.8 seconds)
      setTimeout(() => {
        clearInterval(tickInterval);
        setIsSpinning(false);
        setHasSpun(true);
        setWonReward(reward);
        setGeneratedCode(promoCode);

        // Save spin locally
        try {
          localStorage.setItem('le_crispy_chance_spin', JSON.stringify({
            timestamp: new Date().toISOString(),
            reward,
            promoCode,
          }));
        } catch {}

        // Launch celebratory confetti burst!
        triggerConfetti();
      }, 4800);

    } catch (err: any) {
      setIsSpinning(false);
      alert(err.message || 'Une erreur est survenue. Veuillez réessayer.');
    }
  };

  // Confetti explosion
  const triggerConfetti = () => {
    try {
      const end = Date.now() + 2500;
      const colors = ['#C9A24A', '#E0B84A', '#FFFFFF', '#DC2626', '#059669'];

      (function frame() {
        confetti({
          particleCount: 4,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.7 },
          colors: colors,
        });
        confetti({
          particleCount: 4,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.7 },
          colors: colors,
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      })();
    } catch {}
  };

  // Copy code to clipboard
  const handleCopyCode = () => {
    if (!generatedCode) return;
    navigator.clipboard.writeText(generatedCode.code);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 3000);
  };

  // Save contact (phone or email)
  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactInput.trim() || !generatedCode) return;

    setIsSavingContact(true);
    setContactError(null);

    try {
      const res = await fetch('/api/chance/save-contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: generatedCode.code,
          contact: contactInput.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Erreur lors de l’enregistrement');
      }

      setContactSaved(true);
    } catch (err: any) {
      setContactError(err.message || 'Impossible d’enregistrer vos coordonnées.');
    } finally {
      setIsSavingContact(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex flex-col selection:bg-[var(--accent-gold)] selection:text-black">
      
      {/* Top Floating Luxury Bar */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-[var(--bg-primary)]/90 border-b border-[var(--border-gold)]/40 px-4 py-3 sm:px-8 flex items-center justify-between">
        <Link 
          href="/"
          className="flex items-center gap-2 text-xs font-bold text-[var(--accent-gold)] hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour au Restaurant</span>
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2 rounded-full border border-[var(--border-gold)]/50 text-[var(--accent-gold)] hover:bg-[var(--accent-gold)]/10 transition-all"
            title={isMuted ? 'Activer le son' : 'Couper le son'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-stone-400" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <Link
            href="/menu"
            className="btn-gold py-1.5 px-3.5 text-xs font-bold flex items-center gap-1.5 rounded-full shadow-md"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Menu Le Crispy</span>
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 max-w-xl mx-auto w-full text-center space-y-6 my-auto">
        
        {/* Banner Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[var(--accent-gold)] bg-[var(--bg-secondary)] shadow-[0_0_20px_rgba(201,162,74,0.3)]">
          <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
          <span className="text-xs font-extrabold uppercase tracking-widest text-gold-gradient">
            Jeu Exclusif Le Crispy
          </span>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h1 className="font-gold text-3xl sm:text-5xl font-extrabold tracking-tight text-gold-gradient">
            🎰 TOURNE LA ROUE !
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-md mx-auto leading-relaxed">
            Tentez votre chance à chaque visite : réductions immédiates, frites dorées ou boissons offertes sur votre prochaine commande !
          </p>
        </div>

        {/* Cooldown or Disabled Warning if any */}
        {!isGameActive && (
          <div className="p-4 rounded-2xl bg-amber-950/60 border border-amber-500/50 text-amber-200 text-xs flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-amber-400" />
            <span>Le jeu de la roue est temporairement en pause. Revenez très bientôt pour de nouvelles surprises !</span>
          </div>
        )}

        {cooldownMessage && hasSpun && (
          <div className="p-3.5 rounded-2xl bg-stone-900/90 border border-[var(--border-gold)] text-[var(--accent-gold)] text-xs flex items-center justify-center gap-2">
            <Clock className="w-4 h-4 shrink-0" />
            <span>{cooldownMessage}</span>
          </div>
        )}

        {/* --- WHEEL OF FORTUNE CONTAINER --- */}
        <div className="relative w-[310px] h-[310px] sm:w-[370px] sm:h-[370px] my-4 select-none">
          
          {/* Top Pointer Indicator */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-30 drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)]">
            <div className="w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[30px] border-t-amber-400 filter drop-shadow-[0_0_8px_#f59e0b]" />
            <div className="w-3 h-3 rounded-full bg-white absolute top-1 left-1/2 -translate-x-1/2 shadow-inner" />
          </div>

          {/* Outer Glowing Golden Rim */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#a8823a] via-[#f3e5ab] to-[#c9a24a] p-3 shadow-[0_0_50px_rgba(201,162,74,0.45)] border border-amber-300">
            
            {/* The Rotating Wheel */}
            <div
              className="w-full h-full rounded-full overflow-hidden relative shadow-inner"
              style={{
                transform: `rotate(${wheelRotation}deg)`,
                transition: isSpinning ? 'transform 4.8s cubic-bezier(0.15, 0.9, 0.2, 1)' : 'none',
              }}
            >
              <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                {CHANCE_REWARDS.map((reward, i) => {
                  const startAngle = i * 60;
                  const endAngle = (i + 1) * 60;

                  // Coordinates on 100x100 SVG circle with radius 50
                  const x1 = 50 + 50 * Math.cos((Math.PI * startAngle) / 180);
                  const y1 = 50 + 50 * Math.sin((Math.PI * startAngle) / 180);
                  const x2 = 50 + 50 * Math.cos((Math.PI * endAngle) / 180);
                  const y2 = 50 + 50 * Math.sin((Math.PI * endAngle) / 180);

                  const pathData = `M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`;

                  // Mid-angle for text placement
                  const midAngle = startAngle + 30;
                  const textRad = (Math.PI * midAngle) / 180;
                  const textX = 50 + 32 * Math.cos(textRad);
                  const textY = 50 + 32 * Math.sin(textRad);

                  return (
                    <g key={reward.id}>
                      <path
                        d={pathData}
                        fill={reward.color}
                        stroke="#14261A"
                        strokeWidth="0.8"
                      />
                      {/* Text & Icon in Slice */}
                      <g transform={`translate(${textX}, ${textY}) rotate(${midAngle + 90})`}>
                        <text
                          textAnchor="middle"
                          dominantBaseline="central"
                          fill={reward.textColor}
                          fontSize="4.4"
                          fontWeight="900"
                          fontFamily="sans-serif"
                          style={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}
                        >
                          {reward.shortLabel}
                        </text>
                        <text
                          y="-5.5"
                          textAnchor="middle"
                          dominantBaseline="central"
                          fontSize="4.5"
                        >
                          {reward.icon}
                        </text>
                      </g>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Center Golden Medallion Hub */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-[#f3e5ab] via-[#c9a24a] to-[#78541c] border-2 border-white shadow-[0_0_20px_rgba(0,0,0,0.8)] flex flex-col items-center justify-center text-black font-extrabold z-20">
              <Sparkles className="w-5 h-5 text-amber-900 animate-spin" />
              <span className="text-[9px] uppercase tracking-tighter font-mono font-black text-amber-950">
                CRISPY
              </span>
            </div>

          </div>
        </div>

        {/* --- SPIN ACTION BUTTON --- */}
        {!hasSpun && (
          <button
            onClick={handleSpin}
            disabled={isSpinning || !isGameActive}
            className={`w-full max-w-xs py-4 px-8 rounded-full font-gold text-lg sm:text-xl font-extrabold tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-3 shadow-[0_0_35px_rgba(201,162,74,0.5)] ${
              isSpinning || !isGameActive
                ? 'bg-stone-800 text-stone-500 cursor-not-allowed border border-stone-700'
                : 'btn-gold hover:scale-105 active:scale-95'
            }`}
          >
            <Sparkles className="w-6 h-6 text-amber-200" />
            <span>{isSpinning ? 'Tirage en cours...' : 'TOURNER LA ROUE !'}</span>
          </button>
        )}

        {/* --- VICTORY & PROMO CODE CARD --- */}
        {hasSpun && generatedCode && (
          <div className="w-full card-gold p-6 sm:p-8 space-y-6 bg-stone-950/95 border-2 border-[var(--accent-gold)] shadow-[0_0_50px_rgba(201,162,74,0.4)] rounded-3xl animate-fadeIn">
            
            {/* Victory Header */}
            <div className="space-y-2">
              <span className="text-3xl sm:text-4xl animate-bounce inline-block">🎉</span>
              <h2 className="font-gold text-2xl sm:text-3xl font-extrabold text-gold-gradient">
                FÉLICITATIONS !
              </h2>
              <div className="p-3 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border-gold)]/60 text-[var(--accent-gold)] font-bold text-sm sm:text-base">
                Vous avez gagné : <span className="text-white font-extrabold">{wonReward?.label || generatedCode.rewardLabel}</span> !
              </div>
            </div>

            {/* Promo Code Box */}
            <div className="space-y-2">
              <span className="text-xs uppercase tracking-widest text-stone-400 font-bold block">
                Votre Code Promo Unique
              </span>
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-black border-2 border-dashed border-[var(--accent-gold)] shadow-inner">
                <span className="font-mono text-xl sm:text-2xl font-black tracking-widest text-white">
                  {generatedCode.code}
                </span>

                <button
                  onClick={handleCopyCode}
                  className="p-2.5 rounded-xl bg-gradient-to-r from-[#c9a24a] to-[#a8823a] text-black font-bold text-xs flex items-center gap-1.5 hover:scale-105 active:scale-95 transition-all shadow-md"
                  title="Copier le code promo"
                >
                  {isCopied ? <Check className="w-4 h-4 text-emerald-950" /> : <Copy className="w-4 h-4" />}
                  <span>{isCopied ? 'Copié !' : 'Copier'}</span>
                </button>
              </div>

              <div className="flex items-center justify-between text-[11px] text-stone-400 pt-1 px-1">
                <span className="flex items-center gap-1 text-emerald-400 font-bold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Code vérifié & actif</span>
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Valable 48 heures</span>
                </span>
              </div>
            </div>

            {/* Optional Contact Input (Phone or Email) */}
            <div className="border-t border-[var(--border-gold)]/30 pt-4 space-y-3 text-left">
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-300 block">
                  Conserver ou recevoir mon code promo (Facultatif)
                </label>
                <p className="text-[11px] text-stone-400">
                  Indiquez votre email ou numéro de téléphone pour ne pas perdre votre réduction.
                </p>
              </div>

              {contactSaved ? (
                <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500 text-emerald-300 text-xs flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Vos coordonnées ont été enregistrées avec succès !</span>
                </div>
              ) : (
                <form onSubmit={handleSaveContact} className="flex gap-2">
                  <input
                    type="text"
                    value={contactInput}
                    onChange={e => setContactInput(e.target.value)}
                    placeholder="06 12 34 56 78 ou email@..."
                    className="flex-1 bg-black border border-[var(--border-gold)]/50 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-stone-600 focus:outline-none focus:border-[var(--accent-gold)] font-mono"
                  />
                  <button
                    type="submit"
                    disabled={isSavingContact || !contactInput.trim()}
                    className="btn-gold px-4 py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 shrink-0 disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSavingContact ? 'Envoi...' : 'Enregistrer'}</span>
                  </button>
                </form>
              )}

              {contactError && (
                <p className="text-[11px] text-rose-400">{contactError}</p>
              )}
            </div>

            {/* Direct Call To Action */}
            <div className="pt-2">
              <Link
                href="/menu"
                className="w-full btn-gold py-3.5 px-6 text-sm font-extrabold flex items-center justify-center gap-2 rounded-2xl shadow-xl hover:scale-102 transition-all"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Utiliser mon code & Commander</span>
              </Link>
            </div>

          </div>
        )}

        {/* Anti-abuse notice */}
        <div className="text-[11px] text-stone-400 space-y-1 pt-4 max-w-sm">
          <p>🔒 1 tirage par client toutes les 24h. Offre non cumulable.</p>
          <p>Valable au restaurant Le Crispy ou lors de votre commande en ligne.</p>
        </div>

      </main>

      {/* Mini Footer */}
      <footer className="py-4 border-t border-[var(--border-gold)]/30 text-center text-[10px] text-stone-400">
        © 2026 Le Crispy Dormans — Jeu Gratuit sans obligation d'achat.
      </footer>

    </div>
  );
}
