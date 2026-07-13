import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, ShieldAlert, CheckCircle2, ChevronDown, Calendar, Minus, Plus } from 'lucide-react';

export default function ProposalPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    countries: [] as string[],
    activities: [] as string[],
    days: 12,
    companion: 'Couple',
    arrivalDate: '',
    budget: 4500,
    adults: 2,
    children: 0,
    adultAges: ['30-39', '30-39'],
    childAges: [] as string[],
    notes: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    country: 'United States',
    newsletter: true,
  });

  const handleCountryChange = (country: string) => {
    setFormData(prev => ({
      ...prev,
      countries: prev.countries.includes(country)
        ? prev.countries.filter(c => c !== country)
        : [...prev.countries, country]
    }));
  };

  const handleActivityChange = (activity: string) => {
    setFormData(prev => ({
      ...prev,
      activities: prev.activities.includes(activity)
        ? prev.activities.filter(a => a !== activity)
        : [...prev.activities, activity]
    }));
  };

  const adjustAdults = (amount: number) => {
    setFormData(prev => {
      const newCount = Math.max(1, prev.adults + amount);
      const newAges = [...prev.adultAges];
      if (amount > 0) {
        newAges.push('30-39');
      } else if (amount < 0 && newAges.length > 1) {
        newAges.pop();
      }
      return { ...prev, adults: newCount, adultAges: newAges };
    });
  };

  const adjustChildren = (amount: number) => {
    setFormData(prev => {
      const newCount = Math.max(0, prev.children + amount);
      const newAges = [...prev.childAges];
      if (amount > 0) {
        newAges.push('Under 12');
      } else if (amount < 0 && newAges.length > 0) {
        newAges.pop();
      }
      return { ...prev, children: newCount, childAges: newAges };
    });
  };

  const handleAdultAgeChange = (index: number, age: string) => {
    const newAges = [...formData.adultAges];
    newAges[index] = age;
    setFormData({ ...formData, adultAges: newAges });
  };

  const handleChildAgeChange = (index: number, age: string) => {
    const newAges = [...formData.childAges];
    newAges[index] = age;
    setFormData({ ...formData, childAges: newAges });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Thank you! Your travel proposal request has been submitted successfully. A specialist will contact you within 24 hours.');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#f7f2ea] pt-24 pb-16 font-sans">
      <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left side: Proposal Form */}
        <div className="lg:col-span-2 bg-[#4a241a] text-white p-6 md:p-10 rounded-2xl shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl md:text-3xl font-extrabold uppercase tracking-widest text-[#e4a435]">
              Request Travel Proposal
            </h1>
            <span className="text-[10px] uppercase font-bold tracking-widest bg-white/10 px-2.5 py-1 rounded border border-white/20">
              $ U.S. Dollar
            </span>
          </div>

          <p className="text-xs text-gray-300 mb-8 border-b border-white/15 pb-4">
            * Indicates a required field
          </p>

          <form onSubmit={handleSubmit} className="space-y-8">

            {/* 1. Countries */}
            <div className="space-y-3">
              <label className="block text-xs font-black uppercase tracking-widest text-[#e4a435]">
                1. What country/countries do you want to visit? *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {['Kenya', 'Uganda', 'Tanzania', 'South Africa'].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => handleCountryChange(c)}
                    className={`p-3 rounded-lg border text-xs font-extrabold transition-all text-center ${formData.countries.includes(c)
                      ? 'border-[#e4a435] bg-[#e4a435] text-[#3d1f17] shadow-lg'
                      : 'border-white/20 bg-white/5 text-white hover:bg-white/10'
                      }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Activities */}
            <div className="space-y-3">
              <label className="block text-xs font-black uppercase tracking-widest text-[#e4a435]">
                2. What do you want to do? *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {['Safari', 'Beach holiday', 'Mountain climbing', 'Gorilla trekking', 'Chimpanzee trekking', 'Hiking & Outdoors', 'Wings', 'Whales'].map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => handleActivityChange(a)}
                    className={`p-3 rounded-lg border text-xs font-extrabold transition-all text-center ${formData.activities.includes(a)
                      ? 'border-[#e4a435] bg-[#e4a435] text-[#3d1f17] shadow-lg'
                      : 'border-white/20 bg-white/5 text-white hover:bg-white/10'
                      }`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Duration */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest text-[#e4a435]">
                <span>3. How many days do you want to travel? *</span>
                <span className="text-white text-sm font-black normal-case">{formData.days} days</span>
              </div>
              <div className="px-2">
                <input
                  type="range"
                  min="3"
                  max="21"
                  value={formData.days}
                  onChange={(e) => setFormData({ ...formData, days: parseInt(e.target.value) })}
                  className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#e4a435]"
                />
                <div className="flex justify-between text-[10px] text-gray-400 font-bold mt-1">
                  <span>3</span>
                  <span>12 days</span>
                  <span>21+</span>
                </div>
              </div>
            </div>

            {/* 4. Companions */}
            <div className="space-y-3">
              <label className="block text-xs font-black uppercase tracking-widest text-[#e4a435]">
                4. Who are you travelling with? *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {['Honeymoon', 'Family', 'Solo', 'Couple', 'Group of friends', 'Others'].map((comp) => (
                  <button
                    key={comp}
                    type="button"
                    onClick={() => setFormData({ ...formData, companion: comp })}
                    className={`p-3 rounded-lg border text-xs font-extrabold transition-all text-center ${formData.companion === comp
                      ? 'border-[#e4a435] bg-[#e4a435] text-[#3d1f17] shadow-lg'
                      : 'border-white/20 bg-white/5 text-white hover:bg-white/10'
                      }`}
                  >
                    {comp}
                  </button>
                ))}
              </div>
            </div>

            {/* 5. Arrival Date */}
            <div className="space-y-3">
              <label className="block text-xs font-black uppercase tracking-widest text-[#e4a435]">
                5. When do you want to travel? *
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={formData.arrivalDate}
                  onChange={(e) => setFormData({ ...formData, arrivalDate: e.target.value })}
                  className="w-full bg-white/5 border border-white/20 rounded-lg py-3 px-4 text-xs font-bold text-white outline-none focus:border-[#e4a435]"
                  required
                />
              </div>
            </div>

            {/* 6. Budget Slider */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest text-[#e4a435]">
                <span>6. Do you have a budget per person in mind? *</span>
                <span className="text-white text-sm font-black normal-case">${formData.budget} per person</span>
              </div>
              <div className="px-2">
                <input
                  type="range"
                  min="1500"
                  max="7500"
                  step="500"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: parseInt(e.target.value) })}
                  className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#e4a435]"
                />
                <div className="flex justify-between text-[10px] text-gray-400 font-bold mt-1">
                  <span>$1500</span>
                  <span>$4500 per person</span>
                  <span>$7500+</span>
                </div>
              </div>
            </div>

            {/* Travellers & Age */}
            <div className="border-t border-white/15 pt-6 space-y-6">
              <h3 className="text-sm font-black uppercase tracking-widest text-[#e4a435]">
                Travellers & Age
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Adults counter */}
                <div className="space-y-3">
                  <span className="text-xs font-bold text-gray-300 block">Choose the number of Adults</span>
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => adjustAdults(-1)}
                      className="w-8 h-8 rounded-full border border-white/20 hover:bg-white/10 flex items-center justify-center text-white"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="text-lg font-black">{formData.adults}</span>
                    <button
                      type="button"
                      onClick={() => adjustAdults(1)}
                      className="w-8 h-8 rounded-full border border-white/20 hover:bg-white/10 flex items-center justify-center text-white"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Adult Age Selectors */}
                  <div className="space-y-2 mt-4">
                    {formData.adultAges.map((age, idx) => (
                      <div key={idx} className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-gray-400">Adult {idx + 1} Age:</span>
                        <div className="relative">
                          <select
                            value={age}
                            onChange={(e) => handleAdultAgeChange(idx, e.target.value)}
                            className="w-full bg-white/5 border border-white/20 rounded-md py-2 px-3 text-xs font-bold text-white outline-none appearance-none focus:border-[#e4a435]"
                          >
                            <option value="18-29" className="text-onSurface">18-29 years</option>
                            <option value="30-39" className="text-onSurface">30-39 years</option>
                            <option value="40-49" className="text-onSurface">40-49 years</option>
                            <option value="50-59" className="text-onSurface">50-59 years</option>
                            <option value="60+" className="text-onSurface">60+ years</option>
                          </select>
                          <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Children counter */}
                <div className="space-y-3">
                  <span className="text-xs font-bold text-gray-300 block">Choose the number of Children</span>
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => adjustChildren(-1)}
                      className="w-8 h-8 rounded-full border border-white/20 hover:bg-white/10 flex items-center justify-center text-white"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="text-lg font-black">{formData.children}</span>
                    <button
                      type="button"
                      onClick={() => adjustChildren(1)}
                      className="w-8 h-8 rounded-full border border-white/20 hover:bg-white/10 flex items-center justify-center text-white"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Child Age Selectors */}
                  <div className="space-y-2 mt-4">
                    {formData.childAges.map((age, idx) => (
                      <div key={idx} className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-gray-400">Child {idx + 1} Age:</span>
                        <div className="relative">
                          <select
                            value={age}
                            onChange={(e) => handleChildAgeChange(idx, e.target.value)}
                            className="w-full bg-white/5 border border-white/20 rounded-md py-2 px-3 text-xs font-bold text-white outline-none appearance-none focus:border-[#e4a435]"
                          >
                            <option value="Under 5" className="text-onSurface">Under 5 years</option>
                            <option value="5-11" className="text-onSurface">5-11 years</option>
                            <option value="12-17" className="text-onSurface">12-17 years</option>
                          </select>
                          <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Note Textarea */}
            <div className="border-t border-white/15 pt-6 space-y-3">
              <label className="block text-xs font-black uppercase tracking-widest text-[#e4a435]">
                Anything else you'd like to share with us?
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="For example, if you want to combine safari and beach, would you prefer a long safari and a short beach holiday, or the reverse? Do you want a specific safari type? Which national parks or animals would you really want to see?"
                className="w-full bg-white/5 border border-white/20 rounded-lg p-4 text-xs font-bold text-white placeholder-gray-500 outline-none h-32 focus:border-[#e4a435]"
              />
            </div>

            {/* Contact Details */}
            <div className="border-t border-white/15 pt-6 space-y-4">
              <h3 className="text-sm font-black uppercase tracking-widest text-[#e4a435]">
                Your Contact Details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-gray-300">First Name *</span>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full bg-white/5 border border-white/20 rounded-md py-2 px-3 text-xs font-bold text-white outline-none focus:border-[#e4a435]"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-gray-300">Last Name *</span>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full bg-white/5 border border-white/20 rounded-md py-2 px-3 text-xs font-bold text-white outline-none focus:border-[#e4a435]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold text-gray-300">Email *</span>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-white/5 border border-white/20 rounded-md py-2 px-3 text-xs font-bold text-white outline-none focus:border-[#e4a435]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-gray-300">Phone Number *</span>
                  <input
                    type="tel"
                    required
                    placeholder="+1 (202) 555-0125"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-white/5 border border-white/20 rounded-md py-2 px-3 text-xs font-bold text-white outline-none focus:border-[#e4a435]"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-gray-300">Country *</span>
                  <div className="relative">
                    <select
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      className="w-full bg-white/5 border border-white/20 rounded-md py-2 px-3 text-xs font-bold text-white outline-none appearance-none focus:border-[#e4a435]"
                    >
                      <option value="United States" className="text-onSurface">United States</option>
                      <option value="United Kingdom" className="text-onSurface">United Kingdom</option>
                      <option value="Canada" className="text-onSurface">Canada</option>
                      <option value="Australia" className="text-onSurface">Australia</option>
                      <option value="Germany" className="text-onSurface">Germany</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2 pt-2">
                <input
                  type="checkbox"
                  id="newsletter"
                  checked={formData.newsletter}
                  onChange={(e) => setFormData({ ...formData, newsletter: e.target.checked })}
                  className="mt-1 rounded bg-white/5 border-white/20 text-[#e4a435]"
                />
                <label htmlFor="newsletter" className="text-[11px] text-gray-300 leading-tight">
                  I agree to receive the newsletter with travel news and inspiration for planning my next unforgettable holiday.
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                className="w-full py-4 bg-[#e4a435] hover:bg-[#d09228] text-[#3d1f17] font-black uppercase tracking-widest text-xs rounded-full transition-all shadow-lg hover:shadow-[#e4a435]/25"
              >
                Submit this travel proposal
              </button>
              <p className="text-[10px] text-gray-400 text-center mt-3 leading-normal">
                By submitting your details, you agree that our team may contact you in line with our Privacy Policy and Terms and Conditions.
              </p>
            </div>

          </form>
        </div>

        {/* Right side: Information Sticky Sidebar */}
        <div className="space-y-6">
          {/* Take the Quiz Banner */}
          <div className="bg-[#e4a435] text-[#3d1f17] p-6 rounded-2xl shadow-md border-b-4 border-[#c78b27]">
            <h3 className="font-extrabold uppercase text-xs tracking-wider mb-2">Not sure where to go?</h3>
            <p className="text-xs leading-relaxed font-medium mb-4">
              Enter our quick quiz to discover your perfect African safari destination based on your preferences.
            </p>
            <button
              onClick={() => navigate('/quiz')}
              className="w-full bg-[#3d1f17] hover:bg-[#4a241a] text-white text-xs font-black uppercase tracking-widest py-3 rounded-lg transition-colors flex items-center justify-center gap-1.5"
            >
              Take the quiz <span className="font-bold text-sm">→</span>
            </button>
          </div>

          {/* Guarantees List */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
            <h3 className="text-sm font-extrabold text-onSurface uppercase tracking-wide border-b border-gray-100 pb-2">
              Make your dream trip come true with City travel
            </h3>
            <div className="space-y-3">
              {[
                'Custom and private travel',
                'Inquire without obligations',
                'Best price guarantee',
                'Highest service',
                'Response within 24 hours',
                'We take care of everything',
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#e4a435] shrink-0" />
                  <span className="text-xs font-bold text-onSurface">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Customer Reviews Rating Box */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
            <h3 className="text-xs font-black uppercase text-muted tracking-wider">
              How previous guests rated us:
            </h3>
            <div className="space-y-4">
              {/* Review Site 1 */}
              <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                <div>
                  <span className="font-extrabold text-base text-onSurface">4.9/5</span>
                  <div className="flex text-yellow-500 text-xs">
                    <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
                  </div>
                  <span className="text-[10px] text-muted">Based on 3,500+ reviews</span>
                </div>
                <span className="font-black text-[#1a4d2e] text-sm">🦉 Tripadvisor</span>
              </div>
              {/* Review Site 2 */}
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-extrabold text-base text-onSurface">4.8/5</span>
                  <div className="flex text-yellow-500 text-xs">
                    <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
                  </div>
                  <span className="text-[10px] text-muted">Based on 2,800+ reviews</span>
                </div>
                <span className="font-black text-blue-600 text-sm">G Google</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
