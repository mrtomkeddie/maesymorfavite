
'use client';

import { useLanguage } from '@/app/(public)/LanguageProvider';
import { Loader2, Facebook, Twitter, Instagram, Youtube } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { getSiteSettings, SiteSettings } from '@/lib/firebase/firestore';

const content = {
    en: {
        schoolInfo: 'Maes Y Morfa Primary School',
        quickLinks: {
            title: 'Quick Links',
            links: [
                {label: 'About', href: '/about'},
                {label: 'Admissions', href: '/admissions'},
                {label: 'Curriculum', href: '/curriculum'},
                {label: 'Key Info', href: '/key-info'},
                {label: 'Contact', href: '/contact'},
            ]
        },
        forParents: {
            title: 'For Parents',
            links: [
                {label: 'Parent Portal', href: '/login'},
                {label: 'News', href: '/news'},
                {label: 'Calendar', href: '/calendar'},
            ]
        },
        legal: {
            privacy: 'Privacy Policy',
            cookies: 'Cookie Policy',
            adminLogin: 'Admin Login'
        }
    },
    cy: {
        schoolInfo: 'Ysgol Gynradd Maes Y Morfa',
        quickLinks: {
            title: 'Cysylltiadau Cyflym',
            links: [
                {label: 'Amdanom Ni', href: '/about'},
                {label: 'Derbyniadau', href: '/admissions'},
                {label: 'Cwricwlwm', href: '/curriculum'},
                {label: 'Gwybodaeth Allweddol', href: '/key-info'},
                {label: 'Cysylltu', href: '/contact'},
            ]
        },
        forParents: {
            title: 'I Rieni',
            links: [
                {label: 'Porth Rieni', href: '/login'},
                {label: 'Newyddion', href: '/news'},
                {label: 'Calendr', href: '/calendar'},
            ]
        },
        legal: {
            privacy: 'Polisi Preifatrwydd',
            cookies: 'Polisi Cwcis',
            adminLogin: 'Mewngofnodi Gweinyddwr'
        }
    }
};


export function PublicFooter() {
  const { language } = useLanguage();
  const t = content[language];
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    getSiteSettings().then(setSettings).catch(console.error);
  }, []);
  
  const footerLinkGroups = [
      t.quickLinks,
      t.forParents,
  ];

  const socialLinks = [
    { platform: 'Facebook', url: settings?.facebookUrl, icon: Facebook },
    { platform: 'Twitter', url: settings?.twitterUrl, icon: Twitter },
    { platform: 'Instagram', url: settings?.instagramUrl, icon: Instagram },
    { platform: 'YouTube', url: settings?.youtubeUrl, icon: Youtube },
  ].filter(link => link.url);


  return (
    <footer className="bg-foreground text-background">
      <div className="container mx-auto max-w-7xl px-8 py-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4 lg:grid-cols-5">
            <div className="col-span-1 md:col-span-2 mb-8 md:mb-0">
                 <Link href="/" className="flex items-center gap-2">
                    <Image src="/logo.png" alt="Maes Y Morfa logo" width={28} height={28} className="h-7 w-7" />
                    <span className="font-extrabold text-xl">Maes Y Morfa</span>
                </Link>
                <div className="text-sm text-background/70 mt-4 space-y-1">
                    {settings ? (
                       <>
                        <p>{settings.address}</p>
                        <p>{settings.phone}</p>
                        <p>{settings.email}</p>
                       </>
                    ) : (
                       <>
                         <div className="h-5 w-48 bg-gray-600 animate-pulse rounded-md mt-1"></div>
                         <div className="h-5 w-32 bg-gray-600 animate-pulse rounded-md mt-1"></div>
                       </>
                    )}
                </div>
                 {socialLinks.length > 0 && (
                    <div className="flex items-center gap-4 mt-6">
                        {socialLinks.map(({ platform, url, icon: Icon }) => (
                           <a key={platform} href={url} target="_blank" rel="noopener noreferrer" aria-label={`Follow us on ${platform}`}>
                             <Icon className="h-6 w-6 text-background/70 hover:text-background transition-colors" />
                           </a>
                        ))}
                    </div>
                )}
            </div>
            {footerLinkGroups.map((group) => (
                <div key={group.title} className="space-y-4 lg:col-span-1">
                    <h4 className="font-bold text-base">{group.title}</h4>
                    <ul className="space-y-2">
                        {group.links.map((link) => (
                           <li key={link.label}>
                               <Link href={link.href} className="text-sm text-background/70 hover:text-background hover:underline">
                                   {link.label}
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
          <nav className="flex flex-wrap justify-center gap-4">
            <Link href="#" className="text-sm text-background/60 hover:text-background hover:underline">{t.legal.privacy}</Link>
            <Link href="#" className="text-sm text-background/60 hover:text-background hover:underline">{t.legal.cookies}</Link>
            <Link href="/admin/login" className="text-sm text-background/60 hover:text-background hover:underline">{t.legal.adminLogin}</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
