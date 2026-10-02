'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import QRCode from 'qrcode';
import { 
  X, 
  Smartphone, 
  Download, 
  ExternalLink, 
  Sparkles, 
  UtensilsCrossed, 
  ShieldCheck, 
  Copy, 
  Check, 
  Settings2,
  ChevronRight,
  RefreshCw
} from 'lucide-react';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTable?: string;
}

const COMMON_TABLES = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];

export default function QRScannerModal({ isOpen, onClose, initialTable = '07' }: QRScannerModalProps) {
  const [selectedTable, setSelectedTable] = useState(initialTable);
  const [customTableInput, setCustomTableInput] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isCopied, setIsCopied] = useState(false);
  const [localIp, setLocalIp] = useState<string>('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isCustomInputOpen, setIsCustomInputOpen] = useState(false);

  // Fetch local network IP on mount to support real smartphone scanning over Wi-Fi
  useEffect(() => {
    fetch('/api/local-ip')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.localIp) {
          setLocalIp(data.localIp);
        }
      })
      .catch(() => {});
  }, []);

  // Compute and update the QR URL whenever table or IP changes
  const computeUrl = useCallback((tableNum: string, ip: string) => {
    if (typeof window === 'undefined') return '';
    const cleanNum = tableNum.replace(/[^0-9a-zA-Z]/g, '').replace(/^table/i, '') || '07';
    const port = window.location.port ? `:${window.location.port}` : '';
    const hostname = window.location.hostname;

    let baseUrl = window.location.origin;

    // If running on localhost or 127.0.0.1, use the LAN IP so smartphones on the Wi-Fi can open it!
    if ((hostname === 'localhost' || hostname === '127.0.0.1') && ip && ip !== 'localhost') {
      baseUrl = `http://${ip}${port}`;
    }

    return `${baseUrl}/table?n=${cleanNum}`;
  }, []);

  const generateQRCode = async (url: string) => {
    if (!url) return;
    try {
      // High-contrast, standards-compliant QR Code (black on white) with generous quiet zone
      const dataUrl = await QRCode.toDataURL(url, {
        width: 700,
        margin: 4,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
        errorCorrectionLevel: 'M',
      });
      setQrDataUrl(dataUrl);
    } catch (err) {
      console.error('Failed to generate QR Code:', err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      const url = computeUrl(selectedTable, localIp);
      setTargetUrl(url);
      generateQRCode(url);
    }
  }, [isOpen, selectedTable, localIp, computeUrl]);

  const handleSelectTable = (num: string) => {
    setSelectedTable(num);
    const url = computeUrl(num, localIp);
    setTargetUrl(url);
    generateQRCode(url);
  };

  const handleApplyCustomTable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTableInput.trim()) return;
    const clean = customTableInput.trim();
    setSelectedTable(clean);
    const url = computeUrl(clean, localIp);
    setTargetUrl(url);
    generateQRCode(url);
    setIsCustomInputOpen(false);
  };

  const handleCopyUrl = () => {
    if (!targetUrl) return;
    navigator.clipboard.writeText(targetUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  if (!isOpen) return null;

  const displayTableStr = `Table ${selectedTable.padStart(2, '0')}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-[var(--bg-secondary)] border-2 border-[var(--accent-gold)] rounded-3xl overflow-hidden shadow-[0_0_60px_rgba(201,162,74,0.4)] flex flex-col p-5 sm:p-7 space-y-4 max-h-[95vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-[var(--bg-primary)] text-stone-400 hover:text-white border border-[var(--border-gold)]/40 transition-colors z-30"
          title="Fermer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-1.5 pt-1">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-[var(--accent-gold)] bg-[var(--bg-primary)] text-[var(--accent-gold)] text-[10px] font-extrabold uppercase tracking-wider shadow-sm">
            <UtensilsCrossed className="w-3.5 h-3.5 text-amber-300" />
            <span>QR Code de Table • Le Crispy</span>
          </div>

          <h3 className="font-gold text-2xl sm:text-3xl font-extrabold text-gold-gradient">
            📍 SCANNE TA TABLE !
          </h3>

          <p className="text-xs text-[var(--text-secondary)] leading-relaxed max-w-sm mx-auto">
            Scannez ce QR Code avec l'appareil photo de votre smartphone pour <strong className="text-white">identifier votre place</strong> et commander directement sur place.
          </p>
        </div>

        {/* Table Selector Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs px-1">
            <span className="text-stone-300 font-bold">Choisir le Numéro de Table :</span>
            <span className="text-[var(--accent-gold)] font-mono font-extrabold">{displayTableStr}</span>
          </div>

          {/* Quick Table Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {COMMON_TABLES.map(num => (
              <button
                key={num}
                type="button"
                onClick={() => handleSelectTable(num)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold shrink-0 transition-all ${
                  selectedTable === num
                    ? 'bg-gradient-to-r from-[#c9a24a] to-[#a8823a] text-black shadow-[0_0_12px_rgba(201,162,74,0.5)] scale-105'
                    : 'bg-[var(--bg-primary)] text-stone-300 border border-[var(--border-gold)]/40 hover:border-[var(--accent-gold)]'
                }`}
              >
                T-{num}
              </button>
            ))}

            <button
              type="button"
              onClick={() => setIsCustomInputOpen(!isCustomInputOpen)}
              className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-[var(--accent-gold)] border border-dashed border-[var(--accent-gold)]/60 hover:bg-[var(--accent-gold)]/10 shrink-0"
              title="Autre numéro"
            >
              + Autre
            </button>
          </div>

          {/* Custom table number input */}
          {isCustomInputOpen && (
            <form onSubmit={handleApplyCustomTable} className="flex gap-2 pt-1 animate-fadeIn">
              <input
                type="text"
                value={customTableInput}
                onChange={e => setCustomTableInput(e.target.value)}
                placeholder="Ex: 14, 25, Terrasse 2..."
                className="flex-1 bg-black border border-[var(--border-gold)]/60 rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-stone-600 focus:outline-none focus:border-[var(--accent-gold)] font-mono"
              />
              <button
                type="submit"
                className="btn-gold px-3 py-1.5 text-xs font-bold rounded-xl shrink-0"
              >
                Appliquer
              </button>
            </form>
          )}
        </div>

        {/* High-Contrast, Verified Scannable QR Code */}
        <div className="relative mx-auto bg-white p-4 rounded-3xl border-4 border-[var(--accent-gold)] shadow-[0_0_45px_rgba(201,162,74,0.4)] flex flex-col items-center justify-center">
          {qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt={`QR Code ${displayTableStr} - Le Crispy`}
              className="w-52 h-52 sm:w-60 sm:h-60 object-contain rounded-lg"
            />
          ) : (
            <div className="w-52 h-52 sm:w-60 sm:h-60 flex items-center justify-center text-stone-400 text-xs">
              Génération du QR Code...
            </div>
          )}

          {/* Current Table Medallion under QR */}
          <div className="mt-2.5 inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-stone-900 border border-stone-700 text-white text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Assigné à : <strong className="text-[var(--accent-gold)]">{displayTableStr}</strong></span>
          </div>
        </div>

        {/* Call To Action Banner Under QR */}
        <div className="p-3.5 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-gold)]/60 text-center space-y-1">
          <div className="flex items-center justify-center gap-2 text-xs font-extrabold text-[var(--accent-gold)]">
            <Smartphone className="w-4 h-4 animate-bounce text-amber-300" />
            <span>📱 SCANNEZ AVEC VOTRE TÉLÉPHONE</span>
          </div>
          <p className="text-[11px] text-[var(--text-secondary)] leading-tight">
            Votre smartphone affichera instantanément : <strong className="text-white">« Vous êtes assis à la {displayTableStr} »</strong> avec accès direct au menu.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-1">
          
          {/* Direct Link to test on current screen */}
          <Link
            href={`/table?n=${selectedTable}`}
            onClick={onClose}
            className="w-full sm:w-auto flex-1 btn-gold py-2.5 px-4 text-xs font-extrabold flex items-center justify-center gap-2 rounded-xl shadow-md hover:scale-102 transition-all text-center"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Tester la {displayTableStr} sur cet écran</span>
          </Link>

          {/* Download QR Image */}
          {qrDataUrl && (
            <a
              href={qrDataUrl}
              download={`QR-Code-${displayTableStr.replace(/\s+/g, '-')}-Le-Crispy.png`}
              className="w-full sm:w-auto flex-1 btn-gold-outline py-2.5 px-4 text-xs font-bold flex items-center justify-center gap-2 rounded-xl hover:scale-102 transition-all text-center"
            >
              <Download className="w-4 h-4 text-[var(--accent-gold)]" />
              <span>Télécharger le QR HD</span>
            </a>
          )}
        </div>

        {/* Advanced Network Info & URL View */}
        <div className="text-center pt-1 border-t border-[var(--border-gold)]/30">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-[10px] text-stone-400 hover:text-[var(--accent-gold)] transition-colors inline-flex items-center gap-1"
          >
            <Settings2 className="w-3 h-3" />
            <span>{showAdvanced ? 'Masquer détails réseau' : 'Afficher l’URL & IP Wi-Fi'}</span>
          </button>

          {showAdvanced && (
            <div className="mt-2 p-2.5 rounded-xl bg-black border border-stone-800 text-left space-y-2 text-[11px] animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="text-stone-400">URL encodée dans le QR :</span>
                <button
                  onClick={handleCopyUrl}
                  className="text-[var(--accent-gold)] hover:underline flex items-center gap-1 font-bold text-[10px]"
                >
                  {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{isCopied ? 'Copié !' : 'Copier'}</span>
                </button>
              </div>

              <div className="p-2 rounded bg-stone-900 font-mono text-[10px] text-amber-200 break-all select-all">
                {targetUrl}
              </div>

              {localIp && (
                <p className="text-[10px] text-stone-400">
                  🌐 IP Locale Wi-Fi détectée : <code className="text-emerald-400">{localIp}</code> (permet au téléphone de se connecter sur le même Wi-Fi).
                </p>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
