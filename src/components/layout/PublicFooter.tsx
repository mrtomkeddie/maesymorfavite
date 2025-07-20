import { School } from 'lucide-react';
import Link from 'next/link';

export function PublicFooter() {
  const footerLinks = {
      Solutions: ['For Primary', 'For Secondary', 'For MATs', 'For Local Authorities'],
      'Who we help': ['Primary Schools', 'Secondary Schools', 'MATs', 'Finance Teams'],
      Resources: ['Blog', 'Case Studies', 'Webinars', 'Whitepapers'],
      'About us': ['Our story', 'Careers', 'Contact us', 'Partners'],
  }

  return (
    <footer className="bg-foreground text-background">
      <div className="container mx-auto max-w-7xl px-4 py-16">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
            <div className="col-span-2 md:col-span-1">
                 <Link href="/" className="flex items-center gap-2">
                    <School className="h-7 w-7 text-primary" />
                    <span className="font-extrabold text-xl">Juniper</span>
                </Link>
            </div>
            {Object.entries(footerLinks).map(([title, links]) => (
                <div key={title} className="space-y-4">
                    <h4 className="font-bold text-base">{title}</h4>
                    <ul className="space-y-2">
                        {links.map((link) => (
                           <li key={link}>
                               <Link href="#" className="text-sm text-background/70 hover:text-background hover:underline">
                                   {link}
                               </Link>
                           </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-6 border-t border-background/20 pt-8 md:flex-row">
          <p className="text-center text-sm text-background/60">
            © {new Date().getFullYear()} Juniper Education. All Rights Reserved.
          </p>
          <nav className="flex gap-4">
            <Link href="#" className="text-sm text-background/60 hover:text-background hover:underline">Privacy Policy</Link>
            <Link href="#" className="text-sm text-background/60 hover:text-background hover:underline">Terms of Service</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
