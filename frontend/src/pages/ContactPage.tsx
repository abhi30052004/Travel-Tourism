import React, { useState } from 'react';
import { Phone, Mail, MapPin, Clock, MessageSquare, Send } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'General Inquiry',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Thank you, ${formData.name}! Your message has been sent. Our specialists will contact you shortly.`);
    setFormData({ name: '', email: '', subject: 'General Inquiry', message: '' });
  };

  return (
    <div className="min-h-screen bg-[#f7f2ea] pt-28 pb-16 font-sans text-[#3d1f17]">
      <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-12">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="inline-block text-xs font-black uppercase tracking-widest text-primary">Contact Us</span>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-wider text-[#4a241a]">Get In Touch</h1>
          <div className="h-1 w-20 bg-secondary mx-auto" />
          <p className="text-sm text-[#6f5a52] leading-relaxed">
            Have questions about gorilla permits, safari booking seasons, or need a customized quote? Send us a message, or call our expert advisors directly.
          </p>
        </div>

        {/* Details & Form Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Contact Details */}
          <div className="lg:col-span-5 bg-darkSurface text-white p-8 rounded-3xl shadow-xl flex flex-col justify-between space-y-8">
            <div className="space-y-6">
              <h3 className="text-xl font-black uppercase tracking-wider text-[#e4a435]">Our Offices</h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                We operate locally in East Africa to coordinate all ground transportation, flying doctor permits, and lodge reservations.
              </p>

              <div className="space-y-4 pt-4">
                <div className="flex items-start gap-4">
                  <MapPin className="h-5 w-5 text-[#e4a435] shrink-0 mt-1" />
                  <div>
                    <h4 className="font-extrabold text-sm">Kampala Operations Office</h4>
                    <p className="text-xs text-gray-300">Plot 12, Acacia Avenue, Kampala, Uganda</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Phone className="h-5 w-5 text-[#e4a435] shrink-0 mt-1" />
                  <div>
                    <h4 className="font-extrabold text-sm">Phone Support</h4>
                    <p className="text-xs text-gray-300">+1 518-559-1470 (Toll-Free)</p>
                    <p className="text-[10px] text-gray-400">Available Mon-Fri 9AM - 6PM EST</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Mail className="h-5 w-5 text-[#e4a435] shrink-0 mt-1" />
                  <div>
                    <h4 className="font-extrabold text-sm">Email Inquiries</h4>
                    <p className="text-xs text-gray-300">specialist@africasafaritrips.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Clock className="h-5 w-5 text-[#e4a435] shrink-0 mt-1" />
                  <div>
                    <h4 className="font-extrabold text-sm">Response Time Guarantee</h4>
                    <p className="text-xs text-gray-300">All proposals sent within 24 hours of request.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-3">
              <span className="text-2xl">🦁</span>
              <p className="text-[10px] text-gray-300 leading-normal">
                Want to book immediately? You can also use our <a href="/request-proposal" className="text-[#e4a435] underline font-bold">interactive proposal form</a> for a faster response.
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-7 bg-white p-8 md:p-10 rounded-3xl border border-gray-200 shadow-sm">
            <h3 className="text-xl font-extrabold uppercase text-[#4a241a] mb-6">Send A Message</h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#6f5a52]">Your Name *</span>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl p-3 text-xs font-bold outline-none focus:border-primary bg-[#f7f2ea]/40"
                  />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#6f5a52]">Your Email *</span>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl p-3 text-xs font-bold outline-none focus:border-primary bg-[#f7f2ea]/40"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#6f5a52]">Subject</span>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl p-3 text-xs font-bold outline-none focus:border-primary bg-[#f7f2ea]/40"
                >
                  <option value="General Inquiry">General Inquiry</option>
                  <option value="Gorilla Permits">Gorilla Permit Booking</option>
                  <option value="Custom Proposal">Tailor-made Safari Quote</option>
                  <option value="Feedback">Feedback</option>
                </select>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#6f5a52]">Message *</span>
                <textarea
                  required
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Share details of your travel group size, preferred dates, and specific requirements..."
                  className="w-full border border-gray-200 rounded-xl p-3 text-xs font-bold outline-none h-36 focus:border-primary bg-[#f7f2ea]/40"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-primary to-secondary text-white font-black uppercase tracking-widest text-xs py-4 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                <Send className="h-4 w-4" /> Send Message
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
