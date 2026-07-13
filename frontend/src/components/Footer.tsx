import { Instagram, Facebook, Youtube, Mail, Linkedin } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-[#e6decb] text-[#2d1e18] font-sans pt-16 pb-12 border-t border-gray-300" id="footer">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-4 items-start">

          {/* Column 1: Brand & Contact Info */}
          <div className="space-y-6">
            {/* Logo from the snap */}
            <div className="flex flex-col items-start leading-none text-left">
              <span className="font-playfair font-black italic text-5xl tracking-tight text-[#2d1e18] leading-none">City</span>
              <div className="flex items-center gap-1.5 mt-2 mb-1">
                <span className="bg-[#e4a435] text-[#2d1e18] px-2.5 py-1 rounded font-montserrat font-extrabold text-xs tracking-[0.2em] uppercase shadow-sm">travel</span>
                <span className="text-[10px] tracking-widest font-montserrat uppercase font-bold text-[#2d1e18]">.COM</span>
              </div>
            </div>

            {/* Phone contact */}
            <a href="tel:+15185591470" className="flex items-center gap-2 text-[#2d1e18] hover:text-primary transition-colors text-base font-extrabold pt-2">
              <span className="text-lg text-primary">📞</span> +1 518-559-1470
            </a>



            {/* Vertical Legal Links */}
            <div className="space-y-2.5 pt-4 text-xs font-bold text-[#6f5a52]">
              <p className="text-[#2d1e18]">&copy; 2026 City travel  B.V.</p>
              <div>
                <a href="#" className="underline hover:text-primary transition-colors block py-0.5">Terms and conditions</a>
                <a href="#" className="underline hover:text-primary transition-colors block py-0.5">Privacy policy</a>
                <Link to="/contact" className="underline hover:text-primary transition-colors block py-0.5">Contact us</Link>
              </div>
            </div>
          </div>

          {/* Column 2: OUR  */}
          <div>
            <h4 className="font-black uppercase tracking-widest text-xs text-[#2d1e18] mb-6">OUR </h4>
            <ul className="space-y-4 text-sm font-bold text-[#2d1e18]">
              <li><a href="#destinations" className="hover:text-primary transition-colors block">Uganda Tours</a></li>
              <li><a href="#destinations" className="hover:text-primary transition-colors block">Uganda safari</a></li>
              <li><a href="#destinations" className="hover:text-primary transition-colors block">Kenya Tours</a></li>
              <li><a href="#destinations" className="hover:text-primary transition-colors block">Kenya safari</a></li>
              <li><a href="#destinations" className="hover:text-primary transition-colors block">South Africa Tours</a></li>
              <li><a href="#attractions" className="hover:text-primary transition-colors block">Activities</a></li>
              <li><a href="#packages" className="hover:text-primary transition-colors block">Accommodations</a></li>
              <li><a href="#packages" className="hover:text-primary transition-colors block">View all sample itineraries</a></li>
              <li><Link to="/quiz" className="hover:text-primary transition-colors block">Travel quiz</Link></li>
            </ul>
          </div>

          {/* Column 3: TRAVEL INFORMATION */}
          <div>
            <h4 className="font-black uppercase tracking-widest text-xs text-[#2d1e18] mb-6">TRAVEL INFORMATION</h4>
            <ul className="space-y-4 text-sm font-bold text-[#2d1e18]">
              <li><a href="#" className="hover:text-primary transition-colors block">Practical Information</a></li>
              <li><a href="#" className="hover:text-primary transition-colors block">Our Guarantees</a></li>
              <li><a href="#" className="hover:text-primary transition-colors block">Responsible Travel</a></li>
              <li><a href="#" className="hover:text-primary transition-colors block">Flying Doctors</a></li>
              <li><a href="#" className="hover:text-primary transition-colors block">About City travel </a></li>
              <li><a href="#" className="underline hover:text-primary transition-colors block">View all frequently asked questions</a></li>
            </ul>
          </div>

          {/* Column 4: Newsletter & Social */}
          <div className="space-y-8">
            <div className="space-y-3">
              <h4 className="font-black uppercase tracking-widest text-xs text-[#2d1e18]">SIGN UP FOR OUR NEWSLETTER</h4>
              <p className="text-xs text-[#6f5a52] leading-relaxed font-bold">
                Receive travel ideas, destination guides, and inspiration directly in your inbox.
              </p>

              <form className="space-y-3 pt-2">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Your name"
                    className="w-full bg-white px-3 py-2 text-xs font-bold text-[#2d1e18] border border-transparent outline-none focus:border-primary shadow-sm"
                  />
                  <input
                    type="email"
                    placeholder="Your e-mail"
                    className="w-full bg-white px-3 py-2 text-xs font-bold text-[#2d1e18] border border-transparent outline-none focus:border-primary shadow-sm"
                  />
                </div>

                <div className="flex items-center justify-between gap-4">
                  <p className="text-[10px] text-[#6f5a52] leading-snug font-bold">
                    By signing up for our mailing list, you agree to our <a href="#" className="underline">privacy policy</a>.
                  </p>
                  <button
                    type="submit"
                    className="bg-[#3e1e16] hover:bg-[#2d1e18] text-white text-xs font-black px-6 py-2.5 transition-colors shrink-0 uppercase tracking-wider"
                  >
                    SIGN UP
                  </button>
                </div>
              </form>
            </div>

            {/* Social media icons with yellow backgrounds */}
            <div className="space-y-3">
              <h4 className="font-black uppercase tracking-widest text-xs text-[#2d1e18]">SOCIAL MEDIA</h4>
              <div className="flex flex-wrap gap-2.5">
                {[
                  {
                    icon: (
                      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
                        <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.107C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.388.511a3.002 3.002 0 0 0-2.11 2.107C0 8.048 0 12 0 12s0 3.952.502 5.837a3.002 3.002 0 0 0 2.11 2.107c1.883.511 9.388.511 9.388.511s7.505 0 9.388-.511a3.002 3.002 0 0 0 2.11-2.107c.502-1.885.502-5.837.502-5.837s0-3.952-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                      </svg>
                    ),
                    href: '#'
                  },
                  {
                    icon: (
                      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
                        <path d="M12.24 10.285V13.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.866-3.577-7.866-8S7.91 2 12.24 2c2.46 0 4.105 1.025 5.047 1.926l2.427-2.334C18.155.45 15.435 0 12.24 0 5.58 0 0 5.37 0 12s5.58 12 12.24 12c6.96 0 11.57-4.89 11.57-11.79 0-.795-.085-1.4-.195-1.925H12.24z" />
                      </svg>
                    ),
                    href: '#'
                  },
                  { icon: <Instagram className="h-4 w-4" />, href: '#' },
                  { icon: <Facebook className="h-4 w-4 fill-current" />, href: '#' },
                  { icon: <Linkedin className="h-4 w-4 fill-current" />, href: '#' },
                ].map((s, idx) => (
                  <a
                    key={idx}
                    href={s.href}
                    className="w-8 h-8 rounded-full bg-[#e5a83b] text-[#2d1e18] flex items-center justify-center transition-all hover:scale-110 hover:bg-[#d09228] shadow-sm hover:shadow"
                  >
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
}
