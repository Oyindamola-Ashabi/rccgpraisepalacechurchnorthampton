import { Link } from "@tanstack/react-router";
import { MapPin, Phone, Mail, Facebook, Instagram, Youtube } from "lucide-react";
import logoAsset from "@/assets/logo.png.asset.json";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t bg-[#0f0a14] text-white/80">
      <div className="mx-auto max-w-7xl px-6 py-16 grid gap-10 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-3">
            <img src={logoAsset.url} alt="PraisePalace Church" className="h-14 w-14 object-contain" />
            <div>
              <div className="font-display font-extrabold text-xl text-white">
                <span className="text-[#E13495]">Praise</span>
                <span className="text-[#91D7F6]">Palace</span>
              </div>
              <div className="text-[10px] tracking-[0.25em] text-[#F0DE51]">CHURCH</div>
            </div>
          </div>
          <p className="mt-4 text-sm leading-relaxed">
            A vibrant Redeemed Christian Church of God parish in the UK. Come as you are — it shall end in praise.
          </p>
          <div className="mt-5 flex gap-3">
            <SocialIcon href="#"><Facebook className="h-4 w-4" /></SocialIcon>
            <SocialIcon href="#"><Instagram className="h-4 w-4" /></SocialIcon>
            <SocialIcon href="#"><Youtube className="h-4 w-4" /></SocialIcon>
          </div>
        </div>

        <div>
          <h4 className="font-display text-lg text-white mb-4">Explore</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/" className="hover:text-[#F0DE51]">Home</Link></li>
            <li><Link to="/about" className="hover:text-[#F0DE51]">About Us</Link></li>
            <li><Link to="/events" className="hover:text-[#F0DE51]">Events</Link></li>
            <li><Link to="/media" className="hover:text-[#F0DE51]">Media</Link></li>
            <li><Link to="/sermons" className="hover:text-[#F0DE51]">Sermons</Link></li>
            <li><Link to="/contact" className="hover:text-[#F0DE51]">Contact</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display text-lg text-white mb-4">Ministries</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="https://praisepalaceradio.com/" target="_blank" rel="noopener noreferrer" className="hover:text-[#F0DE51]">PraisePalace Radio ↗</a></li>
            <li><a href="https://praisepalacebusinessschool.com/" target="_blank" rel="noopener noreferrer" className="hover:text-[#F0DE51]">Business School ↗</a></li>
            <li><a href="https://www.rccgsanctuary.org/events/youth-camp-registration" target="_blank" rel="noopener noreferrer" className="hover:text-[#F0DE51]">Youth Camp ↗</a></li>
            <li><Link to="/events/couples" className="hover:text-[#F0DE51]">Couples</Link></li>
            <li><Link to="/media/podcast" className="hover:text-[#F0DE51]">Podcast</Link></li>
            <li><Link to="/give" className="hover:text-[#F0DE51]">Give</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display text-lg text-white mb-4">Contact</h4>
          <ul className="space-y-3 text-sm">
            <li className="flex gap-3"><MapPin className="h-4 w-4 mt-0.5 shrink-0 text-[#E13495]" /> 350A iCentre, Howard Way, Newport Pagnell, MK16 9PY</li>
            <li className="flex gap-3"><Phone className="h-4 w-4 mt-0.5 shrink-0 text-[#E13495]" /> <a href="tel:+447000000000" className="hover:text-[#F0DE51]">+44 7000 000 000</a></li>
            <li className="flex gap-3"><Mail className="h-4 w-4 mt-0.5 shrink-0 text-[#E13495]" /> <a href="mailto:oyintesting@gmail.com" className="hover:text-[#F0DE51] break-all">oyintesting@gmail.com</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-white/60">
          <p>© {new Date().getFullYear()} PraisePalace Church. All rights reserved.</p>
          <p className="font-display italic text-[#F0DE51]">It Shall End In Praise</p>
        </div>
      </div>
    </footer>
  );
}

function SocialIcon({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="grid h-9 w-9 place-items-center rounded-full bg-white/10 hover:gradient-brand transition"
    >
      {children}
    </a>
  );
}
