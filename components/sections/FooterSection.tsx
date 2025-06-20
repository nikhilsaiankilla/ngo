import React from 'react';
import Link from 'next/link';
import { Facebook, Twitter, Linkedin, Instagram } from 'lucide-react';

const FooterSection = () => {
    return (
        <footer className="w-full bg-brand text-white px-6 sm:px-8 py-10">
            <div className="max-w-7xl mx-auto flex justify-between flex-wrap gap-10">

                {/* Brand + Description */}
                <div>
                    <h2 className="text-2xl font-bold">Hussani Welfare Association</h2>
                    <p className="mt-2 text-sm text-gray-400">
                        Empowering communities through education, healthcare, and clean water. Join us in making a difference.
                    </p>
                </div>

                {/* Navigation Links */}
                <div>
                    <h3 className="text-lg font-semibold mb-3">Quick Links</h3>
                    <ul className="space-y-2 text-sm text-white/80">
                        <li><Link href="/">Home</Link></li>
                        <li><Link href="/about">About Us</Link></li>
                        <li><Link href="/events">Events</Link></li>
                        <li><Link href="/services">Services</Link></li>
                        <li><Link href="/contact-us">Contact</Link></li>
                        <li><Link href="/privacy-policy">Privacy Policy</Link></li>
                        <li><Link href="/terms-and-conditions">Terms & Conditions</Link></li>
                        <li><Link href="/faq">FAQ</Link></li>
                    </ul>
                </div>

                {/* Social Links */}
                <div>
                    <h3 className="text-lg font-semibold mb-3">Follow Us</h3>
                    <div className="flex gap-3">
                        <Link href="https://facebook.com/hussaniwelfare" target="_blank"><Facebook className="hover:text-white/90" /></Link>
                        <Link href="https://twitter.com/hussaniwelfare" target="_blank"><Twitter className="hover:text-white/90" /></Link>
                        <Link href="https://linkedin.com/company/hussaniwelfare" target="_blank"><Linkedin className="hover:text-white/90" /></Link>
                        <Link href="https://instagram.com/hussaniwelfare" target="_blank"><Instagram className="hover:text-white/90" /></Link>
                    </div>
                </div>

            </div>

            {/* Bottom Line */}
            <div className="border-t border-white/20 mt-10 pt-4 text-center text-sm text-white/70">
                © {new Date().getFullYear()} Hussaini Welfare Association. All rights reserved.
            </div>
        </footer>
    );
};

export default FooterSection;
