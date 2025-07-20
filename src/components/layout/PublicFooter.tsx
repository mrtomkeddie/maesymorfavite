'use client';

import { useLanguage } from '@/app/(public)/LanguageProvider';
import { School } from 'lucide-react';
import Link from 'next/link';

const content = {
    en: {
        schoolInfo: 'Maes Y Morfa Primary School',
        address: 'Llanelli, SA15 1EX',
        quickLinks: {
            title: 'Quick Links',
            links: ['About', 'Vision', 'Admissions', 'Contact']
        },
        forParents: {
            title: 'For Parents',
            links: ['Parent Portal', 'Key Dates', 'Uniform', 'Meals']
        },
        curriculum: {
            title: 'Curriculum',
            links: ['Early Years', 'Key Stage 1', 'Key Stage 2', 'Beyond the Classroom']
        },
        legal: {
            privacy: 'Privacy Policy',
            cookies: 'Cookie Policy'
        }
    },
    cy: {
        schoolInfo: 'Ysgol Gynradd Maes Y Morfa',
        address: 'Llanelli, SA15 1EX',
        quickLinks: {
            title: 'Cysylltiadau Cyflym',
            links: ['Amdanom Ni', 'Ein Gweledigaeth', 'Derbyniadau', 'Cysylltu']
        },
        forParents: {
            title: 'I Rieni',
            links: ['Porth Rieni', 'Dyddiadau Allweddol', 'Gwisg', 'Bwydlen']
        },
        curriculum: {
            title: 'Cwricwlwm',
            links: ['Blynyddoedd Cynnar', 'Cyfnod Allweddol 1', 'Cyfnod Allweddol 2', 'Y Tu Hwnt i’r Dosbarth']
        },
        legal: {
            privacy: 'Polisi Preifatrwydd',
            cookies: 'Polisi Cwcis'
        }
    }
};


export function PublicFooter() {
  const { language } = useLanguage();
  const t = content[language];
  
  const footerLinks = {
      [t.quickLinks.title]: t.quickLinks.links,
      [t.forParents.title]: t.forParents.links,
      [t.curriculum.title]: t.curriculum.links,
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
                <p className="text-sm text-background/70 mt-4">{t.schoolInfo} <br/>{t.address}</p>
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
            © {new Date().getFullYear()} {t.schoolInfo}. All Rights Reserved.
          </p>
          <nav className="flex gap-4">
            <Link href="#" className="text-sm text-background/60 hover:text-background hover:underline">{t.legal.privacy}</Link>
            <Link href="#" className="text-sm text-background/60 hover:text-background hover:underline">{t.legal.cookies}</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
