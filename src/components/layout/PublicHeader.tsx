
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { Menu, Home, Info, Newspaper, School, Briefcase, Mail, X } from 'lucide-react';
import { useLanguage } from '@/app/(public)/LanguageProvider';
import Image from 'next/image';

const content = {
    en: {
        nav: [
            { href: '/', label: 'Home', icon: Home },
            { href: '/about', label: 'About', icon: Info },
            { href: '/news', label: 'News', icon: Newspaper },
            { href: '/admissions', label: 'Admissions', icon: School },
            { href: '/curriculum', label: 'Curriculum', icon: Briefcase },
            { href: '/contact', label: 'Contact', icon: Mail },
        ],
        portal: 'Parent Portal',
        adminLogin: 'Admin Login',
        lang1: 'Cymraeg',
        lang2: 'English',
        menu: 'Menu',
    },
    cy: {
        nav: [
            { href: '/', label: 'Hafan', icon: Home },
            { href: '/about', label: 'Amdanom Ni', icon: Info },
            { href: '/news', label: 'Newyddion', icon: Newspaper },
            { href: '/admissions', label: 'Derbyniadau', icon: School },
            { href: '/curriculum', label: 'Cwricwlwm', icon: Briefcase },
            { href: '/contact', label: 'Cysylltu', icon: Mail },
        ],
        portal: 'Porth Rieni',
        adminLogin: 'Mewngofnodi Gweinyddwr',
        lang1: 'Cymraeg',
        lang2: 'English',
        menu: 'Bwydlen',
    }
}

export function PublicHeader() {
  const { language, setLanguage } = useLanguage();
  const t = content[language];
  const navLinks = t.nav;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-20 max-w-7xl items-center justify-between px-8">
        <div className="flex items-center gap-x-8">
            <Link href="/" className="flex items-center gap-2 font-bold shrink-0">
              <Image src="/logo.png" alt="Maes Y Morfa logo" width={28} height={28} className="h-7 w-7" />
              <span className="text-xl font-extrabold tracking-tight">Maes Y Morfa</span>
            </Link>
        </div>

        <div className="flex items-center gap-4">
           <div className="hidden sm:flex items-center gap-1 border rounded-full p-1 text-sm">
               <Button variant={language === 'cy' ? 'secondary' : 'ghost'} size="sm" className={`rounded-full px-3 py-1 h-auto text-xs`} onClick={() => setLanguage('cy')}>{t.lang1}</Button>
               <div className="w-px h-4 bg-border"></div>
               <Button variant={language === 'en' ? 'secondary' : 'ghost'} size="sm" className={`rounded-full px-3 py-1 h-auto text-xs`} onClick={() => setLanguage('en')}>{t.lang2}</Button>
           </div>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="px-2 lg:px-4">
                <Menu className="h-5 w-5 lg:hidden" />
                <span className="hidden lg:flex items-center">
                    <Menu className="h-5 w-5 mr-2" />
                    {t.menu}
                </span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[18rem] bg-background p-0 text-foreground" closeIcon={false}>
              <div className="flex h-full flex-col">
                <div className="flex h-20 items-center justify-between border-b border-border/40 px-6">
                    <Link href="/" className="flex items-center gap-3">
                        <Image src="/logo.png" alt="Maes Y Morfa logo" width={32} height={32} className="h-8 w-8" />
                        <span className="text-lg font-bold">Maes Y Morfa</span>
                    </Link>
                    <SheetClose asChild>
                        <Button variant="ghost" size="icon" className='h-9 w-9'>
                            <X className="h-5 w-5 text-muted-foreground" />
                            <span className="sr-only">Close</span>
                        </Button>
                    </SheetClose>
                </div>
                 <div className="flex flex-1 flex-col gap-2 p-6">
                    {navLinks.map((link) => {
                        const Icon = link.icon;
                        return (
                            <SheetClose asChild key={link.href}>
                                <Link href={link.href} className="flex items-center gap-4 rounded-lg p-3 text-lg font-medium text-foreground/80 transition-colors hover:bg-secondary">
                                    <Icon className="h-6 w-6 text-primary" />
                                    <span>{link.label}</span>
                                </Link>
                            </SheetClose>
                        )
                    })}
                 </div>
                 <div className="space-y-2 border-t border-border/40 p-6">
                     <SheetClose asChild>
                         <Button asChild className="w-full">
                            <Link href="/login">{t.portal}</Link>
                        </Button>
                     </SheetClose>
                    <SheetClose asChild>
                        <Button asChild variant="outline" className="w-full">
                            <Link href="/admin/login">{t.adminLogin}</Link>
                        </Button>
                    </SheetClose>
                 </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
