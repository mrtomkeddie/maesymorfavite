
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Search } from 'lucide-react';
import { useLanguage } from '@/app/(public)/LanguageProvider';
import Image from 'next/image';

const content = {
    en: {
        nav: [
            { href: '/about', label: 'About' },
            { href: '/news', label: 'News' },
            { href: '/admissions', label: 'Admissions' },
            { href: '/curriculum', label: 'Curriculum' },
            { href: '/contact', label: 'Contact' },
        ],
        portal: 'Parent Portal',
        lang1: 'Cymraeg',
        lang2: 'English',
    },
    cy: {
        nav: [
            { href: '/about', label: 'Amdanom Ni' },
            { href: '/news', label: 'Newyddion' },
            { href: '/admissions', label: 'Derbyniadau' },
            { href: '/curriculum', label: 'Cwricwlwm' },
            { href: '/contact', label: 'Cysylltu' },
        ],
        portal: 'Porth Rieni',
        lang1: 'Cymraeg',
        lang2: 'English',
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
            <nav className="hidden xl:flex xl:items-center xl:gap-8 text-base font-medium">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} className="text-foreground/80 transition-colors hover:text-foreground shrink-0">
                  {link.label}
                </Link>
              ))}
            </nav>
        </div>

        <div className="flex items-center gap-2">
           <div className="hidden sm:flex items-center gap-1 border rounded-full p-1 text-sm">
               <Button variant={language === 'cy' ? 'secondary' : 'ghost'} size="sm" className={`rounded-full px-3 py-1 h-auto text-xs`} onClick={() => setLanguage('cy')}>{t.lang1}</Button>
               <div className="w-px h-4 bg-border"></div>
               <Button variant={language === 'en' ? 'secondary' : 'ghost'} size="sm" className={`rounded-full px-3 py-1 h-auto text-xs`} onClick={() => setLanguage('en')}>{t.lang2}</Button>
           </div>
           <Button variant="ghost" size="icon">
                <Search className="h-5 w-5" />
           </Button>
          <Button asChild className="hidden xl:inline-flex">
            <Link href="/login">{t.portal}</Link>
          </Button>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="xl:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="flex flex-col gap-6 pt-10">
                <Link href="/" className="flex items-center gap-2 font-bold text-xl">
                  <Image src="/logo.png" alt="Maes Y Morfa logo" width={28} height={28} className="h-7 w-7" />
                  <span>Maes Y Morfa</span>
                </Link>
                <nav className="flex flex-col gap-4">
                {navLinks.map((link) => (
                  <Link key={link.href} href={link.href} className="text-lg font-medium text-foreground/80 transition-colors hover:text-foreground">
                    {link.label}
                  </Link>
                ))}
                </nav>
                 <div className="flex flex-col gap-2 mt-4">
                     <Button asChild>
                        <Link href="/login">{t.portal}</Link>
                    </Button>
                 </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
