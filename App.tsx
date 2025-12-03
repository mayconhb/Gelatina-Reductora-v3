import React, { useState, useEffect, useRef } from 'react';
import { LoginView } from './components/LoginView';
import { HomeView } from './components/HomeView';
import { ProfileView } from './components/ProfileView';
import { TabBar } from './components/TabBar';
import { ProductDetailView } from './components/ProductDetailView';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { Product, ViewState, Tab } from './types';
import { Download, Star, Share, MoreVertical, Plus, X, Smartphone, ShoppingCart } from 'lucide-react';
import { getUserProfile, saveUserProfile } from './lib/api';
import { trackAppOpen, trackLogin, trackLogout, trackTabChange, trackProductView, trackCheckoutClick, trackInstallPrompt } from './lib/analytics';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showInstallAlert, setShowInstallAlert] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeProduct, setUpgradeProduct] = useState<Product | null>(null);
  const [productOfferCode, setProductOfferCode] = useState<string>('');
  const [hotmartProductId, setHotmartProductId] = useState<string>('');
  const [isLoadingOfferCode, setIsLoadingOfferCode] = useState(false);
  const [offerCodeError, setOfferCodeError] = useState<string>('');
  const [showInstallInstructions, setShowInstallInstructions] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  
  const deferredPromptRef = useRef<BeforeInstallPromptEvent | null>(null);
  
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [viewState, setViewState] = useState<ViewState>('login');
  const [isHydrated, setIsHydrated] = useState(false);

  const historyPushedRef = useRef(false);
  const isProgrammaticBackRef = useRef(false);
  const stateRef = useRef({ selectedProduct, showUpgradeModal, showInstallInstructions, activeTab, viewState });

  const popHistoryEntry = () => {
    if (historyPushedRef.current) {
      isProgrammaticBackRef.current = true;
      historyPushedRef.current = false;
      window.history.back();
    }
  };

  const closeProductDetail = () => {
    setSelectedProduct(null);
    popHistoryEntry();
  };

  const closeUpgradeModal = () => {
    setShowUpgradeModal(false);
    setUpgradeProduct(null);
    setProductOfferCode('');
    setIsLoadingOfferCode(false);
    setOfferCodeError('');
    popHistoryEntry();
  };

  const openUpgradeModal = async (product: Product) => {
    setUpgradeProduct(product);
    setShowUpgradeModal(true);
    setIsLoadingOfferCode(true);
    setOfferCodeError('');
    setProductOfferCode('');
    setHotmartProductId('');
    
    try {
      const response = await fetch(`/api/products/${product.id}/info`);
      if (response.ok) {
        const data = await response.json();
        const offerCode = data.product?.offerCode || '';
        const htProductId = data.product?.hotmartProductId || '';
        setProductOfferCode(offerCode);
        setHotmartProductId(htProductId);
        if (!offerCode) {
          setOfferCodeError('Checkout no disponible para este producto');
        }
      } else {
        setOfferCodeError('Error al cargar información del producto');
      }
    } catch (error) {
      console.error('Error fetching product info:', error);
      setOfferCodeError('Error de conexión. Intenta nuevamente.');
    } finally {
      setIsLoadingOfferCode(false);
    }
  };

  const isInsideIframe = () => {
    try {
      return window.self !== window.top;
    } catch (e) {
      return true;
    }
  };

  const openHotmartCheckout = () => {
    if (!productOfferCode) {
      setOfferCodeError('Checkout no configurado para este producto');
      return;
    }

    if (!hotmartProductId) {
      setOfferCodeError('Producto no configurado correctamente');
      return;
    }

    const checkoutElements = (window as any).hotmartCheckoutElements || (window as any).checkoutElements;
    
    if (checkoutElements) {
      try {
        setShowUpgradeModal(false);
        setUpgradeProduct(null);
        
        const checkout = checkoutElements.init('overlayCheckout', {
          offer: productOfferCode,
          email: userEmail || undefined,
          name: userName || undefined
        });
        
        checkout.open();
        
      } catch (error) {
        console.error('Error opening Hotmart popup:', error);
        openCheckoutFallback();
      }
    } else {
      openCheckoutFallback();
    }
  };

  const openCheckoutFallback = () => {
    const params = new URLSearchParams();
    params.set('off', productOfferCode);
    if (userEmail) {
      params.set('email', userEmail);
    }
    if (userName) {
      params.set('name', userName);
    }
    
    const checkoutUrl = `https://pay.hotmart.com/${hotmartProductId}?${params.toString()}`;
    
    setShowUpgradeModal(false);
    setUpgradeProduct(null);
    
    window.location.href = checkoutUrl;
  };

  const closeInstallInstructions = () => {
    setShowInstallInstructions(false);
    popHistoryEntry();
  };

  useEffect(() => {
    stateRef.current = { selectedProduct, showUpgradeModal, showInstallInstructions, activeTab, viewState };
  }, [selectedProduct, showUpgradeModal, showInstallInstructions, activeTab, viewState]);

  useEffect(() => {
    const hasOpenOverlay = selectedProduct || showUpgradeModal || showInstallInstructions;
    
    if (hasOpenOverlay && !historyPushedRef.current) {
      historyPushedRef.current = true;
      window.history.pushState({ appState: true }, '');
    }
  }, [selectedProduct, showUpgradeModal, showInstallInstructions]);

  useEffect(() => {
    const handleBackButton = () => {
      if (isProgrammaticBackRef.current) {
        isProgrammaticBackRef.current = false;
        return;
      }
      
      const state = stateRef.current;
      historyPushedRef.current = false;
      
      if (state.selectedProduct) {
        setSelectedProduct(null);
      } else if (state.showUpgradeModal) {
        setShowUpgradeModal(false);
      } else if (state.showInstallInstructions) {
        setShowInstallInstructions(false);
      }
    };

    window.addEventListener('popstate', handleBackButton);

    return () => {
      window.removeEventListener('popstate', handleBackButton);
    };
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isLoggedIn = localStorage.getItem('user_logged_in') === 'true';
      const email = localStorage.getItem('current_user_email') || '';
      
      if (isLoggedIn && email) {
        setUserEmail(email);
        setViewState('main');
        trackAppOpen();
        
        getUserProfile(email).then(profile => {
          if (profile) {
            setUserName(profile.name || '');
            setUserAvatar(profile.avatar || null);
          } else {
            const userData = localStorage.getItem(`user_data_${email}`);
            if (userData) {
              try {
                const parsed = JSON.parse(userData);
                setUserName(parsed.name || '');
                setUserAvatar(parsed.avatar || null);
              } catch (e) {
                console.error('Error parsing user data');
              }
            }
          }
        });
      }
      setIsHydrated(true);
    }
  }, []);

  const isIOS = () => {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  };

  const isAndroid = () => {
    return /Android/.test(navigator.userAgent);
  };

  const isStandalone = () => {
    return window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
  };

  useEffect(() => {
    const installedStatus = localStorage.getItem('app_installed');
    if (installedStatus === 'true' || isStandalone()) {
      setIsInstalled(true);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      deferredPromptRef.current = e as BeforeInstallPromptEvent;
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      localStorage.setItem('app_installed', 'true');
      deferredPromptRef.current = null;
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }

    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes slideIn {
        from { transform: translateX(100%); }
        to { transform: translateX(0); }
      }
      @keyframes bounceIn {
        0% { opacity: 0; transform: translateY(-20px) scale(0.9); }
        50% { transform: translateY(5px) scale(1.05); }
        100% { opacity: 1; transform: translateY(0) scale(1); }
      }
      .animate-fade-in-up {
        animation: fadeInUp 0.5s ease-out forwards;
      }
      .animate-fade-in {
        animation: fadeInUp 0.4s ease-out forwards;
      }
      .animate-slide-in {
        animation: slideIn 0.3s ease-out forwards;
      }
      .animate-bounce-in {
        animation: bounceIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
      }
      .pb-safe {
        padding-bottom: env(safe-area-inset-bottom, 20px);
      }
    `;
    document.head.appendChild(style);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      document.head.removeChild(style);
    };
  }, []);

  const handleLogin = async (name: string, email: string) => {
    const normalizedEmail = email.toLowerCase().trim();
    
    setUserEmail(normalizedEmail);
    setViewState('main');
    localStorage.setItem('current_user_email', normalizedEmail);
    localStorage.setItem('user_logged_in', 'true');
    
    trackLogin(normalizedEmail);
    
    const existingProfile = await getUserProfile(normalizedEmail);
    
    if (existingProfile) {
      setUserName(existingProfile.name || name);
      setUserAvatar(existingProfile.avatar || null);
    } else {
      setUserName(name);
      setUserAvatar(null);
      saveUserProfile({ email: normalizedEmail, name, avatar: null });
    }
  };

  const handleLogout = () => {
    trackLogout();
    setViewState('login');
    setActiveTab('home');
    setSelectedProduct(null);
    setUserName('');
    setUserAvatar(null);
    setUserEmail('');
    localStorage.setItem('user_logged_in', 'false');
    localStorage.removeItem('current_user_email');
  };

  const handleUpdateProfile = (newName: string, newAvatar: string | null) => {
    setUserName(newName);
    setUserAvatar(newAvatar);
    
    const emailToUse = userEmail || localStorage.getItem('current_user_email');
    if (emailToUse) {
      saveUserProfile({ email: emailToUse, name: newName, avatar: newAvatar });
    }
  };

  const handleInstallApp = async () => {
    trackInstallPrompt('shown');
    if (deferredPromptRef.current) {
      try {
        await deferredPromptRef.current.prompt();
        const { outcome } = await deferredPromptRef.current.userChoice;
        trackInstallPrompt(outcome);
        if (outcome === 'accepted') {
          setShowInstallAlert(true);
          setTimeout(() => {
            setShowInstallAlert(false);
            setIsInstalled(true);
            localStorage.setItem('app_installed', 'true');
          }, 2000);
        }
        deferredPromptRef.current = null;
      } catch {
        setShowInstallInstructions(true);
      }
    } else {
      setShowInstallInstructions(true);
    }
  };

  const renderInstallInstructionsModal = () => {
    if (!showInstallInstructions) return null;

    const iosDevice = isIOS();
    const androidDevice = isAndroid();

    return (
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
        <div 
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          onClick={closeInstallInstructions}
        />
        
        <div className="relative bg-white rounded-3xl shadow-2xl p-6 max-w-sm w-full text-center space-y-5 animate-bounce-in border border-white/50 z-10 max-h-[90vh] overflow-y-auto">
          <button 
            onClick={closeInstallInstructions}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
          >
            <X size={24} />
          </button>

          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
            <Smartphone size={32} />
          </div>
          
          <h3 className="text-xl font-bold text-slate-900">
            Instalar Aplicación
          </h3>

          {iosDevice ? (
            <div className="text-left space-y-4">
              <p className="text-slate-600 text-sm text-center mb-4">
                Sigue estos pasos para instalar en tu iPhone/iPad:
              </p>
              
              <div className="flex items-start gap-3 bg-slate-50 p-3 rounded-xl">
                <div className="w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center font-bold text-sm shrink-0">1</div>
                <div>
                  <p className="font-semibold text-slate-800 text-sm">Toca el botón Compartir</p>
                  <p className="text-slate-500 text-xs">Busca el ícono <Share size={14} className="inline text-blue-500" /> en la barra del navegador</p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-slate-50 p-3 rounded-xl">
                <div className="w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center font-bold text-sm shrink-0">2</div>
                <div>
                  <p className="font-semibold text-slate-800 text-sm">Selecciona "Agregar a inicio"</p>
                  <p className="text-slate-500 text-xs">Desliza hacia abajo y busca <Plus size={14} className="inline" /> Agregar a pantalla de inicio</p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-slate-50 p-3 rounded-xl">
                <div className="w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center font-bold text-sm shrink-0">3</div>
                <div>
                  <p className="font-semibold text-slate-800 text-sm">Confirma la instalación</p>
                  <p className="text-slate-500 text-xs">Toca "Agregar" en la esquina superior derecha</p>
                </div>
              </div>
            </div>
          ) : androidDevice ? (
            <div className="text-left space-y-4">
              <p className="text-slate-600 text-sm text-center mb-4">
                Sigue estos pasos para instalar en tu Android:
              </p>
              
              <div className="flex items-start gap-3 bg-slate-50 p-3 rounded-xl">
                <div className="w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center font-bold text-sm shrink-0">1</div>
                <div>
                  <p className="font-semibold text-slate-800 text-sm">Abre el menú del navegador</p>
                  <p className="text-slate-500 text-xs">Toca los tres puntos <MoreVertical size={14} className="inline" /> en la esquina superior</p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-slate-50 p-3 rounded-xl">
                <div className="w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center font-bold text-sm shrink-0">2</div>
                <div>
                  <p className="font-semibold text-slate-800 text-sm">Selecciona "Instalar app"</p>
                  <p className="text-slate-500 text-xs">O busca "Agregar a pantalla de inicio"</p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-slate-50 p-3 rounded-xl">
                <div className="w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center font-bold text-sm shrink-0">3</div>
                <div>
                  <p className="font-semibold text-slate-800 text-sm">Confirma la instalación</p>
                  <p className="text-slate-500 text-xs">Toca "Instalar" en el diálogo que aparece</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-left space-y-4">
              <p className="text-slate-600 text-sm text-center mb-4">
                Instala la app desde tu navegador:
              </p>
              
              <div className="flex items-start gap-3 bg-slate-50 p-3 rounded-xl">
                <div className="w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center font-bold text-sm shrink-0">1</div>
                <div>
                  <p className="font-semibold text-slate-800 text-sm">Busca el ícono de instalación</p>
                  <p className="text-slate-500 text-xs">En la barra de direcciones o menú del navegador</p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-slate-50 p-3 rounded-xl">
                <div className="w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center font-bold text-sm shrink-0">2</div>
                <div>
                  <p className="font-semibold text-slate-800 text-sm">Haz clic en "Instalar"</p>
                  <p className="text-slate-500 text-xs">Confirma la instalación cuando aparezca el diálogo</p>
                </div>
              </div>
            </div>
          )}

          <button 
            onClick={closeInstallInstructions}
            className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-2xl shadow-lg active:scale-95 transition-all mt-4"
          >
            Entendido
          </button>
        </div>
      </div>
    );
  };

  // Main Render Logic
  if (viewState === 'login') {
    return (
      <>
        <LoginView 
          onLogin={handleLogin} 
          isInstalled={isInstalled}
          onInstall={handleInstallApp}
          installing={showInstallAlert}
        />
        {renderInstallInstructionsModal()}
      </>
    );
  }

  return (
    <div className="max-w-md mx-auto h-[100dvh] bg-slate-50 relative shadow-2xl overflow-hidden font-sans flex flex-col">
      
      {/* Background Ambience (Organic Gradients) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
         {/* Top Right - Soft Emerald */}
         <div className="absolute -top-[10%] -right-[20%] w-[400px] h-[400px] bg-emerald-200/30 rounded-full blur-3xl opacity-60 animate-pulse" />
         {/* Bottom Left - Soft Blue/Slate */}
         <div className="absolute top-[40%] -left-[20%] w-[350px] h-[350px] bg-blue-100/40 rounded-full blur-3xl opacity-50" />
         {/* Bottom Right - Accent */}
         <div className="absolute -bottom-[10%] -right-[10%] w-[300px] h-[300px] bg-emerald-100/30 rounded-full blur-3xl opacity-50" />
      </div>

      {/* Main Content Area (Scrollable) */}
      <div className="flex-1 overflow-y-auto no-scrollbar relative z-10 pb-20">
        {activeTab === 'home' && (
          <HomeView 
            onProductClick={(product) => { trackProductView(product.id, product.title); setSelectedProduct(product); }} 
            onShowUpgrade={(product) => { trackCheckoutClick(product.id, product.title); openUpgradeModal(product); }}
            userName={userName}
            userEmail={userEmail}
          />
        )}
        {activeTab === 'profile' && (
          <ProfileView 
            onLogout={handleLogout} 
            userName={userName} 
            userAvatar={userAvatar}
            userEmail={userEmail}
            onUpdateProfile={handleUpdateProfile}
            onOpenAnalytics={() => { setShowAnalytics(true); }}
          />
        )}
      </div>

      {/* Floating Install Button (Inside App) */}
      {!isInstalled && !selectedProduct && (
        <button
          onClick={handleInstallApp}
          className="absolute bottom-24 right-6 bg-emerald-600 text-white px-4 py-3 rounded-full shadow-xl z-30 flex items-center gap-2 animate-pulse font-bold text-sm hover:scale-105 active:scale-95 transition-all"
        >
          <Download size={18} />
          Instalar App
        </button>
      )}

      {/* Tab Navigation */}
      <TabBar activeTab={activeTab} onTabChange={(tab) => { trackTabChange(tab); setActiveTab(tab); }} />

      {/* Detail Overlay */}
      {selectedProduct && (
        <ProductDetailView 
          product={selectedProduct} 
          onBack={closeProductDetail}
          userEmail={userEmail}
        />
      )}

      {/* Upgrade Modal - Global & Absolute to Container */}
      {showUpgradeModal && upgradeProduct && (
        <div className="absolute inset-0 z-[50] flex items-center justify-center p-6 w-full h-full">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
            onClick={closeUpgradeModal}
          />
          
          {/* Modal Card */}
          <div className="relative bg-white rounded-3xl shadow-2xl p-6 max-w-[90%] w-full text-center space-y-4 animate-bounce-in border border-white/50 z-10">
            {/* Product Image */}
            <div className="w-24 h-24 mx-auto rounded-2xl overflow-hidden shadow-lg ring-4 ring-emerald-50">
              <img 
                src={upgradeProduct.image} 
                alt={upgradeProduct.title}
                className="w-full h-full object-cover"
              />
            </div>
            
            <div>
              <h3 className="text-xl font-bold text-slate-900">
                {upgradeProduct.title}
              </h3>
              <p className="text-sm text-slate-500 mt-1">{upgradeProduct.category}</p>
            </div>
            
            <p className="text-slate-500 text-sm leading-relaxed">
              Desbloquea este contenido exclusivo y acelera tus resultados hoy mismo.
            </p>

            <div className="space-y-3 pt-2">
              {isLoadingOfferCode ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                </div>
              ) : offerCodeError ? (
                <p className="text-amber-600 text-sm bg-amber-50 p-3 rounded-xl">
                  {offerCodeError}
                </p>
              ) : productOfferCode ? (
                <button 
                  onClick={openHotmartCheckout}
                  className="w-full bg-emerald-600 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-emerald-600/30 active:scale-95 transition-all flex items-center justify-center gap-2 hover:bg-emerald-700"
                >
                  <ShoppingCart size={20} />
                  Comprar Ahora
                </button>
              ) : null}
              
              <button 
                onClick={closeUpgradeModal}
                className="w-full bg-slate-100 text-slate-700 font-medium py-3 rounded-2xl active:scale-95 transition-all hover:bg-slate-200"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Install Alert Feedback */}
      {showInstallAlert && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white text-black px-6 py-3 rounded-full shadow-2xl z-[60] flex items-center gap-3 animate-bounce-in min-w-[280px]">
          <div className="bg-emerald-100 p-1.5 rounded-full">
            <Download size={16} className="text-emerald-600" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm">Instalando aplicación...</p>
          </div>
        </div>
      )}

      {/* Install Instructions Modal */}
      {renderInstallInstructionsModal()}

      {/* Analytics Dashboard */}
      {showAnalytics && (
        <div className="absolute inset-0 z-[80]">
          <AnalyticsDashboard 
            onBack={() => { setShowAnalytics(false); }}
            userEmail={userEmail}
          />
        </div>
      )}
    </div>
  );
};

export default App;