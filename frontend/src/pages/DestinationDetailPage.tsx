import { useParams, useNavigate } from 'react-router-dom';
import { Star, CheckCircle, ArrowRight, HelpCircle } from 'lucide-react';

const destinationData: Record<string, {
  name: string;
  tagline: string;
  desc: string;
  image: string;
  packages: Array<{ name: string; duration: string; price: number; image: string; highlights: string[] }>;
  faqs: Array<{ q: string; a: string }>;
}> = {
  kenya: {
    name: 'Kenya Safaris',
    tagline: 'Witness the Great Migration & Meet the Maasai Warriors',
    desc: 'Kenya is the historical home of the East African safari. From the rolling savannahs of the Masai Mara to the iconic backdrop of Mount Kilimanjaro in Amboseli, Kenya offers unparalleled wildlife viewing and rich tribal culture.',
    image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80',
    packages: [
      {
        name: '12-Day Classic Kenya & Tanzania Signature Safari',
        duration: '12 Days',
        price: 4950,
        image: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=600&q=80',
        highlights: ['Masai Mara Wildebeest Crossing', 'Serengeti Game Drive', 'Ngorongoro Crater Tour'],
      },
      {
        name: '7-Day Amboseli & Masai Mara Wildlife Adventure',
        duration: '7 Days',
        price: 3200,
        image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=600&q=80',
        highlights: ['Mt Kilimanjaro Views', 'Big Five Spotting', 'Maasai Village Visit'],
      },
    ],
    faqs: [
      { q: 'When is the best time to visit Kenya?', a: 'The dry season from July to October is ideal, aligning with the Great Migration crossing the Mara River.' },
      { q: 'Is a visa required?', a: 'Yes, most international travellers require an Electronic Travel Authorisation (eTA) prior to arrival.' },
    ],
  },
  uganda: {
    name: 'Uganda Safaris',
    tagline: 'Track Mountain Gorillas in the Impenetrable Forest',
    desc: 'Known as the Pearl of Africa, Uganda is home to over half of the world\'s remaining mountain gorillas. Trek deep into the rainforests of Bwindi or trace the source of the River Nile at Jinja.',
    image: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=1200&q=80',
    packages: [
      {
        name: '10-Day Primates & Wilderness Trekking Experience',
        duration: '10 Days',
        price: 5200,
        image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80',
        highlights: ['Bwindi Gorilla Permit Included', 'Kibale Chimpanzee Tracking', 'Queen Elizabeth Savannah Safari'],
      },
    ],
    faqs: [
      { q: 'How physically demanding is gorilla trekking?', a: 'Trekking can range from 2 to 6 hours through muddy, steep terrain. A reasonable level of fitness is recommended.' },
    ],
  },
  'south-africa': {
    name: 'South Africa Holidays',
    tagline: 'Cosmopolitan Cities, Cape Winelands & Kruger Wildlife',
    desc: 'South Africa offers a diverse blend of modern cosmopolitan experiences in Cape Town, whale watching along the Garden Route, wine tours in Stellenbosch, and world-class safaris in Kruger National Park.',
    image: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=1200&q=80',
    packages: [
      {
        name: '9-Day Cape Town, Winelands & Kruger Safari Tour',
        duration: '9 Days',
        price: 3800,
        image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=600&q=80',
        highlights: ['Table Mountain Cableway', 'Stellenbosch Wine Tasting', 'Kruger Open-Vehicle Safari Drives'],
      },
    ],
    faqs: [
      { q: 'Is South Africa suitable for family holidays?', a: 'Yes! Many reserves along the Eastern Cape are malaria-free, making it perfect for families.' },
    ],
  },
};

export default function DestinationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const destId = id || 'kenya';
  const dest = destinationData[destId] || destinationData.kenya;

  const handleInquireClick = () => {
    navigate('/request-proposal');
  };

  return (
    <div className="min-h-screen bg-[#f7f2ea] pt-24 font-sans text-[#3d1f17]">
      {/* Dynamic Hero Banner */}
      <div className="relative h-[50vh] min-h-[300px] w-full overflow-hidden flex items-center justify-center">
        <img src={dest.image} alt={dest.name} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/45" />
        <div className="relative z-10 text-center text-white px-4 space-y-3">
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-widest">{dest.name}</h1>
          <p className="font-accent text-2xl text-[#e4a435]">{dest.tagline}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-16 grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Main Content (List of itineraries) */}
        <div className="lg:col-span-8 space-y-12">
          
          <div className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-wider">
              Popular Safaris & Itineraries
            </h2>
            <div className="h-1 w-20 bg-secondary" />
            <p className="text-sm leading-relaxed text-[#6f5a52]">{dest.desc}</p>
          </div>

          <div className="space-y-6">
            {dest.packages.map((pkg, idx) => (
              <div key={idx} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col md:flex-row hover:shadow-md transition-shadow">
                <div className="md:w-1/3 h-52 md:h-auto overflow-hidden relative">
                  <img src={pkg.image} alt={pkg.name} className="w-full h-full object-cover" />
                </div>
                <div className="md:w-2/3 p-6 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <h3 className="font-extrabold text-lg md:text-xl text-[#4a241a] leading-snug">
                        {pkg.name}
                      </h3>
                      <span className="bg-[#e4a435] text-[#3d1f17] font-black text-[10px] uppercase tracking-wider px-2.5 py-1 rounded">
                        {pkg.duration}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-[#e4a435]">
                      <Star className="h-3.5 w-3.5 fill-current" />
                      <Star className="h-3.5 w-3.5 fill-current" />
                      <Star className="h-3.5 w-3.5 fill-current" />
                      <Star className="h-3.5 w-3.5 fill-current" />
                      <Star className="h-3.5 w-3.5 fill-current" />
                      <span className="text-[#6f5a52] font-semibold ml-2">5.0 Star Rating</span>
                    </div>
                  </div>

                  <ul className="space-y-1.5">
                    {pkg.highlights.map((h, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs font-bold text-[#6f5a52]">
                        <CheckCircle className="h-3.5 w-3.5 text-primary shrink-0" />
                        {h}
                      </li>
                    ))}
                  </ul>

                  <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                    <div>
                      <span className="text-[9px] uppercase tracking-widest text-[#6f5a52] block">Price per Person</span>
                      <span className="text-xl font-black text-primary">${pkg.price}</span>
                    </div>
                    <button
                      onClick={handleInquireClick}
                      className="bg-primary hover:bg-[#b83f1d] text-white text-xs font-black uppercase tracking-widest px-5 py-3 rounded-full transition-colors flex items-center gap-1"
                    >
                      Book This Itinerary <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Details / FAQs Section */}
          <div className="space-y-6 border-t border-gray-200 pt-8">
            <h3 className="text-xl font-extrabold uppercase tracking-wide">
              Frequently Asked Questions & Tips
            </h3>
            <div className="space-y-4">
              {dest.faqs.map((faq, idx) => (
                <div key={idx} className="bg-white p-5 rounded-xl border border-gray-100 space-y-2">
                  <div className="flex items-center gap-2 text-primary font-bold text-sm">
                    <HelpCircle className="h-4 w-4 shrink-0" />
                    <span>{faq.q}</span>
                  </div>
                  <p className="text-xs text-[#6f5a52] leading-relaxed pl-6">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Sticky Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#4a241a] text-white p-6 rounded-2xl shadow-lg border border-white/5 space-y-4">
            <h3 className="text-lg font-black uppercase tracking-wider text-[#e4a435]">
              Let Us Design Your Safari
            </h3>
            <p className="text-xs leading-relaxed text-gray-300">
              Our travel specialists will build a fully tailored private itinerary around your preferences, group size, and budget with no obligation.
            </p>
            <button
              onClick={handleInquireClick}
              className="w-full bg-[#e4a435] hover:bg-[#d09228] text-[#3d1f17] text-xs font-black uppercase tracking-widest py-3.5 rounded-xl transition-all shadow"
            >
              Get a Free Proposal
            </button>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 space-y-4">
            <h3 className="text-sm font-extrabold uppercase tracking-wider">
              Travel Guarantees
            </h3>
            <div className="space-y-3 text-xs font-bold text-[#6f5a52]">
              <p>✓ 100% Tailor-made Private Safaris</p>
              <p>✓ Best Price Guarantee</p>
              <p>✓ ASTA Bonded & Insured</p>
              <p>✓ 24/7 Ground Support Services</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
