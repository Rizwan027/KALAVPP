'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAppSelector } from '@/store';
import { FiShoppingCart, FiUser, FiMenu, FiX, FiSearch } from 'react-icons/fi';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const { totalItems } = useAppSelector((state) => state.cart);

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <nav className="container-custom">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-primary-600">
              KALAVPP
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            <Link
              href="/products"
              className="text-gray-700 hover:text-primary-600 transition-colors"
            >
              Art & Products
            </Link>
            <Link
              href="/services"
              className="text-gray-700 hover:text-primary-600 transition-colors"
            >
              Services
            </Link>
            <Link
              href="/vendors"
              className="text-gray-700 hover:text-primary-600 transition-colors"
            >
              Artists
            </Link>
            <Link
              href="/about"
              className="text-gray-700 hover:text-primary-600 transition-colors"
            >
              About
            </Link>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Search Icon */}
            <button className="text-gray-700 hover:text-primary-600">
              <FiSearch className="h-5 w-5" />
            </button>

            {/* Cart */}
            <Link href="/cart" className="relative text-gray-700 hover:text-primary-600">
              <FiShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary-600 text-xs text-white">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="relative">
                <Link
                  href={
                    user?.role === 'admin'
                      ? '/admin'
                      : user?.role === 'vendor'
                      ? '/vendor/dashboard'
                      : '/account'
                  }
                  className="flex items-center space-x-2 text-gray-700 hover:text-primary-600"
                >
                  <FiUser className="h-5 w-5" />
                  <span className="hidden lg:inline">{user?.firstName || 'Account'}</span>
                </Link>
              </div>
            ) : (
              <div className="hidden md:flex md:items-center md:space-x-4">
                <Link href="/login" className="text-gray-700 hover:text-primary-600">
                  Login
                </Link>
                <Link href="/register" className="btn-primary">
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-gray-700"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <FiX className="h-6 w-6" />
              ) : (
                <FiMenu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <div className="flex flex-col space-y-4">
              <Link
                href="/products"
                className="text-gray-700 hover:text-primary-600"
                onClick={() => setMobileMenuOpen(false)}
              >
                Art & Products
              </Link>
              <Link
                href="/services"
                className="text-gray-700 hover:text-primary-600"
                onClick={() => setMobileMenuOpen(false)}
              >
                Services
              </Link>
              <Link
                href="/vendors"
                className="text-gray-700 hover:text-primary-600"
                onClick={() => setMobileMenuOpen(false)}
              >
                Artists
              </Link>
              <Link
                href="/about"
                className="text-gray-700 hover:text-primary-600"
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </Link>
              {!isAuthenticated && (
                <>
                  <Link
                    href="/login"
                    className="text-gray-700 hover:text-primary-600"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="btn-primary"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
