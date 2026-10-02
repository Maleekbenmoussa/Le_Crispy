'use client';

import React, { useState, useEffect } from 'react';
import { useOrders } from '@/context/OrderContext';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { MOCK_MENU, MOCK_REVIEWS, MOCK_RECLAMATIONS } from '@/data/mockData';
import { MenuItem, Review, Reclamation } from '@/types';
import { 
  LayoutDashboard, 
  Users, 
  ShoppingBag, 
  AlertTriangle, 
  Star, 
  Utensils, 
  History, 
  Settings, 
  TrendingUp, 
  DollarSign, 
  Clock, 
  CheckCircle2, 
  Download, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Lock, 
  Unlock, 
  Printer, 
  Eye, 
  Dumbbell,
  Filter, 
  ShieldCheck, 
  FileText, 
  Phone, 
  Mail, 
  MapPin, 
  Sparkles, 
  Power, 
  Check, 
  X,
  MessageSquare,
  ChevronRight,
  TrendingDown,
  Activity,
  Flame,
  HeartPulse,
  Crown,
  Upload,
  Key,
  LogOut,
  BarChart3,
  PieChart,
  Calendar,
  Layers,
  ArrowUpRight,
  QrCode
} from 'lucide-react';
import Link from 'next/link';
import QRCode from 'qrcode';
import { CHANCE_REWARDS, PromoCode } from '@/types/chance';

interface AuditLog {
  id: string;
  adminName: string;
  action: string;
  target: string;
  timestamp: string;
}

interface AdminUserAccount {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'customer' | 'cook' | 'cashier' | 'admin';
  status: 'active' | 'disabled';
  createdAt: string;
  orderCount: number;
}

export default function AdminDashboardPage() {
  const { orders, updateOrderStatus } = useOrders();
  const { user, login, logout } = useAuth();
  const { t } = useLanguage();

  // Admin Security Access Check State
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [adminAuthError, setAdminAuthError] = useState(false);

  // Navigation Sidebar Section State (9 Sections)
  const [activeSection, setActiveSection] = useState<
    'overview' | 'users' | 'orders' | 'claims' | 'reviews' | 'menu' | 'chance' | 'logs' | 'settings'
  >('overview');

  // Time Period Filter for Stats
  const [periodFilter, setPeriodFilter] = useState<'today' | 'week' | 'month'>('today');

  // Dynamic Sales Chart Data depending on periodFilter
  const getSalesChartData = () => {
    if (periodFilter === 'today') {
      return [
        { label: '11h-13h', sales: 342.50, percentage: 65 },
        { label: '13h-15h', sales: 580.00, percentage: 90 },
        { label: '15h-18h', sales: 210.00, percentage: 40 },
        { label: '18h-20h', sales: 790.50, percentage: 100 },
        { label: '20h-22h', sales: 640.00, percentage: 85 },
        { label: '22h-00h', sales: 380.00, percentage: 55 },
      ];
    } else if (periodFilter === 'week') {
      return [
        { label: 'Lun', sales: 1250.00, percentage: 55 },
        { label: 'Mar', sales: 1480.00, percentage: 65 },
        { label: 'Mer', sales: 1620.00, percentage: 72 },
        { label: 'Jeu', sales: 1890.00, percentage: 82 },
        { label: 'Ven', sales: 2450.00, percentage: 95 },
        { label: 'Sam', sales: 2780.00, percentage: 100 },
        { label: 'Dim', sales: 2150.00, percentage: 88 },
      ];
    } else {
      return [
        { label: 'Sem 1', sales: 8450.00, percentage: 70 },
        { label: 'Sem 2', sales: 9800.00, percentage: 82 },
        { label: 'Sem 3', sales: 11200.00, percentage: 92 },
        { label: 'Sem 4', sales: 12450.00, percentage: 100 },
      ];
    }
  };

  // Export Modal State & Handlers
  const [showExportModal, setShowExportModal] = useState(false);

  const handleExportCSV = () => {
    const headers = ["ID Commande", "Date", "Client", "Email", "Telephone", "Mode Service", "Total EUR", "Statut"];
    const rows = orders.map((o: any) => [
      o.id,
      o.createdAt ? new Date(o.createdAt).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
      `"${(o.userName || 'Client').replace(/"/g, '""')}"`,
      o.userEmail || o.email || 'client@example.com',
      o.userPhone || '09 56 07 00 91',
      o.serviceMode || 'Livraison',
      Number(o.total || 0).toFixed(2),
      o.status || 'paid'
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + 
      [headers.join(";"), ...rows.map((e: any) => e.join(";"))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Rapport_Ventes_LeCrispy_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowExportModal(false);
  };

  const handleExportPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const totalSales = orders.reduce((acc: number, curr: any) => acc + (curr.total || 0), 0).toFixed(2);
    const totalOrders = orders.length;
    const dateStr = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });

    const rowsHtml = orders.map((o: any) => `
      <tr style="border-bottom: 1px solid #ddd;">
        <td style="padding: 10px; font-weight: bold; font-family: monospace;">${o.id}</td>
        <td style="padding: 10px;">${o.createdAt ? new Date(o.createdAt).toLocaleDateString('fr-FR') : dateStr}</td>
        <td style="padding: 10px;">${o.userName || 'Client'}</td>
        <td style="padding: 10px; text-transform: uppercase;">${o.serviceMode || 'Livraison'}</td>
        <td style="padding: 10px; text-align: right; font-weight: bold; color: #b48529; font-family: monospace;">${Number(o.total || 0).toFixed(2)} €</td>
        <td style="padding: 10px; text-align: center; text-transform: uppercase; font-size: 11px;">${o.status || 'Payée'}</td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Rapport d'Activité & Ventes — Le Crispy Dormans</title>
        <style>
          body { font-family: 'Segoe UI', Helvetica, Arial, sans-serif; padding: 40px; color: #111; background-color: #fff; }
          .header { text-align: center; border-bottom: 3px solid #c9a24a; padding-bottom: 20px; margin-bottom: 25px; }
          .logo { font-size: 26px; font-weight: 900; color: #c9a24a; text-transform: uppercase; letter-spacing: 2px; }
          .subtitle { font-size: 14px; color: #555; margin-top: 6px; font-weight: 600; }
          .kpi-container { display: flex; justify-content: space-between; margin-bottom: 30px; gap: 20px; }
          .kpi-box { flex: 1; border: 2px solid #c9a24a; padding: 18px; border-radius: 12px; text-align: center; background: #fdfbf7; }
          .kpi-value { font-size: 26px; font-weight: 900; color: #111; margin-top: 6px; font-family: monospace; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 13px; }
          th { background: #121814; color: #c9a24a; padding: 12px; text-align: left; text-transform: uppercase; font-size: 11px; letter-spacing: 1px; }
          .footer { text-align: center; margin-top: 50px; font-size: 11px; color: #666; border-top: 1px solid #ddd; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">👑 LE CRISPY DORMANS</div>
          <div class="subtitle">Rapport Officiel d'Activité et des Ventes — ${dateStr}</div>
        </div>

        <div class="kpi-container">
          <div class="kpi-box">
            <div style="font-size: 11px; font-weight: bold; text-transform: uppercase; color: #666;">Chiffre d'Affaires Total</div>
            <div class="kpi-value">${totalSales} €</div>
          </div>
          <div class="kpi-box">
            <div style="font-size: 11px; font-weight: bold; text-transform: uppercase; color: #666;">Commandes Enregistrées</div>
            <div class="kpi-value">${totalOrders}</div>
          </div>
          <div class="kpi-box">
            <div style="font-size: 11px; font-weight: bold; text-transform: uppercase; color: #666;">Panier Moyen Client</div>
            <div class="kpi-value">${(totalOrders > 0 ? (Number(totalSales) / totalOrders).toFixed(2) : '0.00')} €</div>
          </div>
        </div>

        <h3 style="color: #121814; border-bottom: 2px solid #c9a24a; padding-bottom: 8px; margin-top: 30px;">Journal Complet des Commandes & Ventes</h3>
        <table>
          <thead>
            <tr>
              <th>N° Commande</th>
              <th>Date</th>
              <th>Client</th>
              <th>Mode Service</th>
              <th style="text-align: right;">Total (€)</th>
              <th style="text-align: center;">Statut</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>

        <div class="footer">
          Document d'administration officiel généré par Le Crispy Dormans (1 rue Jean de Dormans, 51700 Dormans). Tel: 09 56 07 00 91
        </div>
        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
    setShowExportModal(false);
  };

  // --- SECTION 2: USERS STATE (POSTGRESQL SYNCED) ---
  const [userList, setUserList] = useState<AdminUserAccount[]>([
    { id: 'usr-1', name: 'ben moussa malek', email: 'malekmoussa0710@gmail.com', phone: '+216 27 500 246', role: 'customer', status: 'active', createdAt: '2026-07-20', orderCount: 8 },
    { id: 'usr-2', name: 'ben moussa malek (Super Admin)', email: 'malekmoussa0710@gmail.com', phone: '+216 27 500 246', role: 'admin', status: 'active', createdAt: '2026-06-10', orderCount: 15 },
    { id: 'usr-3', name: 'Ines Triki (Caisse)', email: 'ines.caisse@lecrispy.com', phone: '+33 6 55 88 99 00', role: 'cashier', status: 'active', createdAt: '2026-07-01', orderCount: 0 }
  ]);
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserRole, setNewUserRole] = useState<'cook' | 'cashier'>('cook');
  const [selectedUserDetail, setSelectedUserDetail] = useState<AdminUserAccount | null>(null);

  // --- SECTION 3: ORDERS STATE ---
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [orderModeFilter, setOrderModeFilter] = useState('all');

  // --- SECTION 4: CLAIMS STATE ---
  const [claimsList, setClaimsList] = useState<Reclamation[]>(MOCK_RECLAMATIONS);

  // --- SECTION 5: REVIEWS STATE ---
  const [reviewsList, setReviewsList] = useState<Review[]>(MOCK_REVIEWS);
  const [reviewRatingFilter, setReviewRatingFilter] = useState<number | 'all'>('all');

  // --- SECTION 6: MENU STATE & FULL PRODUCT FORM MATCHING FRONTEND DISPLAY ---
  const [menuItems, setMenuItems] = useState<MenuItem[]>(MOCK_MENU);
  const [menuCategoryFilter, setMenuCategoryFilter] = useState('all');
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<MenuItem | null>(null);

  // Form Fields Matching Frontend Display Exactly (Euro €):
  const [formNameFr, setFormNameFr] = useState('');
  const [formNameAr, setFormNameAr] = useState('');
  const [formNameEn, setFormNameEn] = useState('');
  const [formCategory, setFormCategory] = useState('burgers');
  const [formPriceEUR, setFormPriceEUR] = useState('24.90');
  const [formDescFr, setFormDescFr] = useState('');
  const [formDescAr, setFormDescAr] = useState('');
  const [formDescEn, setFormDescEn] = useState('');
  const [formImage, setFormImage] = useState('https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80');
  const [formSpiceLevel, setFormSpiceLevel] = useState<number>(0);
  const [formPrepTime, setFormPrepTime] = useState<number>(15);
  const [formIsPopular, setFormIsPopular] = useState<boolean>(true);
  const [formIsNew, setFormIsNew] = useState<boolean>(true);
  const [formIsHealthy, setFormIsHealthy] = useState<boolean>(false);
  const [formCalories, setFormCalories] = useState<number>(850);
  const [formProtein, setFormProtein] = useState<number>(52);
  const [formCarbs, setFormCarbs] = useState<number>(48);
  const [formFat, setFormFat] = useState<number>(46);
  const [formDietTags, setFormDietTags] = useState<string[]>(['high_protein']);

  // Fetch PostgreSQL Users, Menu Items, Reviews & Reclamations on Mount + Real-Time Sync
  const loadAdminData = () => {
    // 1. Fetch Users
    fetch('/api/users')
      .then(res => res.ok ? res.json() : [])
      .then(dbUsers => {
        if (Array.isArray(dbUsers) && dbUsers.length > 0) {
          const mappedUsers: AdminUserAccount[] = dbUsers.map((u: any) => ({
            id: u.id,
            name: u.name,
            email: u.email,
            phone: u.phone || '09 56 07 00 91',
            role: u.role || 'customer',
            status: 'active',
            createdAt: u.createdAt ? new Date(u.createdAt).toISOString().slice(0, 10) : '2026-08-12',
            orderCount: u._count?.orders || 0
          }));
          setUserList(mappedUsers);
        }
      })
      .catch(() => {});

    // 2. Fetch Menu Items & Load localStorage custom_dishes
    let customDishes: MenuItem[] = [];
    try {
      const saved = localStorage.getItem('custom_dishes');
      if (saved) customDishes = JSON.parse(saved);
    } catch {}

    fetch('/api/menu')
      .then(res => res.ok ? res.json() : null)
      .then(apiDishes => {
        const rawDishes = (Array.isArray(apiDishes) && apiDishes.length > 0)
          ? [...apiDishes, ...customDishes, ...MOCK_MENU]
          : [...customDishes, ...MOCK_MENU];
        const unique = rawDishes.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
        const sanitized = unique.map(d => ({
          ...d,
          price: Number(d.price) || 0
        }));
        setMenuItems(sanitized);
      })
      .catch(() => {
        const combined = [...customDishes, ...MOCK_MENU];
        const unique = combined.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
        const sanitized = unique.map(d => ({
          ...d,
          price: Number(d.price) || 0
        }));
        setMenuItems(sanitized);
      });

    // 3. Fetch Reviews from PostgreSQL & localStorage
    let customRevs: Review[] = [];
    try {
      const savedRevs = localStorage.getItem('custom_reviews');
      if (savedRevs) customRevs = JSON.parse(savedRevs);
    } catch {}

    fetch('/api/reviews')
      .then(res => res.ok ? res.json() : null)
      .then(apiRevs => {
        if (Array.isArray(apiRevs) && apiRevs.length > 0) {
          const combined = [...apiRevs, ...customRevs, ...MOCK_REVIEWS];
          const unique = combined.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
          setReviewsList(unique);
        } else {
          const combined = [...customRevs, ...MOCK_REVIEWS];
          const unique = combined.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
          setReviewsList(unique);
        }
      })
      .catch(() => {
        const combined = [...customRevs, ...MOCK_REVIEWS];
        const unique = combined.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
        setReviewsList(unique);
      });

    // 4. Fetch Reclamations from PostgreSQL & localStorage
    let customRecs: Reclamation[] = [];
    try {
      const savedRecs = localStorage.getItem('custom_reclamations');
      if (savedRecs) customRecs = JSON.parse(savedRecs);
    } catch {}

    fetch('/api/reclamations')
      .then(res => res.ok ? res.json() : null)
      .then(apiRecs => {
        if (Array.isArray(apiRecs) && apiRecs.length > 0) {
          const combined = [...apiRecs, ...customRecs, ...MOCK_RECLAMATIONS];
          const unique = combined.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
          setClaimsList(unique);
        } else {
          const combined = [...customRecs, ...MOCK_RECLAMATIONS];
          const unique = combined.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
          setClaimsList(unique);
        }
      })
      .catch(() => {
        const combined = [...customRecs, ...MOCK_RECLAMATIONS];
        const unique = combined.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
        setClaimsList(unique);
      });
  };

  useEffect(() => {
    loadAdminData();
    loadChanceAdminData();
    window.addEventListener('storage', loadAdminData);
    return () => window.removeEventListener('storage', loadAdminData);
  }, []);

  // --- SECTION JEU TENTE TA CHANCE & CODES PROMO STATE ---
  const [chanceGameActive, setChanceGameActive] = useState<boolean>(true);
  const [chanceProbabilities, setChanceProbabilities] = useState<Record<string, number>>({
    '10_percent': 30,
    'free_drink': 20,
    '15_percent': 20,
    'free_fries': 15,
    'free_delivery': 10,
    '20_percent': 5
  });
  const [chanceCodes, setChanceCodes] = useState<PromoCode[]>([]);
  const [chanceCodeSearch, setChanceCodeSearch] = useState('');
  const [chanceCodeFilter, setChanceCodeFilter] = useState<'all' | 'active' | 'used' | 'expired'>('all');
  const [isSavingChanceSettings, setIsSavingChanceSettings] = useState(false);
  const [chanceSettingsSaved, setChanceSettingsSaved] = useState(false);
  const [adminQrDataUrl, setAdminQrDataUrl] = useState<string>('');

  const loadChanceAdminData = () => {
    fetch('/api/chance/settings')
      .then(res => res.json())
      .then(data => {
        if (data.settings) {
          setChanceGameActive(data.settings.isGameActive);
          if (data.settings.probabilities) {
            setChanceProbabilities(data.settings.probabilities);
          }
        }
      })
      .catch(() => {});

    fetch('/api/chance/codes')
      .then(res => res.json())
      .then(data => {
        if (data.codes) {
          setChanceCodes(data.codes);
        }
      })
      .catch(() => {});

    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}/chance`;
      QRCode.toDataURL(url, {
        width: 600,
        margin: 4,
        color: { dark: '#000000', light: '#FFFFFF' }
      }).then(dataUrl => setAdminQrDataUrl(dataUrl)).catch(() => {});
    }
  };

  const handleToggleChanceGame = async () => {
    const nextState = !chanceGameActive;
    setChanceGameActive(nextState);
    await fetch('/api/chance/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isGameActive: nextState })
    });
    addLog(`Modification statut Jeu Roue`, `Jeu ${nextState ? 'ACTIVÉ' : 'MIS EN PAUSE'}`);
  };

  const handleSaveProbabilities = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingChanceSettings(true);
    setChanceSettingsSaved(false);
    try {
      const res = await fetch('/api/chance/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ probabilities: chanceProbabilities })
      });
      if (res.ok) {
        setChanceSettingsSaved(true);
        setTimeout(() => setChanceSettingsSaved(false), 3000);
        addLog(`Mise à jour probabilités`, `Probabilités du jeu de la roue modifiées`);
      }
    } finally {
      setIsSavingChanceSettings(false);
    }
  };

  const handleToggleCodeUsed = async (codeId: string, currentStatus: boolean) => {
    const nextStatus = !currentStatus;
    const res = await fetch('/api/chance/codes', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ codeId, isUsed: nextStatus })
    });
    if (res.ok) {
      setChanceCodes(prev => prev.map(c => c.id === codeId || c.code === codeId ? { ...c, isUsed: nextStatus, usedAt: nextStatus ? new Date().toISOString() : undefined } : c));
      addLog(`Marquage Code Promo`, `Code ${codeId} marqué comme ${nextStatus ? 'UTILISÉ' : 'ACTIF'}`);
    }
  };

  const handleDeleteCode = async (codeId: string) => {
    if (!confirm('Voulez-vous supprimer ce code promo définitivement ?')) return;
    const res = await fetch(`/api/chance/codes?id=${codeId}`, { method: 'DELETE' });
    if (res.ok) {
      setChanceCodes(prev => prev.filter(c => c.id !== codeId && c.code !== codeId));
      addLog(`Suppression Code Promo`, `Code ${codeId} supprimé`);
    }
  };

  // --- SECTION 7: AUDIT LOGS STATE ---
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
    { id: 'log-1', adminName: 'Super Admin ben moussa malek', action: 'Changement de statut commande', target: 'ORD-6190 ➔ Prête', timestamp: '2026-08-08 15:15' },
    { id: 'log-2', adminName: 'Super Admin ben moussa malek', action: 'Désactivation de compte client', target: 'Client Mohamed Ali (dali@example.com)', timestamp: '2026-08-08 14:30' },
    { id: 'log-3', adminName: 'Ines (Caissière)', action: 'Validation de paiement', target: 'Paiement Carte Table #03 (18.50 €)', timestamp: '2026-08-08 13:40' }
  ]);

  // --- SECTION 8: SETTINGS STATE ---
  const [onlineOrderingEnabled, setOnlineOrderingEnabled] = useState(true);
  const [deliveryFeeEUR, setDeliveryFeeEUR] = useState('3.50');
  const [openingHours, setOpeningHours] = useState('7j/7 : 11h30 – 02h00');
  const [restaurantAddress, setRestaurantAddress] = useState('42 Avenue des Champs-Élysées, 75008 Paris');
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  // Helper log addition
  const addLog = (action: string, target: string) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      adminName: user?.name || 'Admin',
      action,
      target,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16)
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Admin Login Handler
  const handleAdminGateLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPasswordInput === 'admin123' || adminPasswordInput === 'admin') {
      await login('malekmoussa0710@gmail.com', 'admin', 'Super Administrateur ben moussa malek', '+216 27 500 246');
      setAdminAuthError(false);
      setAdminPasswordInput('');
    } else {
      setAdminAuthError(true);
    }
  };

  // Admin Logout Handler
  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  // KPIs Calculations
  const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  const avgBasket = orders.length > 0 ? totalRevenue / orders.length : 0;
  const pendingClaimsCount = claimsList.filter(c => c.status !== 'resolved').length;

  // Filtered Lists
  const filteredUsers = userList.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const filteredOrdersList = orders.filter(o => {
    const matchesSearch = o.id.toLowerCase().includes(orderSearch.toLowerCase()) || o.userName.toLowerCase().includes(orderSearch.toLowerCase());
    const matchesStatus = orderStatusFilter === 'all' || o.status === orderStatusFilter;
    const matchesMode = orderModeFilter === 'all' || o.serviceMode === orderModeFilter;
    return matchesSearch && matchesStatus && matchesMode;
  });

  const filteredReviewsList = reviewsList.filter(r => {
    return reviewRatingFilter === 'all' || r.rating === Number(reviewRatingFilter);
  });

  const filteredMenuList = menuItems.filter(m => menuCategoryFilter === 'all' || m.category === menuCategoryFilter);

  // User Actions
  const toggleUserStatus = (userId: string) => {
    setUserList(prev => prev.map(u => {
      if (u.id === userId) {
        const nextStatus = u.status === 'active' ? 'disabled' : 'active';
        addLog(`Modification statut compte`, `${u.name} ➔ ${nextStatus}`);
        return { ...u, status: nextStatus };
      }
      return u;
    }));
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail) return;
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newUserName,
          email: newUserEmail,
          phone: newUserPhone || '+33 1 00 00 00 00',
          role: newUserRole,
        })
      });
      const data = await res.json();
      const newAccount: AdminUserAccount = {
        id: data.id || `usr-${Date.now()}`,
        name: data.name || newUserName,
        email: data.email || newUserEmail,
        phone: data.phone || newUserPhone || '+33 1 00 00 00 00',
        role: data.role || newUserRole,
        status: 'active',
        createdAt: data.createdAt ? new Date(data.createdAt).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
        orderCount: 0
      };
      setUserList(prev => [newAccount, ...prev.filter(u => u.id !== newAccount.id)]);
      addLog(`Création de compte ${newUserRole}`, `${newUserName} (${newUserEmail})`);
    } catch {
      const newAccount: AdminUserAccount = {
        id: `usr-${Date.now()}`,
        name: newUserName,
        email: newUserEmail,
        phone: newUserPhone || '+33 1 00 00 00 00',
        role: newUserRole,
        status: 'active',
        createdAt: new Date().toISOString().slice(0, 10),
        orderCount: 0
      };
      setUserList(prev => [newAccount, ...prev]);
      addLog(`Création de compte ${newUserRole}`, `${newUserName} (${newUserEmail})`);
    }
    setShowAddUserModal(false);
    setNewUserName('');
    setNewUserEmail('');
    setNewUserPhone('');
  };

  // Product Stock Toggle
  const toggleProductStock = (productId: string) => {
    setMenuItems(prev => prev.map(p => {
      if (p.id === productId) {
        const nextState = !p.isPopular;
        addLog(`Changement disponibilité produit`, `${p.name.fr}`);
        return { ...p, isPopular: nextState };
      }
      return p;
    }));
  };

  // Open Add Product Modal
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setFormNameFr('');
    setFormNameAr('');
    setFormNameEn('');
    setFormCategory('burgers');
    setFormPriceEUR('12.90');
    setFormDescFr('');
    setFormDescAr('');
    setFormDescEn('');
    setFormImage('https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80');
    setFormSpiceLevel(0);
    setFormPrepTime(15);
    setFormIsPopular(true);
    setFormIsNew(true);
    setFormIsHealthy(false);
    setFormCalories(650);
    setFormProtein(35);
    setFormCarbs(45);
    setFormFat(25);
    setFormDietTags(['high_protein']);
    setShowAddProductModal(true);
  };

  // Open Edit Product Modal
  const handleOpenEditProduct = (dish: MenuItem) => {
    setEditingProduct(dish);
    setFormNameFr(dish.name.fr || '');
    setFormNameAr(dish.name.ar || '');
    setFormNameEn(dish.name.en || '');
    setFormCategory(dish.category || 'burgers');
    setFormPriceEUR(dish.price !== undefined ? dish.price.toString() : '0');
    setFormDescFr(dish.description.fr || '');
    setFormDescAr(dish.description.ar || '');
    setFormDescEn(dish.description.en || '');
    setFormImage(dish.image || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80');
    setFormSpiceLevel(dish.spiceLevel || 0);
    setFormPrepTime(dish.preparationTimeMinutes || 15);
    setFormIsPopular(dish.isPopular ?? true);
    setFormIsNew(dish.isNew ?? false);
    setFormIsHealthy(dish.isHealthy || dish.category === 'healthy' || dish.category === 'gym');
    setFormCalories(dish.nutrition?.calories || 500);
    setFormProtein(dish.nutrition?.protein || 30);
    setFormCarbs(dish.nutrition?.carbs || 20);
    setFormFat(dish.nutrition?.fat || 15);
    setFormDietTags(dish.dietTags || []);
    setShowAddProductModal(true);
  };

  // Delete Product
  const handleDeleteProduct = async (dish: MenuItem) => {
    const confirmDelete = window.confirm(`Voulez-vous vraiment supprimer le plat "${dish.name.fr}" de la carte ?`);
    if (!confirmDelete) return;

    // Delete in PostgreSQL via API
    try {
      await fetch(`/api/menu?id=${encodeURIComponent(dish.id)}`, {
        method: 'DELETE',
      });
    } catch {}

    setMenuItems(prev => {
      const updated = prev.filter(m => m.id !== dish.id);
      try {
        localStorage.setItem('custom_dishes', JSON.stringify(updated));
        window.dispatchEvent(new Event('storage'));
      } catch {}
      return updated;
    });

    addLog('Suppression plat du menu', `${dish.name.fr}`);
  };

  // Create or Update Product in Database & State with complete frontend fields in Euro €
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNameFr || !formPriceEUR) return;

    if (editingProduct) {
      // UPDATE EXISTING DISH
      const updatedDish: MenuItem = {
        ...editingProduct,
        name: {
          fr: formNameFr,
          ar: formNameAr || formNameFr,
          en: formNameEn || formNameFr
        },
        description: {
          fr: formDescFr || 'Spécialité gourmande Le Crispy',
          ar: formDescAr || formDescFr,
          en: formDescEn || formDescFr
        },
        price: parseFloat(formPriceEUR),
        category: formCategory,
        image: formImage,
        spiceLevel: formSpiceLevel as 0 | 1 | 2 | 3,
        isHealthy: formIsHealthy || formCategory === 'healthy' || formCategory === 'gym',
        isPopular: formIsPopular,
        isNew: formIsNew,
        preparationTimeMinutes: formPrepTime,
        nutrition: {
          calories: formCalories,
          protein: formProtein,
          carbs: formCarbs,
          fat: formFat
        },
        dietTags: formDietTags as any[]
      };

      // Save to PostgreSQL via API
      try {
        await fetch('/api/menu', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedDish)
        });
      } catch {}

      // Update State & localStorage
      setMenuItems(prev => {
        const next = prev.map(m => m.id === updatedDish.id ? updatedDish : m);
        try {
          localStorage.setItem('custom_dishes', JSON.stringify(next));
          window.dispatchEvent(new Event('storage'));
        } catch {}
        return next;
      });

      addLog(`Modification plat du menu`, `${formNameFr} (${formPriceEUR} €)`);
      setShowAddProductModal(false);
      setEditingProduct(null);
    } else {
      // CREATE NEW DISH
      const newDish: MenuItem = {
        id: `dish-${Date.now()}`,
        name: {
          fr: formNameFr,
          ar: formNameAr || formNameFr,
          en: formNameEn || formNameFr
        },
        description: {
          fr: formDescFr || 'Spécialité gourmande Le Crispy',
          ar: formDescAr || formDescFr,
          en: formDescEn || formDescFr
        },
        price: parseFloat(formPriceEUR),
        category: formCategory,
        image: formImage,
        spiceLevel: formSpiceLevel as 0 | 1 | 2 | 3,
        isHealthy: formIsHealthy || formCategory === 'healthy' || formCategory === 'gym',
        isPopular: formIsPopular,
        isNew: formIsNew,
        preparationTimeMinutes: formPrepTime,
        nutrition: {
          calories: formCalories,
          protein: formProtein,
          carbs: formCarbs,
          fat: formFat
        },
        dietTags: formDietTags as any[]
      };

      // Save to PostgreSQL via API
      try {
        await fetch('/api/menu', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newDish)
        });
      } catch {}

      // Save to localStorage for real-time frontend & dashboard sync
      try {
        const existing = localStorage.getItem('custom_dishes');
        const list = existing ? JSON.parse(existing) : [];
        const updated = [newDish, ...list];
        localStorage.setItem('custom_dishes', JSON.stringify(updated));
        window.dispatchEvent(new Event('storage'));
      } catch {}

      setMenuItems(prev => [newDish, ...prev]);
      addLog(`Ajout plat au menu (PostgreSQL)`, `${formNameFr} (${formPriceEUR} €)`);
      setShowAddProductModal(false);
    }

    // Reset Form
    setFormNameFr('');
    setFormNameAr('');
    setFormNameEn('');
    setFormDescFr('');
    setFormDescAr('');
    setFormDescEn('');
  };

  // Save Settings
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    addLog(`Modification paramètres généraux`, `Frais: ${deliveryFeeEUR} €, Statut Service: ${onlineOrderingEnabled ? 'Actif' : 'Maintenance'}`);
    setSettingsSuccess(true);
    setTimeout(() => setSettingsSuccess(false), 3000);
  };

  // ACCESS GUARD: If not logged in as admin, show security unlock screen
  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <div className="card-gold p-8 max-w-md w-full text-center space-y-6 bg-stone-950 border border-[var(--border-gold)] rounded-2xl shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-amber-500/20 border-2 border-[var(--accent-gold)] flex items-center justify-center mx-auto text-[var(--accent-gold)]">
            <Lock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="font-gold text-2xl font-bold text-gold-gradient">
              Portail d'Administration
            </h2>
            <p className="text-xs text-stone-400">
              {user ? (
                <>
                  Connecté en tant que client (<span className="text-[var(--accent-gold)]">{user.email}</span>).
                  <span className="text-amber-400 font-semibold mt-1 block">Cet espace est strictement réservé au personnel muni d'un mot de passe administrateur.</span>
                </>
              ) : (
                'Accès restreint. Veuillez saisir le mot de passe administrateur pour accéder au tableau de bord.'
              )}
            </p>
          </div>

          <form onSubmit={handleAdminGateLogin} className="space-y-4 text-left">
            <div>
              <label className="text-xs font-semibold text-stone-300 block mb-1">
                Mot de passe Super Admin :
              </label>
              <input
                type="password"
                required
                placeholder="Mot de passe admin (admin123)..."
                value={adminPasswordInput}
                onChange={e => {
                  setAdminPasswordInput(e.target.value);
                  setAdminAuthError(false);
                }}
                className="w-full bg-stone-900 border border-[var(--border-gold)]/60 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[var(--accent-gold)] font-mono"
              />
              {adminAuthError && (
                <p className="text-[11px] text-rose-400 mt-1.5 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> Mot de passe administrateur incorrect.
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full btn-gold py-2.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg"
            >
              <Unlock className="w-4 h-4" />
              <span>Déverrouiller le Dashboard</span>
            </button>
          </form>

          <div className="pt-4 border-t border-stone-800 flex flex-col sm:flex-row gap-2">
            <Link
              href="/login"
              className="flex-1 py-2 rounded-xl bg-stone-900 border border-stone-700 text-stone-300 hover:text-white text-xs font-bold text-center transition-colors"
            >
              Page de Connexion
            </Link>
            <Link
              href="/"
              className="flex-1 py-2 rounded-xl bg-stone-900 border border-stone-700 text-stone-300 hover:text-white text-xs font-bold text-center transition-colors"
            >
              Retour au Site
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // STANDALONE ADMIN PORTAL LAYOUT (ISOLATED FROM CUSTOMER FRONTEND HEADER/FOOTER)
  // =========================================================================
  return (
    <div className="min-h-screen bg-black text-white flex flex-col md:flex-row select-none">
      
      {/* LEFT ADMIN SIDEBAR */}
      <aside className="w-full md:w-64 bg-stone-950 border-r border-[var(--border-gold)]/40 p-5 flex flex-col justify-between shrink-0 space-y-6">
        
        <div className="space-y-6">
          {/* Logo & Brand Header */}
          <div className="flex items-center gap-3 pb-4 border-b border-[var(--border-gold)]/40">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#c9a24a] to-[#a8823a] p-0.5 overflow-hidden shadow-[0_0_20px_rgba(201,162,74,0.5)] shrink-0">
              <img src="/logo.png" alt="Le Crispy Logo" className="w-full h-full object-cover rounded-full" />
            </div>
            <div>
              <h2 className="font-gold font-extrabold text-lg text-gold-gradient leading-tight">
                Le Crispy
              </h2>
              <span className="text-[10px] text-[var(--accent-gold)] font-mono uppercase tracking-widest block">
                ADMIN PORTAL
              </span>
            </div>
          </div>

          {/* Sidebar Navigation Items */}
          <nav className="space-y-1.5 text-xs font-bold">
            {[
              { id: 'overview', label: "1. Tableau de Bord", icon: LayoutDashboard },
              { id: 'users', label: "2. Utilisateurs & Staff", icon: Users, badge: userList.length },
              { id: 'orders', label: "3. Commandes Live", icon: ShoppingBag, badge: orders.length },
              { id: 'claims', label: "4. Réclamations", icon: AlertTriangle, badge: pendingClaimsCount },
              { id: 'reviews', label: "5. Avis Clients", icon: Star, badge: reviewsList.length },
              { id: 'menu', label: "6. Gestion Carte Menu", icon: Utensils, badge: menuItems.length },
              { id: 'chance', label: "7. Jeu & Roue de la Fortune", icon: Sparkles, badge: chanceCodes.length },
              { id: 'logs', label: "8. Journal Actions", icon: History, badge: auditLogs.length },
              { id: 'settings', label: "9. Paramètres", icon: Settings }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeSection === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveSection(tab.id as any)}
                  className={`w-full px-3.5 py-3 rounded-xl flex items-center justify-between transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-[#c9a24a] to-[#a8823a] text-[#0d1f14] shadow-[0_0_20px_rgba(201,162,74,0.4)] font-extrabold'
                      : 'text-stone-300 hover:bg-stone-900 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </div>
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                      isActive ? 'bg-[#0d1f14] text-[var(--accent-gold)]' : 'bg-stone-800 text-stone-300'
                    }`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Admin Profile & Back to Site Link */}
        <div className="pt-4 border-t border-[var(--border-gold)]/30 space-y-3">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-stone-900 border border-[var(--border-gold)]/30">
            <div className="w-8 h-8 rounded-full bg-[var(--accent-gold)] text-[#0d1f14] flex items-center justify-center font-bold text-xs">
              BM
            </div>
            <div className="flex-1 min-w-0 text-left">
              <span className="font-bold text-xs text-white block truncate">
                {user?.name && !user.name.toLowerCase().includes('moussaoui') && !user.name.toLowerCase().includes('amani') && !user.name.toLowerCase().includes('ameni') && !user.name.toLowerCase().includes('youssef') ? user.name : 'ben moussa malek'}
              </span>
              <span className="text-[10px] text-emerald-400 block font-mono">Super Admin</span>
            </div>
          </div>

          <div className="flex gap-2">
            <Link
              href="/"
              className="flex-1 btn-gold-outline py-2 text-[11px] text-center font-bold flex items-center justify-center gap-1"
            >
              <span>Site Client</span>
            </Link>
            <button
              onClick={handleLogout}
              className="px-3 py-2 rounded-xl bg-rose-950/70 border border-rose-500 text-rose-300 hover:bg-rose-900 transition-colors flex items-center gap-1.5 font-bold text-xs shadow-md"
              title="Déconnexion du Dashboard"
            >
              <LogOut className="w-4 h-4" />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>

      </aside>

      {/* RIGHT MAIN ADMIN WORKSPACE */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto space-y-8 bg-black">
        
        {/* Top Bar Workspace Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-[var(--border-gold)]/40">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-[var(--accent-gold)] uppercase tracking-wider">Espace d'Administration</span>
              <span className="px-2 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-500 text-[10px] font-mono">EN DIRECT</span>
            </div>
            <h1 className="font-gold text-2xl sm:text-3xl font-extrabold text-gold-gradient">
              {activeSection === 'overview' && "1. Vue d'Ensemble & Statistiques Financières"}
              {activeSection === 'users' && "2. Gestion des Comptes Utilisateurs & Brigade"}
              {activeSection === 'orders' && "3. Moniteur des Commandes en Direct"}
              {activeSection === 'claims' && "4. Centre de Traitement des Réclamations"}
              {activeSection === 'reviews' && "5. Modération des Avis & Commentaires"}
              {activeSection === 'menu' && "6. Gestion de la Carte & Ingrédients du Menu"}
              {activeSection === 'logs' && "7. Traçabilité & Journal d'Audit des Actions"}
              {activeSection === 'settings' && "8. Configuration Générale du Restaurant"}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center bg-stone-900 border border-[var(--border-gold)]/40 rounded-full p-1 text-xs">
              {(['today', 'week', 'month'] as const).map(p => (
                <button
                  key={p}
                  onClick={() => setPeriodFilter(p)}
                  className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-all ${
                    periodFilter === p ? 'bg-[var(--accent-gold)] text-[#0d1f14]' : 'text-stone-400'
                  }`}
                >
                  {p === 'today' ? "Aujourd'hui" : p === 'week' ? "Semaine" : "Mois"}
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowExportModal(true)}
              className="btn-gold px-4 py-2 text-xs flex items-center gap-1.5 shadow-md hover:scale-105 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Exporter Rapport</span>
            </button>

            <button
              onClick={handleLogout}
              className="px-3.5 py-2 rounded-full border border-rose-500/60 bg-rose-950/40 text-rose-300 hover:bg-rose-900/60 text-xs font-bold flex items-center gap-1.5 transition-all shadow-md"
              title="Déconnexion du tableau de bord"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Déconnexion</span>
            </button>
          </div>
        </div>

        {/* SECTION 1: VUE D'ENSEMBLE & RICH STATISTICAL CHARTS (EURO €) */}
        {activeSection === 'overview' && (
          <div className="space-y-8">
            
            {/* KPI Stat Cards (Euro €) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              
              <div className="card-gold p-6 space-y-2 bg-gradient-to-br from-stone-950 to-[#0d1f14] border-[var(--border-gold)]">
                <div className="flex justify-between items-center text-stone-400 text-xs font-bold uppercase">
                  <span>Chiffre d'Affaires</span>
                  <DollarSign className="w-5 h-5 text-[var(--accent-gold)]" />
                </div>
                <div className="font-gold font-extrabold text-3xl text-white">
                  {totalRevenue.toFixed(2)} €
                </div>
                <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-mono">
                  <ArrowUpRight className="w-3.5 h-3.5" /> +18.4% vs période précédente
                </span>
              </div>

              <div className="card-gold p-6 space-y-2 bg-gradient-to-br from-stone-950 to-[#0d1f14] border-[var(--border-gold)]">
                <div className="flex justify-between items-center text-stone-400 text-xs font-bold uppercase">
                  <span>Commandes Total</span>
                  <ShoppingBag className="w-5 h-5 text-sky-400" />
                </div>
                <div className="font-gold font-extrabold text-3xl text-sky-400">
                  {orders.length}
                </div>
                <span className="text-[11px] text-stone-400">Suivi en temps réel</span>
              </div>

              <div className="card-gold p-6 space-y-2 bg-gradient-to-br from-stone-950 to-[#0d1f14] border-[var(--border-gold)]">
                <div className="flex justify-between items-center text-stone-400 text-xs font-bold uppercase">
                  <span>Panier Moyen</span>
                  <Activity className="w-5 h-5 text-amber-400" />
                </div>
                <div className="font-gold font-extrabold text-3xl text-amber-400">
                  {avgBasket.toFixed(2)} €
                </div>
                <span className="text-[11px] text-stone-400">Menu Gourmet 5 Étoiles</span>
              </div>

              <div className="card-gold p-6 space-y-2 bg-gradient-to-br from-stone-950 to-[#0d1f14] border-[var(--border-gold)]">
                <div className="flex justify-between items-center text-stone-400 text-xs font-bold uppercase">
                  <span>Alertes Support</span>
                  <AlertTriangle className="w-5 h-5 text-rose-400 animate-pulse" />
                </div>
                <div className="font-gold font-extrabold text-3xl text-rose-400">
                  {pendingClaimsCount}
                </div>
                <span className="text-[11px] text-rose-300">Action requise</span>
              </div>

            </div>

            {/* Sales Charts & Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              <div className="lg:col-span-8 card-gold p-6 space-y-4 bg-stone-950">
                <div className="flex justify-between items-center border-b border-[var(--border-gold)]/40 pb-3">
                  <h3 className="font-gold font-bold text-lg text-white">Évolution des Ventes ({periodFilter})</h3>
                  <span className="text-xs text-[var(--accent-gold)] font-mono">Devise: Euro (€)</span>
                </div>
                
                {/* Dynamic Visual Bar Chart with Euro Amounts */}
                <div className="h-64 flex items-end justify-between gap-3 pt-6 px-2 bg-stone-900/60 rounded-2xl border border-[var(--border-gold)]/20 p-4">
                  {getSalesChartData().map((bar, i) => (
                    <div key={i} className="flex-1 h-full flex flex-col items-center justify-end gap-2 group relative">
                      
                      {/* Price Badge on top of Bar */}
                      <div className="opacity-90 group-hover:opacity-100 transition-opacity bg-black/90 border border-[var(--accent-gold)] px-2 py-0.5 rounded text-[10px] text-[var(--accent-gold)] font-mono font-bold whitespace-nowrap shadow-lg">
                        {bar.sales.toFixed(0)} €
                      </div>

                      {/* Bar flex container */}
                      <div className="w-full flex-1 flex items-end justify-center px-1">
                        <div 
                          style={{ height: `${Math.max(bar.percentage, 12)}%` }}
                          className="w-full max-w-[42px] bg-gradient-to-t from-[#c9a24a] via-amber-400 to-yellow-200 rounded-t-lg group-hover:brightness-125 transition-all duration-500 shadow-[0_0_20px_rgba(201,162,74,0.5)] border-t border-amber-300"
                        />
                      </div>

                      {/* Label under bar */}
                      <span className="text-[11px] font-mono text-stone-300 font-bold tracking-wider">{bar.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-4 card-gold p-6 space-y-4 bg-stone-950">
                <h3 className="font-gold font-bold text-lg text-white border-b border-[var(--border-gold)]/40 pb-3">
                  Répartition des Ventes
                </h3>
                <div className="space-y-4 text-xs">
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-white font-bold">Burgers Prestige</span>
                      <span className="text-[var(--accent-gold)] font-bold">52%</span>
                    </div>
                    <div className="w-full h-2 bg-stone-900 rounded-full overflow-hidden">
                      <div className="h-full bg-[var(--accent-gold)] w-[52%]" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-white font-bold">Healthy & Fitness</span>
                      <span className="text-emerald-400 font-bold">28%</span>
                    </div>
                    <div className="w-full h-2 bg-stone-900 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-400 w-[28%]" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-white font-bold">Desserts & Boissons</span>
                      <span className="text-amber-400 font-bold">20%</span>
                    </div>
                    <div className="w-full h-2 bg-stone-900 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-400 w-[20%]" />
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Top 5 & Alerts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="card-gold p-6 space-y-4 bg-stone-950">
                <h3 className="font-gold font-bold text-lg text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[var(--accent-gold)]" />
                  <span>Top 5 des Plats les Plus Vendus</span>
                </h3>
                <div className="space-y-3 text-xs">
                  {menuItems.slice(0, 5).map((dish, idx) => (
                    <div key={dish.id} className="flex items-center justify-between p-3 rounded-xl bg-stone-900 border border-[var(--border-gold)]/30">
                      <div className="flex items-center gap-3">
                        <span className="font-gold font-bold text-base text-[var(--accent-gold)]">#{idx + 1}</span>
                        <img src={dish.image} alt={dish.name.fr} className="w-10 h-10 rounded-lg object-cover" />
                        <div>
                          <span className="font-bold text-white block">{dish.name.fr}</span>
                          <span className="text-[10px] text-stone-400 uppercase">{dish.category}</span>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-[var(--accent-gold)]">{Number(dish.price || 0).toFixed(2)} €</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card-gold p-6 space-y-4 bg-stone-950">
                <h3 className="font-gold font-bold text-lg text-white flex items-center gap-2 text-rose-400">
                  <AlertTriangle className="w-5 h-5" />
                  <span>Alertes Support</span>
                </h3>
                <div className="space-y-3 text-xs">
                  {claimsList.filter(c => c.status !== 'resolved').map(claim => (
                    <div key={claim.id} className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/50 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-rose-300">{claim.subject} ({claim.userName})</span>
                        <span className="text-[10px] text-rose-400 font-mono">{claim.createdAt}</span>
                      </div>
                      <p className="text-[11px] text-rose-200">{claim.description}</p>
                    </div>
                  ))}
                  {claimsList.filter(c => c.status !== 'resolved').length === 0 && (
                    <div className="text-center py-8 text-emerald-400 text-xs font-bold">
                      ✓ Aucune réclamation urgente.
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        )}

        {/* SECTION 2: GESTION DES UTILISATEURS */}
        {activeSection === 'users' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-stone-950 border border-[var(--border-gold)]">
              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="w-4 h-4 text-[var(--accent-gold)] absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Rechercher nom, email..."
                    value={userSearch}
                    onChange={e => setUserSearch(e.target.value)}
                    className="w-full bg-black border border-[var(--border-gold)] rounded-full pl-9 pr-4 py-2 text-xs text-white"
                  />
                </div>

                <select
                  value={roleFilter}
                  onChange={e => setRoleFilter(e.target.value)}
                  className="bg-black border border-[var(--border-gold)] rounded-full px-3 py-2 text-xs text-white"
                >
                  <option value="all">Tous les Rôles</option>
                  <option value="customer">Clients</option>
                  <option value="cook">Cuisiniers</option>
                  <option value="cashier">Caissiers</option>
                  <option value="admin">Admins</option>
                </select>
              </div>

              <button
                onClick={() => setShowAddUserModal(true)}
                className="btn-gold px-4 py-2 text-xs flex items-center gap-1.5 w-full sm:w-auto justify-center"
              >
                <Plus className="w-4 h-4" />
                <span>Créer Compte Employé / Caissier</span>
              </button>
            </div>

            <div className="card-gold overflow-hidden bg-stone-950">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-900 border-b border-[var(--border-gold)] text-[var(--accent-gold)] font-gold uppercase tracking-wider">
                    <tr>
                      <th className="p-3.5">Utilisateur</th>
                      <th className="p-3.5">Contact</th>
                      <th className="p-3.5">Rôle</th>
                      <th className="p-3.5">Commandes</th>
                      <th className="p-3.5">Statut</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-gold)]/30">
                    {filteredUsers.map(u => (
                      <tr key={u.id} className="hover:bg-stone-900/60 transition-colors">
                        <td className="p-3.5">
                          <span className="font-bold text-white block">{u.name}</span>
                          <span className="text-[10px] text-stone-400 font-mono">Inscrit: {u.createdAt}</span>
                        </td>
                        <td className="p-3.5">
                          <span className="text-white block">{u.email}</span>
                          <span className="text-[10px] text-[var(--accent-gold)] font-mono">{u.phone}</span>
                        </td>
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            u.role === 'admin' ? 'bg-amber-950 text-amber-300 border border-amber-500' :
                            u.role === 'cook' ? 'bg-emerald-950 text-emerald-300 border border-emerald-500' :
                            u.role === 'cashier' ? 'bg-sky-950 text-sky-300 border border-sky-500' : 'bg-stone-800 text-stone-300'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="p-3.5 font-bold font-mono text-[var(--accent-gold)]">
                          {u.orderCount} cmd(s)
                        </td>
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            u.status === 'active' ? 'text-emerald-400 bg-emerald-950' : 'text-rose-400 bg-rose-950'
                          }`}>
                            {u.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-right space-x-2">
                          <button
                            onClick={() => setSelectedUserDetail(u)}
                            className="p-1 text-sky-400 hover:text-sky-300"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => toggleUserStatus(u.id)}
                            className="p-1 text-amber-400 hover:text-amber-300"
                          >
                            {u.status === 'active' ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4 text-emerald-400" />}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 3: GESTION DES COMMANDES */}
        {activeSection === 'orders' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-stone-950 border border-[var(--border-gold)] text-xs">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Rechercher N° commande ou client..."
                  value={orderSearch}
                  onChange={e => setOrderSearch(e.target.value)}
                  className="bg-black border border-[var(--border-gold)] rounded-full px-4 py-2 text-xs text-white"
                />
                <select
                  value={orderStatusFilter}
                  onChange={e => setOrderStatusFilter(e.target.value)}
                  className="bg-black border border-[var(--border-gold)] rounded-full px-3 py-2 text-xs text-white"
                >
                  <option value="all">Tous les Statuts</option>
                  <option value="pending">En attente</option>
                  <option value="preparing">En préparation</option>
                  <option value="ready">Prête</option>
                  <option value="delivered">Livrée / Servie</option>
                </select>
              </div>
            </div>

            <div className="card-gold overflow-hidden bg-stone-950">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-900 border-b border-[var(--border-gold)] text-[var(--accent-gold)] font-gold uppercase tracking-wider">
                    <tr>
                      <th className="p-3.5">N° Commande</th>
                      <th className="p-3.5">Client & Contact</th>
                      <th className="p-3.5">Mode</th>
                      <th className="p-3.5">Montant Total</th>
                      <th className="p-3.5">Statut Actuel</th>
                      <th className="p-3.5 text-right">Actions & Statut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-gold)]/30">
                    {filteredOrdersList.map(ord => (
                      <tr key={ord.id} className="hover:bg-stone-900/60 transition-colors">
                        <td className="p-3.5 font-bold font-mono text-[var(--accent-gold)]">
                          {ord.id}
                        </td>
                        <td className="p-3.5">
                          <span className="font-bold text-white block">{ord.userName}</span>
                          <span className="text-[10px] text-stone-400">{ord.userPhone}</span>
                        </td>
                        <td className="p-3.5 uppercase font-bold text-[10px]">
                          {ord.serviceMode.replace('_', ' ')} {ord.tableNumber ? `(T#${ord.tableNumber})` : ''}
                        </td>
                        <td className="p-3.5 font-mono font-bold text-white">
                          {Number(ord.total || 0).toFixed(2)} €
                        </td>
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            ord.status === 'delivered' ? 'bg-emerald-950 text-emerald-300 border border-emerald-500' :
                            ord.status === 'preparing' ? 'bg-amber-950 text-amber-300 border border-amber-500' : 'bg-stone-800 text-stone-300'
                          }`}>
                            {ord.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-right space-x-2">
                          <button
                            onClick={() => updateOrderStatus(ord.id, 'preparing')}
                            className="px-2 py-1 text-[10px] font-bold bg-amber-500 text-black rounded"
                          >
                            Cuisine
                          </button>
                          <button
                            onClick={() => updateOrderStatus(ord.id, 'delivered')}
                            className="px-2 py-1 text-[10px] font-bold bg-emerald-500 text-black rounded"
                          >
                            Livrée
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 4: RÉCLAMATIONS */}
        {activeSection === 'claims' && (
          <div className="space-y-6">
            <h3 className="font-gold font-bold text-xl text-white">Gestion des Réclamations Clients</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {claimsList.map(claim => (
                <div key={claim.id} className="card-gold p-5 space-y-4 bg-stone-950 border-[var(--border-gold)]">
                  <div className="flex justify-between items-center border-b border-[var(--border-gold)]/40 pb-3">
                    <div>
                      <span className="font-gold font-bold text-sm text-[var(--accent-gold)]">{claim.id}</span>
                      <span className="text-xs text-white font-bold block">{claim.subject}</span>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      claim.status === 'resolved' ? 'bg-emerald-950 text-emerald-300 border border-emerald-500' : 'bg-rose-950 text-rose-300 border border-rose-500'
                    }`}>
                      {claim.status}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs text-stone-400">
                    <p><strong>Client :</strong> {claim.userName} ({claim.userEmail})</p>
                    <p><strong>Téléphone :</strong> {claim.userPhone}</p>
                    <p className="text-white pt-2 bg-black p-3 rounded-xl border border-[var(--border-gold)]/30">
                      "{claim.description}"
                    </p>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={() => {
                        setClaimsList(prev => prev.map(c => c.id === claim.id ? { ...c, status: 'resolved' } : c));
                        addLog('Résolution de réclamation', `${claim.id} (${claim.userName})`);
                      }}
                      className="btn-gold px-4 py-1.5 text-xs flex items-center gap-1"
                    >
                      <Check className="w-4 h-4" />
                      <span>Marquer comme Résolue</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 5: AVIS CLIENTS (MODÉRATION) */}
        {activeSection === 'reviews' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center p-4 rounded-xl bg-stone-950 border border-[var(--border-gold)] text-xs">
              <h3 className="font-gold font-bold text-base text-white">Modération des Avis Clients</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredReviewsList.map(rev => (
                <div key={rev.id} className="card-gold p-5 space-y-3 bg-stone-950">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <img src={rev.userAvatar} alt={rev.userName} className="w-10 h-10 rounded-full object-cover border border-[var(--border-gold)]" />
                      <div>
                        <span className="font-bold text-xs text-white block">{rev.userName}</span>
                        <span className="text-[10px] text-stone-400">{rev.date}</span>
                      </div>
                    </div>
                    <div className="flex text-amber-300">
                      {Array.from({ length: rev.rating }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-300" />
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-white italic bg-black p-3 rounded-xl border border-[var(--border-gold)]/30">
                    "{rev.comment}"
                  </p>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={() => {
                        setReviewsList(prev => prev.filter(r => r.id !== rev.id));
                        addLog('Masquage/Suppression avis', `Avis de ${rev.userName}`);
                      }}
                      className="text-rose-400 hover:text-rose-300 text-xs flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Masquer / Supprimer</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 6: GESTION DU MENU & FORMULAIRE CONFORME À L'AFFICHAGE FRONTEND (EURO €) */}
        {activeSection === 'menu' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-stone-950 border border-[var(--border-gold)]">
              <div className="flex items-center gap-3">
                <h3 className="font-gold font-bold text-base text-white">Gestion de la Carte du Restaurant</h3>
                <select
                  value={menuCategoryFilter}
                  onChange={e => setMenuCategoryFilter(e.target.value)}
                  className="bg-black border border-[var(--border-gold)] rounded-full px-3 py-1 text-xs text-white"
                >
                  <option value="all">Toutes les Catégories</option>
                  <option value="healthy">🥗 Healthy & Fitness (Salades & Bols)</option>
                  <option value="gym">🏋️ Plats Protéinés (Gym & Musculation)</option>
                  <option value="krousty">Krousty Gourmet</option>
                  <option value="texmex">Tex-Mex & Finger Food</option>
                  <option value="assiettes">Les Assiettes</option>
                  <option value="salades">Nos Salades</option>
                  <option value="pates">Nos Pâtes</option>
                  <option value="gratins">Nos Gratins</option>
                  <option value="burgers">Burgers & Tacos</option>
                  <option value="drinks">Boissons Fraîches</option>
                  <option value="desserts">Desserts Maison</option>
                </select>
              </div>

              <button 
                onClick={handleOpenAddProduct} 
                className="btn-gold px-5 py-2.5 text-xs font-bold flex items-center gap-2 shadow-lg hover:scale-105 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Ajouter un Plat au Menu (€)</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMenuList.map(dish => (
                <div key={dish.id} className="card-gold p-4 space-y-3 relative group bg-stone-950 border-[var(--border-gold)]">
                  <div className="relative h-44 w-full rounded-xl overflow-hidden border border-[var(--border-gold)]">
                    <img src={dish.image} alt={dish.name.fr} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    
                    <button
                      onClick={() => toggleProductStock(dish.id)}
                      className={`absolute top-2 right-2 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        dish.isPopular ? 'bg-emerald-950 text-emerald-300 border border-emerald-500' : 'bg-rose-950 text-rose-300 border border-rose-500'
                      }`}
                    >
                      {dish.isPopular ? "En Stock" : "Rupture"}
                    </button>
                  </div>

                  <div>
                    <div className="flex justify-between items-start">
                      <h4 className="font-gold font-bold text-sm text-white">{dish.name.fr}</h4>
                      <span className="font-gold font-bold text-base text-[var(--accent-gold)]">{Number(dish.price || 0).toFixed(2)} €</span>
                    </div>
                    <p className="text-[11px] text-stone-400 line-clamp-2 mt-1">{dish.description.fr}</p>

                    {dish.nutrition && (
                      <div className="grid grid-cols-3 gap-1 mt-2 p-1.5 rounded-lg bg-stone-900 border border-stone-800 text-[10px] text-center font-mono">
                        <div><span className="text-stone-400 block text-[9px]">Prot.</span><span className="text-emerald-400 font-bold">{dish.nutrition.protein || 30}g</span></div>
                        <div><span className="text-stone-400 block text-[9px]">Carbs</span><span className="text-amber-400 font-bold">{dish.nutrition.carbs || 20}g</span></div>
                        <div><span className="text-stone-400 block text-[9px]">Fat</span><span className="text-rose-400 font-bold">{dish.nutrition.fat || 15}g</span></div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[var(--border-gold)]/30">
                    <span className="text-[10px] text-stone-500 font-mono capitalize">
                      {dish.category}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEditProduct(dish)}
                        className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-[var(--accent-gold)] text-[var(--accent-gold)] hover:bg-[var(--accent-gold)] hover:text-[#0d1f14] transition-all text-xs font-bold flex items-center gap-1 shadow-sm"
                        title="Modifier ce plat"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Modifier</span>
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(dish)}
                        className="p-1.5 rounded-lg bg-rose-950/40 border border-rose-500/40 text-rose-400 hover:bg-rose-900/60 hover:text-rose-200 transition-all text-xs"
                        title="Supprimer ce plat"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* MODAL ADAPTÉE EXACTEMENT À L'AFFICHAGE FRONTEND EN EURO € ET MACRONUTRIMENTS */}
            {showAddProductModal && (
              <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 overflow-y-auto">
                <div className="bg-stone-950 border-2 border-[var(--accent-gold)] rounded-2xl p-6 sm:p-8 w-full max-w-5xl my-8 space-y-6 shadow-[0_0_60px_rgba(201,162,74,0.4)]">
                  
                  <div className="flex justify-between items-center border-b border-[var(--border-gold)] pb-4">
                    <div>
                      <h3 className="font-gold text-2xl font-bold text-gold-gradient flex items-center gap-2">
                        {editingProduct ? <Edit3 className="w-6 h-6 text-[var(--accent-gold)]" /> : <Plus className="w-6 h-6 text-[var(--accent-gold)]" />}
                        <span>
                          {editingProduct ? `Modifier le Plat : ${editingProduct.name.fr}` : "Ajouter un Plat au Menu & Espace Healthy / Gym (€)"}
                        </span>
                      </h3>
                      <p className="text-xs text-stone-400">
                        {editingProduct 
                          ? "Modifiez le nom, la description, le prix, la catégorie, la photo et les macronutriments du plat sélectionné." 
                          : "Formulaire conforme avec saisie des macronutriments (Prot., Carbs, Fat) et aperçu live frontend."}
                      </p>
                    </div>
                    <button 
                      onClick={() => {
                        setShowAddProductModal(false);
                        setEditingProduct(null);
                      }} 
                      className="text-stone-400 hover:text-white"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* LEFT COLUMN: FORM INPUTS */}
                    <form onSubmit={handleSaveProduct} className="lg:col-span-7 space-y-4 text-xs">
                      
                      <div className="space-y-1">
                        <label className="font-bold text-white block">Nom du produit (Français *)</label>
                        <input
                          type="text"
                          required
                          placeholder="Ex: Salade Méldoise ou Poulet Protéiné Gym"
                          value={formNameFr}
                          onChange={e => setFormNameFr(e.target.value)}
                          className="w-full bg-black border border-[var(--border-gold)] rounded-xl p-3 text-xs text-white"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="font-bold text-white block">Catégorie *</label>
                          <select
                            value={formCategory}
                            onChange={e => {
                              const cat = e.target.value;
                              setFormCategory(cat);
                              if (cat === 'healthy' || cat === 'gym') {
                                setFormIsHealthy(true);
                              }
                            }}
                            className="w-full bg-black border border-[var(--border-gold)] rounded-xl p-3 text-xs text-white"
                          >
                            <option value="healthy">🥗 Healthy & Fitness (Salades & Bols)</option>
                            <option value="gym">🏋️ Plats Protéinés (Gym & Musculation)</option>
                            <option value="krousty">Krousty Gourmet</option>
                            <option value="texmex">Tex-Mex & Finger Food</option>
                            <option value="assiettes">Les Assiettes</option>
                            <option value="salades">Nos Salades</option>
                            <option value="pates">Nos Pâtes</option>
                            <option value="gratins">Nos Gratins</option>
                            <option value="burgers">Burgers Prestige</option>
                            <option value="drinks">Boissons Artisanales</option>
                            <option value="desserts">Desserts Maison</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="font-bold text-white block">Prix (€) *</label>
                          <input
                            type="number"
                            step="0.1"
                            required
                            placeholder="7.50"
                            value={formPriceEUR}
                            onChange={e => setFormPriceEUR(e.target.value)}
                            className="w-full bg-black border border-[var(--border-gold)] rounded-xl p-3 text-xs text-white font-mono"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-white block">Description gourmande / Ingrédients</label>
                        <textarea
                          placeholder="Ex: Salade verte, tomates fraîches, fromage de Brie fondant, chèvre chaud."
                          value={formDescFr}
                          onChange={e => setFormDescFr(e.target.value)}
                          className="w-full bg-black border border-[var(--border-gold)] rounded-xl p-3 text-xs text-white h-20"
                        />
                      </div>

                      {/* MACRONUTRIMENTS SECTION (PROT, CARBS, FAT, CALORIES) */}
                      <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/50 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                            <Dumbbell className="w-4 h-4" />
                            <span>Macronutriments & Profil Healthy / Gym</span>
                          </span>
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formIsHealthy}
                              onChange={e => setFormIsHealthy(e.target.checked)}
                              className="accent-emerald-500 w-4 h-4 rounded"
                            />
                            <span className="text-[11px] font-bold text-emerald-300">Activer Mode Healthy</span>
                          </label>
                        </div>

                        <div className="grid grid-cols-4 gap-2">
                          <div className="space-y-1">
                            <label className="text-[10px] text-stone-300 font-bold block">Prot. (g)</label>
                            <input
                              type="number"
                              value={formProtein}
                              onChange={e => setFormProtein(parseInt(e.target.value) || 0)}
                              className="w-full bg-black border border-emerald-500/50 rounded-lg p-2 text-xs text-emerald-400 font-bold text-center font-mono"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] text-stone-300 font-bold block">Carbs (g)</label>
                            <input
                              type="number"
                              value={formCarbs}
                              onChange={e => setFormCarbs(parseInt(e.target.value) || 0)}
                              className="w-full bg-black border border-amber-500/50 rounded-lg p-2 text-xs text-amber-300 font-bold text-center font-mono"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] text-stone-300 font-bold block">Fat (g)</label>
                            <input
                              type="number"
                              value={formFat}
                              onChange={e => setFormFat(parseInt(e.target.value) || 0)}
                              className="w-full bg-black border border-rose-500/50 rounded-lg p-2 text-xs text-rose-300 font-bold text-center font-mono"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] text-stone-300 font-bold block">Calories (kcal)</label>
                            <input
                              type="number"
                              value={formCalories}
                              onChange={e => setFormCalories(parseInt(e.target.value) || 0)}
                              className="w-full bg-black border border-[var(--border-gold)] rounded-lg p-2 text-xs text-[var(--accent-gold)] font-bold text-center font-mono"
                            />
                          </div>
                        </div>
                      </div>

                      {/* File Upload */}
                      <div className="space-y-2 p-3 rounded-xl bg-black border border-dashed border-[var(--accent-gold)]">
                        <label className="font-bold text-[var(--accent-gold)] flex items-center gap-1.5">
                          <Upload className="w-4 h-4" />
                          <span>Photo du Produit (Importer depuis votre appareil)</span>
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                if (event.target?.result) {
                                  setFormImage(event.target.result as string);
                                }
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="w-full text-[10px] text-stone-400 file:mr-2 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-[10px] file:font-bold file:bg-[var(--accent-gold)] file:text-[#0d1f14]"
                        />
                      </div>

                      <div className="flex justify-end gap-3 pt-3 border-t border-[var(--border-gold)]">
                        <button
                          type="button"
                          onClick={() => {
                            setShowAddProductModal(false);
                            setEditingProduct(null);
                          }}
                          className="btn-gold-outline px-5 py-2.5 text-xs"
                        >
                          Annuler
                        </button>
                        <button
                          type="submit"
                          className="btn-gold px-6 py-2.5 text-xs font-bold shadow-lg flex items-center gap-1.5"
                        >
                          <Check className="w-4 h-4" />
                          <span>{editingProduct ? "Enregistrer les Modifications" : "Enregistrer & Publier"}</span>
                        </button>
                      </div>

                    </form>

                    {/* RIGHT COLUMN: LIVE FRONTEND HEALTHY PRODUCT CARD PREVIEW */}
                    <div className="lg:col-span-5 space-y-3">
                      <h4 className="font-gold font-bold text-sm text-[var(--accent-gold)] flex items-center gap-1.5">
                        <Eye className="w-4 h-4" />
                        <span>Aperçu Exact Carte Frontend (€ & Macros)</span>
                      </h4>

                      <div className="card-gold p-4 space-y-3 bg-stone-900 border-2 border-[var(--accent-gold)] shadow-2xl relative rounded-2xl">
                        <div className="relative h-44 w-full rounded-xl overflow-hidden border border-[var(--border-gold)]">
                          <img src={formImage} alt="Preview" className="w-full h-full object-cover" />
                          <div className="absolute top-2 left-2 flex gap-1">
                            <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500 text-[9px] font-bold uppercase font-mono">
                              HIGH PROTEIN
                            </span>
                          </div>
                          <div className="absolute bottom-2 right-2 px-2.5 py-0.5 rounded-full bg-black/80 border border-[var(--accent-gold)] text-[var(--accent-gold)] text-[10px] font-mono font-bold">
                            {formCalories || 335} kcal
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <h5 className="font-gold font-bold text-base text-white">
                            {formNameFr || "Salade Méldoise"}
                          </h5>
                          <p className="text-xs text-stone-300 line-clamp-2 leading-relaxed">
                            {formDescFr || "Salade verte, tomates fraîches, fromage de Brie fondant, chèvre chaud."}
                          </p>
                        </div>

                        {/* MACRO NUTRIENTS GRID EXACT FRONTEND FORMAT */}
                        <div className="grid grid-cols-3 gap-1.5 p-2 rounded-xl bg-black border border-[var(--border-gold)]/40 text-center text-xs">
                          <div className="p-1">
                            <div className="text-[10px] text-stone-400">Prot.</div>
                            <div className="font-bold text-emerald-400 font-mono text-sm">{formProtein || 30}g</div>
                          </div>
                          <div className="p-1 border-x border-[var(--border-gold)]/20">
                            <div className="text-[10px] text-stone-400">Carbs</div>
                            <div className="font-bold text-amber-300 font-mono text-sm">{formCarbs || 20}g</div>
                          </div>
                          <div className="p-1">
                            <div className="text-[10px] text-stone-400">Fat</div>
                            <div className="font-bold text-rose-300 font-mono text-sm">{formFat || 15}g</div>
                          </div>
                        </div>

                        <div className="pt-1 flex items-center justify-between">
                          <span className="font-gold font-bold text-xl text-[var(--accent-gold)] font-mono">
                            {parseFloat(formPriceEUR || '7.50').toFixed(2)} €
                          </span>
                          <button type="button" className="btn-gold px-3.5 py-1.5 text-xs font-bold">
                            Ajouter au Panier
                          </button>
                        </div>
                      </div>
                    </div>

                  </div>

                </div>
              </div>
            )}

          </div>
        )}

        {/* SECTION 7: GESTION DU JEU TENTE TA CHANCE & CODES PROMOS */}
        {activeSection === 'chance' && (
          <div className="space-y-8">
            
            {/* Header & Main Toggle */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl bg-stone-950 border-2 border-[var(--border-gold)]">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--accent-gold)] bg-black text-[var(--accent-gold)] text-[10px] font-bold uppercase tracking-wider mb-2">
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  <span>Jeu Interactif & Marketing</span>
                </div>
                <h3 className="font-gold font-bold text-2xl text-white">
                  🎰 Gestion du Jeu « Tente ta chance ! »
                </h3>
                <p className="text-xs text-stone-400 max-w-xl">
                  Pilotez la roue de la fortune, configurez les probabilités des réductions et cadeaux, suivez les codes promotionnels générés et téléchargez le QR Code scannable pour vos tables et emballages.
                </p>
              </div>

              {/* Game Active / Paused Toggle */}
              <button
                type="button"
                onClick={handleToggleChanceGame}
                className={`px-5 py-3 rounded-2xl font-bold text-xs uppercase tracking-wider flex items-center gap-2.5 transition-all shadow-xl hover:scale-105 shrink-0 ${
                  chanceGameActive 
                    ? 'bg-emerald-500 text-black border border-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.3)]' 
                    : 'bg-rose-500 text-white border border-rose-300 shadow-[0_0_20px_rgba(244,63,94,0.3)]'
                }`}
              >
                <Power className="w-4 h-4" />
                <span>{chanceGameActive ? 'JEU EN LIGNE (ACTIF)' : 'JEU SUSPENDU (PAUSE)'}</span>
              </button>
            </div>

            {/* Quick KPI Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-stone-950 border border-[var(--border-gold)]/40">
                <span className="text-[11px] text-stone-400 block font-bold">Total Codes Tirés</span>
                <span className="text-2xl font-mono font-black text-white mt-1 block">
                  {chanceCodes.length}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-stone-950 border border-emerald-500/40">
                <span className="text-[11px] text-emerald-400 block font-bold">Codes Actifs / Valides</span>
                <span className="text-2xl font-mono font-black text-emerald-300 mt-1 block">
                  {chanceCodes.filter(c => !c.isUsed && new Date(c.expiresAt).getTime() > Date.now()).length}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-stone-950 border border-amber-500/40">
                <span className="text-[11px] text-amber-400 block font-bold">Codes Utilisés</span>
                <span className="text-2xl font-mono font-black text-amber-300 mt-1 block">
                  {chanceCodes.filter(c => c.isUsed).length}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-stone-950 border border-[var(--border-gold)]/40">
                <span className="text-[11px] text-stone-400 block font-bold">Statut Actuel</span>
                <span className={`text-sm font-bold uppercase mt-2 block ${chanceGameActive ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {chanceGameActive ? '● Ouvert au public' : '○ En pause'}
                </span>
              </div>
            </div>

            {/* Grid 2 Columns: Probabilities Form + QR Code Poster Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column: Probability Settings (2 cols span) */}
              <div className="lg:col-span-2 card-gold p-6 space-y-5 bg-stone-950 border-[var(--border-gold)]">
                <div className="flex items-center justify-between border-b border-[var(--border-gold)]/40 pb-3">
                  <div>
                    <h4 className="font-gold font-bold text-lg text-white">
                      ⚙️ Configuration des Probabilités de Tirage
                    </h4>
                    <p className="text-xs text-stone-400">
                      Définissez le pourcentage de chance pour chaque récompense de la roue.
                    </p>
                  </div>
                  {chanceSettingsSaved && (
                    <div className="px-3 py-1 rounded-full bg-emerald-950 border border-emerald-500 text-emerald-300 text-xs flex items-center gap-1.5 animate-fadeIn">
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Enregistré !</span>
                    </div>
                  )}
                </div>

                <form onSubmit={handleSaveProbabilities} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {CHANCE_REWARDS.map(r => {
                      const currentVal = chanceProbabilities[r.id] ?? 10;
                      return (
                        <div key={r.id} className="p-3.5 rounded-xl bg-black border border-stone-800 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-white flex items-center gap-1.5">
                              <span>{r.icon}</span>
                              <span>{r.label}</span>
                            </span>
                            <span className="font-mono font-bold text-[var(--accent-gold)]">
                              {currentVal}%
                            </span>
                          </div>

                          <div className="flex items-center gap-3">
                            <input
                              type="range"
                              min="0"
                              max="100"
                              step="1"
                              value={currentVal}
                              onChange={e => {
                                const val = parseInt(e.target.value) || 0;
                                setChanceProbabilities(prev => ({ ...prev, [r.id]: val }));
                              }}
                              className="w-full accent-[var(--accent-gold)] cursor-pointer"
                            />
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={currentVal}
                              onChange={e => {
                                const val = parseInt(e.target.value) || 0;
                                setChanceProbabilities(prev => ({ ...prev, [r.id]: val }));
                              }}
                              className="w-16 bg-stone-900 border border-stone-700 rounded-lg p-1.5 text-center text-white font-mono font-bold"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Total check */}
                  {(() => {
                    const totalProb = Object.values(chanceProbabilities).reduce((a, b) => a + b, 0);
                    return (
                      <div className="flex items-center justify-between p-3 rounded-xl bg-stone-900 border border-stone-800">
                        <span className="text-stone-300 font-bold">Total des probabilités :</span>
                        <span className={`font-mono font-bold ${totalProb === 100 ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {totalProb}% {totalProb !== 100 && '(Normalisé proportionnellement par le moteur)'}
                        </span>
                      </div>
                    );
                  })()}

                  <button
                    type="submit"
                    disabled={isSavingChanceSettings}
                    className="w-full btn-gold py-3 text-xs font-bold flex items-center justify-center gap-2 rounded-xl"
                  >
                    <Check className="w-4 h-4" />
                    <span>{isSavingChanceSettings ? 'Enregistrement...' : 'Enregistrer les Nouvelles Probabilités'}</span>
                  </button>
                </form>
              </div>

              {/* Right Column: QR Code & Printable Flyer */}
              <div className="card-gold p-6 space-y-4 bg-stone-950 border-[var(--border-gold)] flex flex-col justify-between">
                <div className="space-y-1">
                  <h4 className="font-gold font-bold text-lg text-white flex items-center gap-2">
                    <QrCode className="w-5 h-5 text-[var(--accent-gold)]" />
                    <span>QR Code Officiel HD</span>
                  </h4>
                  <p className="text-xs text-stone-400">
                    Prêt pour impression : tables, vitrines et emballages burgers.
                  </p>
                </div>

                <div className="bg-white p-3 rounded-2xl border-2 border-[var(--accent-gold)] mx-auto shadow-xl flex flex-col items-center justify-center">
                  {adminQrDataUrl ? (
                    <img
                      src={adminQrDataUrl}
                      alt="QR Code Tente ta chance"
                      className="w-44 h-44 object-contain"
                    />
                  ) : (
                    <div className="w-44 h-44 flex items-center justify-center text-stone-400 text-xs">
                      Chargement QR...
                    </div>
                  )}
                  <span className="text-[10px] font-bold text-stone-800 mt-1 uppercase tracking-wider">
                    📱 SCANNE & TENTE TA CHANCE !
                  </span>
                </div>

                <div className="space-y-2 pt-2">
                  {adminQrDataUrl && (
                    <a
                      href={adminQrDataUrl}
                      download="QR-Code-Officiel-Tente-Ta-Chance-Le-Crispy.png"
                      className="w-full btn-gold py-2.5 text-xs font-bold flex items-center justify-center gap-2 rounded-xl shadow-md"
                    >
                      <Download className="w-4 h-4" />
                      <span>Télécharger en Haute Définition</span>
                    </a>
                  )}

                  <Link
                    href="/chance"
                    target="_blank"
                    className="w-full btn-gold-outline py-2.5 text-xs font-bold flex items-center justify-center gap-2 rounded-xl"
                  >
                    <Eye className="w-4 h-4 text-[var(--accent-gold)]" />
                    <span>Tester le Jeu Client</span>
                  </Link>
                </div>
              </div>

            </div>

            {/* Promo Codes Database Table */}
            <div className="card-gold p-6 space-y-4 bg-stone-950 border-[var(--border-gold)]">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[var(--border-gold)]/40 pb-4">
                <div>
                  <h4 className="font-gold font-bold text-lg text-white">
                    🎟️ Registre des Codes Promotionnels Générés
                  </h4>
                  <p className="text-xs text-stone-400">
                    Consultez, validez ou supprimez les codes uniques remportés par les clients.
                  </p>
                </div>

                {/* Filters and search */}
                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:flex-initial">
                    <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={chanceCodeSearch}
                      onChange={e => setChanceCodeSearch(e.target.value)}
                      placeholder="Rechercher code, contact..."
                      className="bg-black border border-stone-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-stone-600 focus:outline-none focus:border-[var(--accent-gold)]"
                    />
                  </div>

                  <select
                    value={chanceCodeFilter}
                    onChange={e => setChanceCodeFilter(e.target.value as any)}
                    className="bg-black border border-stone-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[var(--accent-gold)]"
                  >
                    <option value="all">Tous les statuts</option>
                    <option value="active">Actifs uniquement</option>
                    <option value="used">Utilisés</option>
                    <option value="expired">Expirés</option>
                  </select>
                </div>
              </div>

              {/* Codes Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-900 border-b border-[var(--border-gold)] text-[var(--accent-gold)] font-gold uppercase tracking-wider">
                    <tr>
                      <th className="p-3">Code Unique</th>
                      <th className="p-3">Récompense Gagnée</th>
                      <th className="p-3">Contact Client</th>
                      <th className="p-3">Date Tirage</th>
                      <th className="p-3">Expiration</th>
                      <th className="p-3">Statut</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-gold)]/20">
                    {chanceCodes
                      .filter(c => {
                        if (chanceCodeSearch) {
                          const query = chanceCodeSearch.toLowerCase();
                          const matchCode = c.code.toLowerCase().includes(query);
                          const matchReward = c.rewardLabel.toLowerCase().includes(query);
                          const matchContact = c.customerContact?.toLowerCase().includes(query);
                          if (!matchCode && !matchReward && !matchContact) return false;
                        }
                        const isExpired = new Date(c.expiresAt).getTime() <= Date.now();
                        if (chanceCodeFilter === 'active') return !c.isUsed && !isExpired;
                        if (chanceCodeFilter === 'used') return c.isUsed;
                        if (chanceCodeFilter === 'expired') return isExpired && !c.isUsed;
                        return true;
                      })
                      .map(code => {
                        const isExpired = new Date(code.expiresAt).getTime() <= Date.now();
                        return (
                          <tr key={code.id} className="hover:bg-stone-900/60 transition-colors">
                            <td className="p-3 font-mono font-bold text-white text-sm">
                              {code.code}
                            </td>
                            <td className="p-3 text-[var(--accent-gold)] font-bold">
                              {code.rewardLabel}
                            </td>
                            <td className="p-3 text-stone-300 font-mono">
                              {code.customerContact ? (
                                <span className="text-white">{code.customerContact}</span>
                              ) : (
                                <span className="text-stone-600 italic">Non renseigné</span>
                              )}
                            </td>
                            <td className="p-3 text-stone-400">
                              {new Date(code.createdAt).toLocaleDateString('fr-FR', {
                                day: '2-digit',
                                month: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </td>
                            <td className="p-3 text-stone-400">
                              {new Date(code.expiresAt).toLocaleDateString('fr-FR', {
                                day: '2-digit',
                                month: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </td>
                            <td className="p-3">
                              {code.isUsed ? (
                                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-950 text-blue-300 border border-blue-500/50">
                                  ✓ Utilisé
                                </span>
                              ) : isExpired ? (
                                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-500/50">
                                  ✕ Expiré
                                </span>
                              ) : (
                                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/50">
                                  ● Actif
                                </span>
                              )}
                            </td>
                            <td className="p-3 text-right space-x-2">
                              <button
                                onClick={() => handleToggleCodeUsed(code.id, code.isUsed)}
                                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                                  code.isUsed
                                    ? 'bg-stone-800 text-stone-300 hover:text-white'
                                    : 'bg-emerald-600 text-black hover:bg-emerald-500'
                                }`}
                              >
                                {code.isUsed ? 'Réactiver' : 'Marquer Utilisé'}
                              </button>
                              <button
                                onClick={() => handleDeleteCode(code.id)}
                                className="p-1 text-stone-500 hover:text-rose-400 transition-colors"
                                title="Supprimer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* SECTION 8: JOURNAL DES ACTIONS */}
        {activeSection === 'logs' && (
          <div className="space-y-6">
            <h3 className="font-gold font-bold text-xl text-white">Journal d'Audit & Traçabilité des Actions</h3>
            <div className="card-gold overflow-hidden bg-stone-950">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-900 border-b border-[var(--border-gold)] text-[var(--accent-gold)] font-gold uppercase tracking-wider">
                    <tr>
                      <th className="p-3.5">Horodatage</th>
                      <th className="p-3.5">Administrateur / Employé</th>
                      <th className="p-3.5">Action Effectuée</th>
                      <th className="p-3.5">Cible / Détails</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-gold)]/30">
                    {auditLogs.map(log => (
                      <tr key={log.id} className="hover:bg-stone-900/60 transition-colors">
                        <td className="p-3.5 font-mono text-stone-400">{log.timestamp}</td>
                        <td className="p-3.5 font-bold text-white">{log.adminName}</td>
                        <td className="p-3.5 text-[var(--accent-gold)] font-bold">{log.action}</td>
                        <td className="p-3.5 text-stone-300 font-mono">{log.target}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 8: PARAMÈTRES GÉNÉRAUX */}
        {activeSection === 'settings' && (
          <div className="card-gold p-6 space-y-6 max-w-2xl bg-stone-950 border-[var(--border-gold)]">
            <h3 className="font-gold font-bold text-xl text-white border-b border-[var(--border-gold)]/40 pb-3">
              Paramètres Généraux du Restaurant Le Crispy
            </h3>

            {settingsSuccess && (
              <div className="p-4 rounded-xl bg-emerald-950 border border-emerald-500 text-emerald-300 text-xs flex items-center gap-2">
                <Check className="w-5 h-5 shrink-0" />
                <span>Paramètres enregistrés avec succès !</span>
              </div>
            )}

            <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
              <div className="flex items-center justify-between p-4 rounded-xl bg-black border border-[var(--border-gold)]/40">
                <div>
                  <span className="font-bold text-white block">Service de Commande en Ligne</span>
                  <span className="text-[10px] text-stone-400">Activer ou passer en maintenance temporaire</span>
                </div>
                <button
                  type="button"
                  onClick={() => setOnlineOrderingEnabled(!onlineOrderingEnabled)}
                  className={`px-4 py-2 rounded-full font-bold text-xs uppercase flex items-center gap-2 ${
                    onlineOrderingEnabled ? 'bg-emerald-500 text-black' : 'bg-rose-500 text-white'
                  }`}
                >
                  <Power className="w-4 h-4" />
                  <span>{onlineOrderingEnabled ? "SERVICE ACTIF" : "MAINTENANCE"}</span>
                </button>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-300">Frais de Livraison (€)</label>
                <input
                  type="text"
                  value={deliveryFeeEUR}
                  onChange={e => setDeliveryFeeEUR(e.target.value)}
                  className="w-full bg-black border border-[var(--border-gold)] rounded-xl p-3 text-white font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-300">Horaires d'Ouverture Affichés</label>
                <input
                  type="text"
                  value={openingHours}
                  onChange={e => setOpeningHours(e.target.value)}
                  className="w-full bg-black border border-[var(--border-gold)] rounded-xl p-3 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-300">Adresse du Restaurant</label>
                <input
                  type="text"
                  value={restaurantAddress}
                  onChange={e => setRestaurantAddress(e.target.value)}
                  className="w-full bg-black border border-[var(--border-gold)] rounded-xl p-3 text-white"
                />
              </div>

              <button type="submit" className="w-full btn-gold py-3 text-xs flex items-center justify-center gap-2">
                <Check className="w-4 h-4" />
                <span>Enregistrer les Paramètres</span>
              </button>
            </form>
          </div>
        )}

        {/* --- EXPORT REPORT MODAL (PDF & CSV) --- */}
        {showExportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="card-gold p-6 max-w-md w-full bg-stone-950 border border-[var(--border-gold)] space-y-6 shadow-2xl rounded-2xl relative">
              <button
                onClick={() => setShowExportModal(false)}
                className="absolute right-4 top-4 text-stone-400 hover:text-white p-1 rounded-lg border border-stone-800"
              >
                ✕
              </button>

              <div className="space-y-1 text-center border-b border-[var(--border-gold)]/30 pb-4">
                <h3 className="font-gold text-xl font-bold text-gold-gradient flex items-center justify-center gap-2">
                  <Download className="w-5 h-5 text-[var(--accent-gold)]" />
                  <span>Exporter le Rapport Financier & Ventes</span>
                </h3>
                <p className="text-xs text-stone-400">
                  Choisissez le format d'exportation souhaité pour télécharger les données réelles du restaurant.
                </p>
              </div>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleExportPDF}
                  className="w-full btn-gold py-3.5 text-xs font-bold flex items-center justify-center gap-2 shadow-lg group hover:scale-[1.02] transition-all"
                >
                  <FileText className="w-5 h-5 text-amber-300" />
                  <span>📄 Exporter en PDF (Format Document / Imprimer)</span>
                </button>

                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="w-full py-3.5 rounded-xl bg-stone-900 border border-[var(--border-gold)] hover:border-[var(--accent-gold)] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg hover:bg-stone-800 transition-all"
                >
                  <Download className="w-5 h-5 text-emerald-400" />
                  <span>📊 Exporter en CSV (Fichier Excel / Tableur)</span>
                </button>
              </div>

              <div className="text-[11px] text-stone-500 text-center pt-2 font-mono">
                Le Crispy Dormans — Data Export System v2.0
              </div>
            </div>
          </div>
        )}

      </main>

    </div>
  );
}
