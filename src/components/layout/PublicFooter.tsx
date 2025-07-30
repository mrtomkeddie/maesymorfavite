
'use client';

import { useLanguage } from '@/app/(public)/LanguageProvider';
import { Loader2, Facebook, Twitter, Instagram, Youtube } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { db } from '@/lib/db';
import type { SiteSettings } from '@/lib/types';

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
            title: 'Legal',
            links: [
                {label: 'Privacy Policy', href: '#'},
                {label: 'Cookie Policy', href: '#'},
            ]
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
            title: 'Cyfreithiol',
            links: [
                {label: 'Polisi Preifatrwydd', href: '#'},
                {label: 'Polisi Cwcis', href: '#'},
            ]
        }
    }
};


export function PublicFooter() {
  const { language } = useLanguage();
  const t = content[language];
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    // db.getSiteSettings will correctly use the mock provider in this environment
    db.getSiteSettings().then(setSettings).catch(console.error);
  }, []);
  
  const footerLinkGroups = [
      t.quickLinks,
      t.forParents,
      t.legal,
  ];

  const socialLinks = settings ? [
    { platform: 'Facebook', url: settings.facebookUrl, icon: Facebook },
    { platform: 'Twitter', url: settings.twitterUrl, icon: Twitter },
    { platform: 'Instagram', url: settings.instagramUrl, icon: Instagram },
    { platform: 'YouTube', url: settings.youtubeUrl, icon: Youtube },
  ].filter((link): link is { platform: string; url: string; icon: React.ElementType } => !!link.url) : [];


  return (
    <footer className="bg-foreground text-background">
      <div className="container mx-auto max-w-7xl px-8 py-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5">
            <div className="col-span-1 lg:col-span-2 mb-8 md:mb-0">
                 <Link href="/">
                    <Image src="/logo-white-footer.png" alt="Maes Y Morfa logo" width={1640} height={403} className="h-12 w-auto" />
                </Link>
                <div className="text-sm text-background/70 mt-4 space-y-1 whitespace-pre-line">
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
                           <a key={platform} href={url!} target="_blank" rel="noopener noreferrer" aria-label={`Follow us on ${platform}`}>
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
        <div className="mt-12 flex flex-col items-center justify-center gap-6 border-t border-background/20 pt-8 md:flex-row">
          <p className="text-center text-sm text-background/60">
            © {new Date().getFullYear()} {t.schoolInfo}. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
