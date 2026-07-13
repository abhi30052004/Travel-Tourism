import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Phone, Mail, ArrowRight, ShieldCheck, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { fetchDiscoverPage, DiscoverPage } from '../lib/admin-api';

export default function DiscoverDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const discId = id || 'gorilla-trekking';

  const [data, setData] = useState<DiscoverPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError('');
    fetchDiscoverPage(discId)
      .then((res) => {
        if (!mounted) return;
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : 'Failed to load guide details.');
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [discId]);

  const handleInquire = () => {
    navigate('/request-proposal');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f2ea] flex items-center justify-center pt-24 font-sans text-[#3d1f17]">
        <div className="text-center space-y-2">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
          <p className="text-sm font-semibold">Loading Guide details...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#f7f2ea] flex items-center justify-center pt-24 font-sans text-[#3d1f17]">
        <div className="text-center space-y-4">
          <p className="text-lg font-bold text-red-600">Error loading travel guide</p>
          <p className="text-sm text-gray-500">{error || 'Guide not found'}</p>
          <button onClick={() => navigate('/')} className="bg-primary hover:bg-[#b83f1d] text-white text-xs font-black uppercase tracking-widest px-5 py-3 rounded-full">
            Back to Homepage
          </button>
        </div>
      </div>
    );
  }

  let subSections: Array<{ title: string; desc: string; image?: string }> = [];
  try {
    subSections = JSON.parse(data.subSections || '[]');
  } catch {
    subSections = [];
  }

  let rules: string[] = [];
  try {
    rules = JSON.parse(data.rules || '[]');
  } catch {
    rules = [];
  }

  let tips: string[] = [];
  try {
    tips = JSON.parse(data.tips || '[]');
  } catch {
    tips = [];
  }

  return (
    <div className="min-h-screen bg-[#f7f2ea] pt-24 pb-16 font-sans text-[#3d1f17]">
      {/* Banner */}
      <div className="relative h-[45vh] min-h-[280px] w-full overflow-hidden flex items-center justify-center">
        {data.heroImage && <img src={data.heroImage} alt={data.title} className="absolute inset-0 w-full h-full object-cover" />}
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 text-center text-white px-4 space-y-2">
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-widest">{data.title}</h1>
          {data.tagline && <p className="font-accent text-xl text-[#e4a435]">{data.tagline}</p>}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Main Content */}
        <div className="lg:col-span-8 space-y-12">
          <div className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-black uppercase text-[#4a241a] tracking-wide">
              Introduction
            </h2>
            <div className="h-1 w-20 bg-secondary" />
            <p className="text-sm leading-relaxed text-[#6f5a52]">{data.content}</p>
          </div>

          {/* Subsections */}
          {subSections.map((sec, idx) => (
            <div key={idx} className={`grid grid-cols-1 md:grid-cols-12 gap-6 items-center border-t border-gray-200/50 pt-8`}>
              <div className={`md:col-span-7 space-y-3 ${idx % 2 === 1 ? 'md:order-last' : ''}`}>
                <h3 className="text-xl font-extrabold text-[#4a241a]">{sec.title}</h3>
                <p className="text-xs leading-relaxed text-[#6f5a52]">{sec.desc}</p>
              </div>
              {sec.image && (
                <div className="md:col-span-5 h-48 rounded-xl overflow-hidden shadow">
                  <img src={sec.image} alt={sec.title} className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          ))}

          {/* Rules / Behaviour Checklist */}
          {rules.length > 0 && (
            <div className="bg-[#4a241a] text-white p-6 md:p-8 rounded-2xl space-y-4">
              <h3 className="text-sm font-black uppercase tracking-widest text-[#e4a435]">
                Rules & Trekking Guidelines
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {rules.map((rule, idx) => (
                  <div key={idx} className="flex gap-2.5 items-start text-xs text-gray-200 leading-normal">
                    <ShieldCheck className="h-4.5 w-4.5 text-[#e4a435] shrink-0 mt-0.5" />
                    <span>{rule}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Planning Tips */}
          {tips.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-extrabold text-[#4a241a] uppercase tracking-wide">
                Expert Planning Tips
              </h3>
              <ul className="space-y-2">
                {tips.map((tip, idx) => (
                  <li key={idx} className="flex gap-2 items-center text-xs font-bold text-[#6f5a52]">
                    <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          {/* Representative Expert Box */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6 text-center">
            <h3 className="text-xs font-black uppercase tracking-widest text-primary">Call an Expert</h3>
            <div className="flex flex-col items-center gap-3">
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-primary">
                <img
                  src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80"
                  alt="Representative profile"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h4 className="font-extrabold text-sm">Elisa van der Meer</h4>
                <p className="text-[10px] text-gray-400 font-semibold">East Africa Safari Specialist</p>
              </div>
            </div>
            <div className="space-y-2 text-xs font-bold text-onSurface text-left border-t border-gray-100 pt-4">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary shrink-0" />
                <span>+1 518-559-1470</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary shrink-0" />
                <span>specialist@africasafaritrips.com</span>
              </div>
            </div>
          </div>

          {/* Call to Action Banner widget */}
          <div className="bg-[#e4a435] text-[#3d1f17] p-6 rounded-2xl space-y-4 shadow border-b-4 border-[#c78b27]">
            <h3 className="text-sm font-black uppercase tracking-widest text-[#3d1f17]">
              Let Us Plan Your Dream Trip
            </h3>
            <p className="text-[11px] leading-relaxed font-semibold">
              Get in touch with us to design a fully customized private itinerary at no charge or obligations.
            </p>
            <button
              onClick={handleInquire}
              className="w-full bg-[#3d1f17] hover:bg-[#4a241a] text-white text-xs font-black uppercase tracking-widest py-3.5 rounded-xl transition-all flex items-center justify-center gap-1.5"
            >
              Start Planning Your Trip <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

