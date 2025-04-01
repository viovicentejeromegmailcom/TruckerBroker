import { Link } from "wouter";
import { Facebook, Instagram, Twitter, Linkedin } from "lucide-react";

export default function Footer() {
  return (
      <footer className="bg-white">
        <div className="max-w-7xl mx-auto py-12 px-4 overflow-hidden sm:px-6 lg:px-8">
          <nav className="-mx-5 -my-2 flex flex-wrap justify-center" aria-label="Footer">
            <div className="px-5 py-2">
              <Link href="/about" className="text-base text-secondary-500 hover:text-secondary-900">
                About
              </Link>
            </div>
            <div className="px-5 py-2">
              <Link href="/help" className="text-base text-secondary-500 hover:text-secondary-900">
                Help Center
              </Link>
            </div>
            <div className="px-5 py-2">
              <Link href="/pricing" className="text-base text-secondary-500 hover:text-secondary-900">
                Pricing
              </Link>
            </div>
            <div className="px-5 py-2">
              <Link href="/faq" className="text-base text-secondary-500 hover:text-secondary-900">
                FAQ
              </Link>
            </div>
            <div className="px-5 py-2">
              <Link href="/blog" className="text-base text-secondary-500 hover:text-secondary-900">
                Blog
              </Link>
            </div>
            <div className="px-5 py-2">
              <Link href="/contact" className="text-base text-secondary-500 hover:text-secondary-900">
                Contact
              </Link>
            </div>
          </nav>
          <div className="mt-8 flex justify-center space-x-6">
            <a href="#" className="text-secondary-400 hover:text-secondary-500">
              <span className="sr-only">Facebook</span>
              <Facebook className="h-6 w-6" />
            </a>
            <a href="#" className="text-secondary-400 hover:text-secondary-500">
              <span className="sr-only">Instagram</span>
              <Instagram className="h-6 w-6" />
            </a>
            <a href="#" className="text-secondary-400 hover:text-secondary-500">
              <span className="sr-only">Twitter</span>
              <Twitter className="h-6 w-6" />
            </a>
            <a href="#" className="text-secondary-400 hover:text-secondary-500">
              <span className="sr-only">LinkedIn</span>
              <Linkedin className="h-6 w-6" />
            </a>
          </div>
          <p className="mt-8 text-center text-base text-secondary-400">
            &copy; {new Date().getFullYear()} TruckLink, Inc. All rights reserved.
          </p>
        </div>
      </footer>
  );
}
