import { School } from 'lucide-react';
import Link from 'next/link';

export function PublicFooter() {
  const footerLinks = {
      "Quick Links": ['About', 'Vision', 'Admissions', 'Contact'],
      'For Parents': ['Parent Portal', 'Key Dates', 'Uniform', 'Meals'],
      'Curriculum': ['Early Years', 'Key Stage 1', 'Key Stage 2', 'Beyond the Classroom'],
  }

  return (
    <footer className="bg-foreground text-background">
      <div className="container mx-auto max-w-7xl px-8 py-16">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div className="col-span-2 md:col-span-1 mb-8 md:mb-0">
                 <Link href="/" className="flex items-center gap-2">
                    <School className="h-7 w-7 text-primary" />
                    <span className="font-extrabold text-xl">Maes Y Morfa</span>
                </Link>
                <p className="text-sm text-background/70 mt-4">Maes Y Morfa Primary School <br/>Llanelli, SA15 1EX</p>
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
            © {new Date().getFullYear()} Maes Y Morfa Primary School. All Rights Reserved.
          </p>
          <nav className="flex gap-4">
            <Link href="#" className="text-sm text-background/60 hover:text-background hover:underline">Privacy Policy</Link>
            <Link href="#" className="text-sm text-background/60 hover:text-background hover:underline">Cookie Policy</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
