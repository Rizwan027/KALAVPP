import Link from 'next/link';
import { FiFacebook, FiTwitter, FiInstagram, FiLinkedin } from 'react-icons/fi';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* About */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-white">KALAVPP</h3>
            <p className="text-sm text-gray-400">
              Your marketplace for unique art, creative services, and custom commissions
              from talented artists worldwide.
            </p>
            <div className="mt-4 flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <FiFacebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <FiTwitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <FiInstagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <FiLinkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-white">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/products" className="hover:text-white transition-colors">
                  Browse Products
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-white transition-colors">
                  Browse Services
                </Link>
              </li>
              <li>
                <Link href="/vendors" className="hover:text-white transition-colors">
                  Find Artists
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* For Artists */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-white">For Artists</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/register?role=vendor" className="hover:text-white transition-colors">
                  Become a Vendor
                </Link>
              </li>
              <li>
                <Link href="/vendor/dashboard" className="hover:text-white transition-colors">
                  Vendor Dashboard
                </Link>
              </li>
              <li>
                <Link href="/help/selling" className="hover:text-white transition-colors">
                  How to Sell
                </Link>
              </li>
              <li>
                <Link href="/help/fees" className="hover:text-white transition-colors">
                  Fees & Pricing
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-white">Support</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/help" className="hover:text-white transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-800 pt-8 text-center text-sm">
          <p>&copy; {currentYear} KALAVPP. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
