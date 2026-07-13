import { useState, useEffect, useRef } from 'react';
import { Menu, X, Heart, Search, ChevronDown, Star } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [discoverOpen, setDiscoverOpen] = useState(false);
  const [destinationsOpen, setDestinationsOpen] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [langOpen, setLangOpen] = useState(false);
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState({ code: 'EN', name: 'English', flag: '🇬🇧' });
  const [selectedCurrency, setSelectedCurrency] = useState({ code: 'USD', name: 'Dollar ($)', flag: '💵' });

  const languages = [
    { code: 'EN', name: 'English', flag: '🇬🇧' },
    { code: 'DE', name: 'Germany', flag: '🇩🇪' },
    { code: 'FR', name: 'France', flag: '🇫🇷' },
    { code: 'IT', name: 'Italian', flag: '🇮🇹' },
    { code: 'ES', name: 'Spanish', flag: '🇪🇸' }
  ];

  const currencies = [
    { code: 'USD', name: 'Dollar ($)', flag: '💵' },
    { code: 'EUR', name: 'Euro (€)', flag: '💶' }
  ];

  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const isAdmin = location.pathname.startsWith('/admin');

  // Update wishlist count
  const updateWishlistCount = () => {
    const saved = localStorage.getItem('wishlist');
    if (saved) {
      try {
        const ids = JSON.parse(saved);
        setWishlistCount(ids.length);
      } catch (e) {
        setWishlistCount(0);
      }
    } else {
      setWishlistCount(0);
    }
  };

  useEffect(() => {
    updateWishlistCount();
    window.addEventListener('wishlist-update', updateWishlistCount);
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('wishlist-update', updateWishlistCount);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDiscoverOpen(false);
        setDestinationsOpen(false);
        setLangOpen(false);
        setCurrencyOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDiscover = () => {
    setDestinationsOpen(false);
    setDiscoverOpen(!discoverOpen);
  };

  const toggleDestinations = () => {
    setDiscoverOpen(false);
    setDestinationsOpen(!destinationsOpen);
  };

  const handleRequestClick = () => {
    setMobileOpen(false);
    setDiscoverOpen(false);
    setDestinationsOpen(false);
    navigate('/request-proposal');
  };

  const handleDestClick = (id: string) => {
    setDestinationsOpen(false);
    navigate(`/destination/${id}`);
  };

  const handleDiscoverClick = (id: string) => {
    setDiscoverOpen(false);
    navigate(`/discover/${id}`);
  };

  const eastAfrica = [
    { id: 'kenya', name: 'KENYA', img: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=100&q=80' },
    { id: 'uganda', name: 'UGANDA', img: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=100&q=80' },
    { id: 'diani-beach', name: 'DIANI BEACH', img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=100&q=80' },
    { id: 'masai-mara', name: 'MASAI MARA', img: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=100&q=80' },
  ];

  const southernAfrica = [
    { id: 'south-africa', name: 'SOUTH AFRICA', img: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=100&q=80' },
    { id: 'cape-town', name: 'CAPE TOWN', img: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=100&q=80' },
    { id: 'eastern-cape', name: 'EASTERN CAPE', img: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=100&q=80' },
    { id: 'garden-route', name: 'GARDEN ROUTE', img: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=100&q=80' },
    { id: 'hermanus', name: 'HERMANUS', img: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=100&q=80' },
    { id: 'kruger', name: 'KRUGER', img: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=100&q=80' },
    { id: 'winelands', name: 'WINELANDS', img: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=100&q=80' },
  ];

  return (
    <header className="w-full z-50 fixed top-0 left-0 right-0 flex flex-col font-sans" ref={dropdownRef}>
      {/* Top utility bar */}
      <div className="bg-darkSurface text-white text-xs md:text-[13px] py-3.5 px-4 md:px-8 flex justify-between items-center border-b border-white/10 relative">
        <div className="flex items-center gap-6">
          {/* Language Selector */}
          <div className="relative">
            <div
              onClick={() => { setLangOpen(!langOpen); setCurrencyOpen(false); }}
              className="flex items-center gap-1.5 cursor-pointer hover:text-secondary transition-colors font-bold uppercase tracking-wider"
            >
              <span>{selectedLang.flag}</span>
              <span>{selectedLang.code}</span>
              <ChevronDown className="h-3.5 w-3.5" />
            </div>

            {langOpen && (
              <div className="absolute top-8 left-0 bg-white text-onSurface rounded-xl border border-gray-200 shadow-2xl py-2 z-50 min-w-[130px] overflow-hidden">
                {languages.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => { setSelectedLang(l); setLangOpen(false); }}
                    className="w-full text-left px-4 py-2 hover:bg-surface text-xs font-bold flex items-center gap-2"
                  >
                    <span>{l.flag}</span>
                    <span>{l.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Currency Selector */}
          <div className="relative">
            <div
              onClick={() => { setCurrencyOpen(!currencyOpen); setLangOpen(false); }}
              className="flex items-center gap-1.5 cursor-pointer hover:text-secondary transition-colors font-bold uppercase tracking-wider"
            >
              <span>{selectedCurrency.flag}</span>
              <span>{selectedCurrency.code}</span>
              <ChevronDown className="h-3.5 w-3.5" />
            </div>

            {currencyOpen && (
              <div className="absolute top-8 left-0 bg-white text-onSurface rounded-xl border border-gray-200 shadow-2xl py-2 z-50 min-w-[150px] overflow-hidden">
                {currencies.map((c) => (
                  <button
                    key={c.code}
                    onClick={() => { setSelectedCurrency(c); setCurrencyOpen(false); }}
                    className="w-full text-left px-4 py-2 hover:bg-surface text-xs font-bold flex items-center gap-2"
                  >
                    <span>{c.flag}</span>
                    <span>{c.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="hidden lg:flex items-center gap-3 border-l border-white/20 pl-6">
            <div className="flex items-center gap-1.5">
              <span className="bg-green-600 text-white font-black px-1.5 py-0.5 rounded-sm text-[9px] uppercase tracking-wider">Tripadvisor</span>
              <div className="flex text-green-500">
                <Star className="h-3.5 w-3.5 fill-current" />
                <Star className="h-3.5 w-3.5 fill-current" />
                <Star className="h-3.5 w-3.5 fill-current" />
                <Star className="h-3.5 w-3.5 fill-current" />
                <Star className="h-3.5 w-3.5 fill-current" />
              </div>
              <span className="text-gray-300 font-semibold ml-1">4.9/5 Based on 3,500+ reviews</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6 font-bold text-gray-200">
          <Link to="/quiz" className="hover:text-secondary transition-colors">Travel quiz</Link>
          <a href="#stories" className="hover:text-secondary transition-colors">Blog</a>
          <span className="text-gray-500">|</span>
          <span className="hover:text-secondary cursor-pointer transition-colors">Practical Information</span>
          <span className="hover:text-secondary cursor-pointer transition-colors">About Us</span>
          {isAdmin && (
            <Link to="/admin" className="bg-primary hover:bg-[#b83f1d] px-3 py-1 rounded-md text-xs font-bold text-white shadow">
              Admin
            </Link>
          )}
        </div>
      </div>

      {/* Main navigation bar */}
      <nav className={`transition-all duration-500 ${scrolled ? 'bg-white/80 backdrop-blur-lg shadow-lg py-3' : 'bg-white/95 backdrop-blur-md py-4'} border-b border-gray-100`}>
        <div className="mx-auto max-w-7xl px-4 md:px-8 flex items-center justify-between">

          <Link to="/" className="flex items-center gap-2 shrink-0">
            <span className="font-extrabold text-xl tracking-tight text-onSurface flex items-center gap-1">
              <span className="text-primary">AFRICA</span>
              <span className="bg-secondary text-white px-2 py-0.5 rounded text-sm font-black rotate-[-2deg] shadow-sm">SAFARI</span>
              <span className="text-xs text-muted block -mt-1">TRIPS.COM</span>
            </span>
          </Link>

          {/* Desktop Nav Items */}
          <div className="hidden md:flex items-center gap-8">
            <button
              onClick={toggleDestinations}
              className={`flex items-center gap-1 text-sm font-black tracking-widest text-onSurface hover:text-primary transition-colors relative ${destinationsOpen ? 'text-primary' : ''}`}
            >
              DESTINATIONS <ChevronDown className="h-4 w-4" />
            </button>

            <button
              onClick={toggleDiscover}
              className={`flex items-center gap-1 text-sm font-black tracking-widest text-onSurface hover:text-primary transition-colors relative ${discoverOpen ? 'text-primary' : ''}`}
            >
              DISCOVER AFRICA <ChevronDown className="h-4 w-4" />
            </button>

            <Link
              to="/contact"
              className="text-sm font-black tracking-widest text-onSurface hover:text-primary transition-colors"
            >
              CONTACT US
            </Link>
          </div>

          {/* Right side controls */}
          <div className="flex items-center gap-4">
            <Link to="/wishlist" className="text-onSurface hover:text-primary transition-colors p-1.5 rounded-full hover:bg-gray-100 relative">
              <Heart className="h-5 w-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-0.5 right-0.5 bg-primary text-white text-[9px] font-black h-4 w-4 rounded-full flex items-center justify-center border border-white">
                  {wishlistCount}
                </span>
              )}
            </Link>
            <Link to="/search" className="text-onSurface hover:text-primary transition-colors p-1.5 rounded-full hover:bg-gray-100">
              <Search className="h-5 w-5" />
            </Link>
            <button
              onClick={handleRequestClick}
              className="hidden sm:inline-flex bg-gradient-to-r from-primary to-secondary hover:shadow-lg text-white font-bold text-xs uppercase tracking-widest px-6 py-3 rounded-full transition-all shadow-md items-center gap-2"
            >
              Make a request
            </button>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 text-onSurface hover:bg-gray-100 rounded-lg"
            >
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* DESTINATIONS Dropdown Mega Menu */}
      <AnimatePresence>
        {destinationsOpen && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            transition={{ duration: 0.25 }}
            className="absolute top-[85px] left-0 right-0 w-full bg-white/90 backdrop-blur-xl shadow-2xl z-40 border-t border-white/40 hidden md:block overflow-hidden"
          >
            <div className="max-w-7xl mx-auto flex">
              <div className="flex-1 p-8 pr-12 grid grid-cols-2 gap-10">
                {/* East Africa */}
                <div>
                  <h3 className="text-sm font-black tracking-widest text-[#4a241a] uppercase border-b border-gray-100 pb-2 mb-4 font-accent text-xl">
                    East Africa
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {eastAfrica.map((dest) => (
                      <button
                        key={dest.id}
                        onClick={() => handleDestClick(dest.id)}
                        className="flex items-center gap-3 hover:text-primary group transition-colors text-left"
                      >
                        <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border-2 border-white shadow-md group-hover:scale-105 transition-all">
                          <img src={dest.img} alt={dest.name} className="w-full h-full object-cover" />
                        </div>
                        <span className="text-[11px] font-black tracking-wider text-onSurface group-hover:text-primary">{dest.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Southern Africa */}
                <div>
                  <h3 className="text-sm font-black tracking-widest text-[#4a241a] uppercase border-b border-gray-100 pb-2 mb-4 font-accent text-xl">
                    Southern Africa
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {southernAfrica.map((dest) => (
                      <button
                        key={dest.id}
                        onClick={() => handleDestClick(dest.id)}
                        className="flex items-center gap-3 hover:text-primary group transition-colors text-left"
                      >
                        <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border-2 border-white shadow-md group-hover:scale-105 transition-all">
                          <img src={dest.img} alt={dest.name} className="w-full h-full object-cover" />
                        </div>
                        <span className="text-[11px] font-black tracking-wider text-onSurface group-hover:text-primary">{dest.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right CTA Area */}
              <div className="w-[320px] bg-darkSurface/95 backdrop-blur-md text-white p-8 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-black tracking-widest uppercase mb-3 text-secondary">
                    Start the Adventure!
                  </h3>
                  <div className="h-28 overflow-hidden rounded-lg mb-4 border border-white/10">
                    <img
                      src="https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=300&q=80"
                      alt="Safari Jeep"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-[11px] leading-relaxed text-gray-300 mb-4">
                    Tell us your preferences and get inspired by our unique travel ideas. All sample itineraries are 100% customizable.
                  </p>
                </div>
                <button
                  onClick={handleRequestClick}
                  className="w-full bg-gradient-to-r from-secondary to-primary hover:shadow-lg text-white text-xs font-black uppercase tracking-widest py-3.5 rounded-lg transition-all text-center"
                >
                  Request Travel Proposal
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DISCOVER AFRICA Mega Menu Dropdown */}
      <AnimatePresence>
        {discoverOpen && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            transition={{ duration: 0.25 }}
            className="absolute top-[85px] left-0 right-0 w-full bg-white/90 backdrop-blur-xl shadow-2xl z-40 border-t border-white/40 hidden md:block overflow-hidden"
          >
            <div className="max-w-7xl mx-auto flex">
              <div className="flex-1 p-8 pr-12">
                <div className="flex items-center gap-3 mb-6">
                  <h3 className="text-lg font-black tracking-wider text-onSurface uppercase border-b-2 border-primary pb-1">
                    Discover Africa
                  </h3>
                  <div className="w-7 h-7 rounded-full bg-[#e4a435] text-white flex items-center justify-center cursor-pointer hover:bg-primary transition-colors">
                    <span className="font-bold text-sm">→</span>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-5">
                  <button onClick={() => handleDiscoverClick('national-parks')} className="group flex flex-col gap-2 text-left">
                    <div className="h-28 overflow-hidden rounded-lg border border-gray-100 shadow-sm">
                      <img
                        src="https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=300&q=80"
                        alt="National Parks"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <span className="text-xs font-extrabold uppercase tracking-wide text-onSurface group-hover:text-primary transition-colors">
                      National Parks
                    </span>
                  </button>

                  <button onClick={() => handleDiscoverClick('accommodations')} className="group flex flex-col gap-2 text-left">
                    <div className="h-28 overflow-hidden rounded-lg border border-gray-100 shadow-sm">
                      <img
                        src="https://images.unsplash.com/photo-1549180030-48bf079fb38a?auto=format&fit=crop&w=300&q=80"
                        alt="Accommodations"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <span className="text-xs font-extrabold uppercase tracking-wide text-onSurface group-hover:text-primary transition-colors">
                      Accommodations
                    </span>
                  </button>

                  <button onClick={() => handleDiscoverClick('activities')} className="group flex flex-col gap-2 text-left">
                    <div className="h-28 overflow-hidden rounded-lg border border-gray-100 shadow-sm">
                      <img
                        src="https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=300&q=80"
                        alt="Activities"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <span className="text-xs font-extrabold uppercase tracking-wide text-onSurface group-hover:text-primary transition-colors">
                      Activities
                    </span>
                  </button>

                  <button onClick={() => handleDiscoverClick('reviews')} className="group flex flex-col gap-2 text-left">
                    <div className="h-28 bg-[#1a4d2e] rounded-lg p-4 flex flex-col items-center justify-center text-center text-white relative shadow-inner">
                      <span className="text-white text-3xl font-black mb-1">🦉</span>
                      <span className="text-[10px] font-bold tracking-widest uppercase">Traveller Reviews</span>
                    </div>
                    <span className="text-xs font-extrabold uppercase tracking-wide text-onSurface group-hover:text-primary transition-colors">
                      Traveller Reviews
                    </span>
                  </button>

                  <button onClick={() => handleDiscoverClick('blog')} className="group flex flex-col gap-2 text-left">
                    <div className="h-28 overflow-hidden rounded-lg border border-gray-100 shadow-sm">
                      <img
                        src="https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=300&q=80"
                        alt="Blog"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <span className="text-xs font-extrabold uppercase tracking-wide text-onSurface group-hover:text-primary transition-colors">
                      Blog
                    </span>
                  </button>

                  <button onClick={() => handleDiscoverClick('gorilla-trekking')} className="group flex flex-col gap-2 text-left">
                    <div className="h-28 overflow-hidden rounded-lg border border-gray-100 shadow-sm">
                      <img
                        src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=300&q=80"
                        alt="Gorilla Trekking"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <span className="text-xs font-extrabold uppercase tracking-wide text-onSurface group-hover:text-primary transition-colors">
                      Gorilla Trekking
                    </span>
                  </button>

                  <button onClick={() => handleDiscoverClick('great-migration')} className="group flex flex-col gap-2 text-left">
                    <div className="h-28 overflow-hidden rounded-lg border border-gray-100 shadow-sm">
                      <img
                        src="https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=300&q=80"
                        alt="Great Migration"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <span className="text-xs font-extrabold uppercase tracking-wide text-onSurface group-hover:text-primary transition-colors">
                      Great Migration
                    </span>
                  </button>

                  <Link
                    to="/request-proposal"
                    onClick={() => setDiscoverOpen(false)}
                    className="group bg-[#e4a435] hover:bg-[#d09228] transition-colors rounded-lg p-4 flex flex-col items-center justify-center text-center cursor-pointer text-onSurface shadow-md"
                  >
                    <span className="font-accent text-xl font-bold tracking-wide leading-tight text-onSurface">
                      Request a Proposal at no charge
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-widest mt-2 underline">
                      Request Travel Proposal
                    </span>
                  </Link>
                </div>
              </div>

              {/* Right Iconic Destinations Sidebar */}
              <div className="w-[320px] bg-darkSurface/95 backdrop-blur-md text-white p-8 flex flex-col">
                <h3 className="text-sm font-black tracking-widest uppercase mb-5 text-secondary">
                  Iconic Destinations
                </h3>
                <div className="flex flex-col gap-4">
                  {[
                    { id: 'masai-mara', name: 'Maasai Mara National Reserve', img: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=100&q=80' },
                    { id: 'cape-town', name: 'Amboseli National Park', img: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=100&q=80' },
                    { id: 'uganda', name: 'Bwindi Impenetrable National Park', img: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=100&q=80' },
                    { id: 'eastern-cape', name: 'Murchison Falls National Park', img: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=100&q=80' },
                    { id: 'kruger', name: 'Queen Elizabeth National Park', img: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=100&q=80' },
                  ].map((dest, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleDestClick(dest.id)}
                      className="flex items-center gap-3 hover:text-secondary group transition-colors text-left"
                    >
                      <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border-2 border-white shadow-sm">
                        <img src={dest.img} alt={dest.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                      </div>
                      <span className="text-xs font-bold leading-snug">{dest.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-gray-100 shadow-xl overflow-hidden"
          >
            <div className="px-6 py-6 flex flex-col gap-4">
              <Link
                to="/"
                onClick={() => setMobileOpen(false)}
                className="text-base font-extrabold text-onSurface"
              >
                Home
              </Link>
              <button
                onClick={() => {
                  setMobileOpen(false);
                  navigate('/destination/kenya');
                }}
                className="text-left text-base font-extrabold text-onSurface"
              >
                Destinations
              </button>
              <Link
                to="/quiz"
                onClick={() => setMobileOpen(false)}
                className="text-base font-extrabold text-onSurface"
              >
                Travel Quiz
              </Link>
              <Link
                to="/request-proposal"
                onClick={() => setMobileOpen(false)}
                className="text-base font-extrabold text-primary"
              >
                Request Proposal
              </Link>
              <button
                onClick={handleRequestClick}
                className="w-full bg-primary text-white font-bold text-sm uppercase py-3 rounded-full text-center mt-2"
              >
                Make a request
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
