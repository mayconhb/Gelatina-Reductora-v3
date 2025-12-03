import React, { useState, useRef, MouseEvent, useMemo, useEffect } from 'react';
import { Lock, ChevronRight, Loader2, User } from 'lucide-react';
import { PRODUCTS, BONUSES, LOCKED_CONTENT, MOTIVATIONAL_QUOTES } from '../constants';
import { Product } from '../types';
import { useUserProducts } from '../lib/useUserProducts';
import { OptimizedImage, preloadImages } from './OptimizedImage';

import bannerTransformacao from '@assets/generated_images/weight_loss_transformation_banner.webp';
import bannerEmagrecimento from '@assets/generated_images/mirror_reflection_weight_loss.webp';

interface HomeViewProps {
  onProductClick: (product: Product) => void;
  onShowUpgrade: (product: Product) => void;
  userName: string;
  userEmail: string;
  userAvatar: string | null;
  onOpenProfile: () => void;
}

// Custom Hook para lógica de arrastar (Drag to Scroll)
const useDraggableScroll = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [hasMoved, setHasMoved] = useState(false); // Para evitar clique se arrastou

  const onMouseDown = (e: MouseEvent) => {
    if (!ref.current) return;
    setIsDragging(true);
    setHasMoved(false);
    setStartX(e.pageX - ref.current.offsetLeft);
    setScrollLeft(ref.current.scrollLeft);
  };

  const onMouseLeave = () => {
    setIsDragging(false);
  };

  const onMouseUp = () => {
    setIsDragging(false);
  };

  const onMouseMove = (e: MouseEvent) => {
    if (!isDragging || !ref.current) return;
    e.preventDefault();
    const x = e.pageX - ref.current.offsetLeft;
    const walk = (x - startX) * 1.5; // Multiplicador de velocidade
    ref.current.scrollLeft = scrollLeft - walk;
    if (Math.abs(walk) > 5) setHasMoved(true); // Se moveu mais de 5px, considera arraste
  };

  return { 
    ref, 
    events: { onMouseDown, onMouseLeave, onMouseUp, onMouseMove },
    isDragging,
    hasMoved 
  };
};

export const HomeView: React.FC<HomeViewProps> = ({ onProductClick, onShowUpgrade, userName, userEmail, userAvatar, onOpenProfile }) => {
  const [activeBanner, setActiveBanner] = useState(0);

  const { purchasedProducts, isLoading } = useUserProducts(userEmail);

  const bannerScroll = useDraggableScroll();
  const productsScroll = useDraggableScroll();
  const bonusScroll = useDraggableScroll();
  const lockedScroll = useDraggableScroll();

  const allPurchasableProducts = useMemo(() => {
    return [...PRODUCTS, ...LOCKED_CONTENT];
  }, []);

  const myProducts = useMemo(() => {
    if (purchasedProducts.length === 0) {
      return [];
    }
    return allPurchasableProducts.filter(p => purchasedProducts.includes(p.id));
  }, [allPurchasableProducts, purchasedProducts]);

  const exclusiveContent = useMemo(() => {
    if (purchasedProducts.length === 0) {
      return allPurchasableProducts;
    }
    return allPurchasableProducts.filter(p => !purchasedProducts.includes(p.id));
  }, [allPurchasableProducts, purchasedProducts]);

  const banners = useMemo(() => [
    { id: 1, image: bannerTransformacao, title: "Transforma tu vida\nhoy mismo." },
    { id: 2, image: bannerEmagrecimento, title: "Tu cuerpo merece\nlo mejor." }
  ], []);

  useEffect(() => {
    const bannerUrls = banners.map(b => b.image);
    preloadImages(bannerUrls);

    const productUrls = [...myProducts, ...BONUSES, ...exclusiveContent]
      .slice(0, 12)
      .map(p => p.image);
    preloadImages(productUrls);
  }, [banners, myProducts, exclusiveContent]);

  const handleBannerScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollLeft = e.currentTarget.scrollLeft;
    const width = e.currentTarget.clientWidth;
    const index = Math.round(scrollLeft / (width * 0.8));
    setActiveBanner(Math.min(Math.max(index, 0), banners.length - 1));
  };

  const handleProductClickInternal = (product: Product, hasMoved: boolean) => {
    if (!hasMoved) onProductClick(product);
  };
  
  const handleLockedClickInternal = (product: Product, hasMoved: boolean) => {
    if (!hasMoved) onShowUpgrade(product);
  };

  // Logic to select daily quote
  const dailyQuote = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = (now.getTime() - start.getTime()) + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000);
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    return MOTIVATIONAL_QUOTES[dayOfYear % MOTIVATIONAL_QUOTES.length];
  }, []);

  return (
    <>
      <div className="pb-8 pt-8 space-y-8 animate-fade-in bg-transparent min-h-screen">
        
        {/* Header: Greeting & Profile Button */}
        <div className="px-6 flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Hola, {userName} <span className="text-2xl">👋</span></h1>
            <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-[90%]">
              "{dailyQuote}"
            </p>
          </div>
          
          {/* Profile Button */}
          <button
            onClick={onOpenProfile}
            className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-lg bg-slate-200 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shrink-0"
          >
            {userAvatar ? (
              <img src={userAvatar} alt="Perfil" className="w-full h-full object-cover" />
            ) : (
              <User size={24} className="text-slate-400" />
            )}
          </button>
        </div>

        {/* Banner Carousel */}
        <div className="relative group">
          <div 
            ref={bannerScroll.ref}
            {...bannerScroll.events}
            onScroll={handleBannerScroll}
            className={`w-full overflow-x-auto snap-x snap-mandatory no-scrollbar px-6 flex gap-4 ${bannerScroll.isDragging ? 'cursor-grabbing snap-none' : 'cursor-grab'}`}
          >
            {banners.map((banner, index) => (
              <div key={banner.id} className="snap-center shrink-0 w-full sm:w-[350px] relative rounded-3xl overflow-hidden aspect-[16/9] shadow-md select-none pointer-events-none sm:pointer-events-auto">
                <OptimizedImage 
                  src={banner.image} 
                  alt="Banner" 
                  priority={index < 2}
                  preloadSiblings={banners.filter((_, i) => i !== index).map(b => b.image)}
                  className="w-full h-full object-cover pointer-events-none"
                />
                <div className="absolute inset-0 bg-black/30 flex items-end p-6">
                  <h2 className="text-white text-2xl font-bold leading-tight whitespace-pre-line drop-shadow-md">{banner.title}</h2>
                </div>
              </div>
            ))}
          </div>
          
          {/* Banner Indicators (Lines) - Bottom Right */}
          <div className="absolute bottom-5 right-10 flex gap-2 z-10 pointer-events-none">
              {banners.map((_, i) => (
                  <div 
                      key={i} 
                      className={`h-1 rounded-full transition-all duration-300 shadow-sm ${activeBanner === i ? 'w-8 bg-white opacity-100' : 'w-4 bg-white opacity-50'}`}
                  />
              ))}
          </div>
        </div>

        {/* Section: Meus Produtos */}
        <section>
          <div className="px-6 mb-4 flex items-center justify-between group cursor-pointer hover:opacity-80 transition-opacity">
            <h3 className="text-xl font-bold text-slate-900">Mis Productos</h3>
            {isLoading && <Loader2 size={20} className="text-emerald-500 animate-spin" />}
            {!isLoading && <ChevronRight size={24} className="text-slate-400" />}
          </div>
          
          {myProducts.length > 0 ? (
            <div 
              ref={productsScroll.ref}
              {...productsScroll.events}
              className={`flex overflow-x-auto snap-x snap-mandatory no-scrollbar px-6 gap-4 pb-4 ${productsScroll.isDragging ? 'cursor-grabbing snap-none' : 'cursor-grab'}`}
            >
              {myProducts.map((product, index) => (
                <div 
                  key={product.id}
                  onClick={() => handleProductClickInternal(product, productsScroll.hasMoved)}
                  className="snap-center shrink-0 w-40 flex flex-col gap-2 group cursor-pointer select-none"
                >
                  <div className="aspect-square rounded-2xl overflow-hidden relative shadow-sm bg-white/60 backdrop-blur-sm">
                    <OptimizedImage 
                      src={product.image} 
                      alt={product.title} 
                      priority={index < 4}
                      preloadSiblings={myProducts.slice(index + 1, index + 3).map(p => p.image)}
                      className="w-full h-full object-cover group-active:scale-105 transition-transform duration-300 pointer-events-none" 
                    />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800 text-sm leading-tight">{product.title}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{product.category}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-6 py-8 text-center">
              <p className="text-slate-400 text-sm">
                {isLoading ? 'Cargando productos...' : 'Aún no tienes productos. ¡Explora los contenidos exclusivos!'}
              </p>
            </div>
          )}
        </section>

        {/* Section: Bônus */}
        <section>
          <div className="px-6 mb-4 flex items-center justify-between group cursor-pointer hover:opacity-80 transition-opacity">
            <h3 className="text-xl font-bold text-slate-900">Bonos</h3>
            <ChevronRight size={24} className="text-slate-400" />
          </div>
          
          <div 
            ref={bonusScroll.ref}
            {...bonusScroll.events}
            className={`flex overflow-x-auto snap-x snap-mandatory no-scrollbar px-6 gap-4 pb-4 ${bonusScroll.isDragging ? 'cursor-grabbing snap-none' : 'cursor-grab'}`}
          >
            {BONUSES.map((product, index) => (
              <div 
                key={product.id}
                onClick={() => handleProductClickInternal(product, bonusScroll.hasMoved)}
                className="snap-center shrink-0 w-40 flex flex-col gap-2 group cursor-pointer select-none"
              >
                <div className="aspect-square rounded-2xl overflow-hidden relative shadow-sm bg-white/60 backdrop-blur-sm">
                  <OptimizedImage 
                    src={product.image} 
                    alt={product.title} 
                    priority={index < 4}
                    preloadSiblings={BONUSES.slice(index + 1, index + 3).map(p => p.image)}
                    className="w-full h-full object-cover group-active:scale-105 transition-transform duration-300 pointer-events-none" 
                  />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800 text-sm leading-tight">{product.title}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{product.category}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section: Locked */}
        {exclusiveContent.length > 0 && (
          <section>
            <div className="px-6 mb-4 flex items-center justify-between group cursor-pointer hover:opacity-80 transition-opacity">
              <h3 className="text-xl font-bold text-slate-900">Contenidos Exclusivos</h3>
              <ChevronRight size={24} className="text-slate-400" />
            </div>
            
            <div 
              ref={lockedScroll.ref}
              {...lockedScroll.events}
              className={`flex overflow-x-auto snap-x snap-mandatory no-scrollbar px-6 gap-4 pb-4 ${lockedScroll.isDragging ? 'cursor-grabbing snap-none' : 'cursor-grab'}`}
            >
              {exclusiveContent.map((product, index) => (
                <div 
                  key={product.id}
                  onClick={() => handleLockedClickInternal(product, lockedScroll.hasMoved)}
                  className="snap-center shrink-0 w-40 flex flex-col gap-2 group cursor-pointer relative select-none"
                >
                  <div className="aspect-square rounded-2xl overflow-hidden relative shadow-sm bg-slate-200">
                    <OptimizedImage 
                      src={product.image} 
                      alt={product.title} 
                      priority={index < 4}
                      preloadSiblings={exclusiveContent.slice(index + 1, index + 3).map(p => p.image)}
                      className="w-full h-full object-cover opacity-60 blur-[1px] pointer-events-none" 
                    />
                    <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                      <div className="bg-white/90 p-3 rounded-full shadow-md">
                        <Lock size={20} className="text-slate-900" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-400 text-sm leading-tight">{product.title}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">{product.category}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
};