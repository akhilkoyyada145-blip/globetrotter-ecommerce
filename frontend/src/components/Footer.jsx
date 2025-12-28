import { Mail, Phone, MapPin, Facebook, Twitter, Instagram } from 'lucide-react';

function Footer() {
  return (
    <footer className="bg-primary text-white mt-12">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-xl font-bold mb-4">Globetrotter</h3>
            <p className="text-gray-300 text-sm">
              Your one-stop shop for quality products at amazing prices. Shop with confidence!
            </p>
            <div className="flex space-x-4 mt-4">
              <Facebook className="hover:text-accent cursor-pointer transition" size={20} />
              <Twitter className="hover:text-accent cursor-pointer transition" size={20} />
              <Instagram className="hover:text-accent cursor-pointer transition" size={20} />
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="hover:text-accent cursor-pointer transition">About Us</li>
              <li className="hover:text-accent cursor-pointer transition">Contact</li>
              <li className="hover:text-accent cursor-pointer transition">FAQs</li>
              <li className="hover:text-accent cursor-pointer transition">Shipping Info</li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-bold mb-4">Customer Service</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="hover:text-accent cursor-pointer transition">Returns</li>
              <li className="hover:text-accent cursor-pointer transition">Track Order</li>
              <li className="hover:text-accent cursor-pointer transition">Privacy Policy</li>
              <li className="hover:text-accent cursor-pointer transition">Terms & Conditions</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold mb-4">Contact Us</h4>
            <div className="space-y-3 text-sm text-gray-300">
              <div className="flex items-center space-x-2">
                <Mail size={16} />
                <span>support@globetrotter.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone size={16} />
                <span>+44 123 456 7890</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin size={16} />
                <span>Newcastle upon Tyne, UK</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-sm text-gray-400">
          <p>&copy; 2024 Globetrotter. All rights reserved. Built with ❤️ by Akhil</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;