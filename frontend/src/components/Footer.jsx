import React from "react";
import {
  FacebookIcon,
  YoutubeIcon,
  InstagramIcon,
  TwitterIcon,
  MessageCircle
} from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 px-6 py-12 mt-20 shadow-inner">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
        {/* Branding */}
        <div>
          <h2 className="text-3xl font-bold text-emerald-400 mb-4">EcoLedger</h2>
          <p className="text-sm mb-6">
            Powering transparent, verifiable carbon credit authentication. Built for trust, scalability, and planet-first impact.
          </p>
          <div className="flex gap-4 mt-4">
            {[ 
              { href: "https://facebook.com", icon: FacebookIcon },
              { href: "https://youtube.com", icon: YoutubeIcon },
              { href: "https://instagram.com", icon: InstagramIcon },
              { href: "https://twitter.com", icon: TwitterIcon },
              { href: "https://whatsapp.com", icon: MessageCircle }
            ].map(({ href, icon: Icon }, idx) => (
              <a
                key={idx}
                href={href}
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 flex items-center justify-center bg-gray-700 hover:bg-orange-500 transition-colors rounded-full"
              >
                <Icon className="text-white" size={18} />
              </a>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div>
          <h3 className="text-lg font-semibold text-emerald-300 mb-4">Navigation</h3>
          <ul className="space-y-3 text-sm">
            <li><a href="/" className="hover:text-orange-400 transition">Home</a></li>
            <li><a href="/upload" className="hover:text-orange-400 transition">Upload</a></li>
            <li><a href="/marketplace" className="hover:text-orange-400 transition">Marketplace</a></li>
            <li><a href="/dashboard" className="hover:text-orange-400 transition">Dashboard</a></li>
            <li><a href="/login" className="hover:text-orange-400 transition">Login</a></li>
          </ul>
        </div>

        {/* Contact & Newsletter */}
        <div>
          <h3 className="text-lg font-semibold text-emerald-300 mb-4">Contact</h3>
          <ul className="space-y-2 text-sm">
            <li>Email: support@ecoledger.io</li>
            <li>Phone: +1 (555) 123-4567</li>
            <li>Location: 🌍 Earth Based, Web Powered</li>
          </ul>

          <div className="mt-6">
            <p className="mb-2 font-medium text-sm text-emerald-300">Subscribe for Updates</p>
            <div className="flex items-center">
              <input
                type="email"
                placeholder="Email Address"
                className="px-4 py-2 w-full rounded-l-md bg-gray-800 border border-gray-700 text-white text-sm outline-none"
              />
              <button className="bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-r-md text-white text-sm font-medium transition">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-700 mt-10 pt-6 text-xs text-center text-gray-500">
        © {new Date().getFullYear()} EcoLedger. All rights reserved. &nbsp;
        <a href="/privacy" className="hover:text-orange-400 underline transition">Privacy Policy</a>
      </div>
    </footer>
  );
};

export default Footer;
