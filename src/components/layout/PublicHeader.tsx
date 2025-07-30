
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetClose, SheetTitle } from '@/components/ui/sheet';
import { Menu, Home, Info, Newspaper, School, Briefcase, Mail, X, LayoutDashboard, Gamepad2, UserCog } from 'lucide-react';
import { useLanguage } from '@/app/(public)/LanguageProvider';
import Image from 'next/image';
import { useState, useEffect } from 'react';

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
        kidsCorner: { href: '/kids-corner', label: "Kids' Corner", icon: Gamepad2 },
        portal: 'Parent Portal',
        staffLogin: 'Staff Login',
        dashboard: 'Return to Dashboard',
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
        kidsCorner: { href: '/kids-corner', label: "Cornel y Plant", icon: Gamepad2 },
        portal: 'Porth Rieni',
        staffLogin: 'Mewngofnodi Staff',
        dashboard: 'Yn ôl i\'r Dangosfwrdd',
        lang1: 'Cymraeg',
        lang2: 'English',
        menu: 'Bwydlen',
    }
}

export function PublicHeader() {
  const { language, setLanguage } = useLanguage();
  const t = content[language];
  const navLinks = t.nav;
  const [isParent, setIsParent] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const authStatus = localStorage.getItem('isAuthenticated') === 'true' && localStorage.getItem('userRole') === 'parent';
    setIsParent(authStatus);
  }, []);


  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-20 max-w-7xl items-center justify-between px-8">
        <div className="flex items-center gap-x-8">
            <Link href="/" className="flex items-center gap-2 font-bold shrink-0">
              <Image src="/logo-header.png" alt="Maes Y Morfa logo" width={1640} height={403} className="h-14 w-auto max-h-14" />
            </Link>
        </div>

        <div className="flex items-center gap-4">
           <div className="hidden sm:flex items-center gap-1 border rounded-full p-1 text-sm bg-background">
               <Button variant={language === 'cy' ? 'default' : 'ghost'} size="sm" className={`rounded-full px-3 py-1 h-auto text-xs ${language === 'cy' ? 'bg-accent hover:bg-accent/80 text-accent-foreground' : ''}`} onClick={() => setLanguage('cy')}>{t.lang1}</Button>
               <div className="w-px h-4 bg-border"></div>
               <Button variant={language === 'en' ? 'default' : 'ghost'} size="sm" className={`rounded-full px-3 py-1 h-auto text-xs ${language === 'en' ? 'bg-accent hover:bg-accent/80 text-accent-foreground' : ''}`} onClick={() => setLanguage('en')}>{t.lang2}</Button>
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
            <SheetContent side="right" className="w-[22rem] bg-background p-0 text-foreground" closeIcon={false}>
              <div className="flex h-full flex-col">
                <div className="flex h-20 items-center justify-between border-b border-border/40 px-6">
                    <Link href="/" className="flex items-center gap-3">
                        <Image src="/logo-header.png" alt="Maes Y Morfa logo" width={1640} height={403} className="h-14 w-auto max-h-14" />
                    </Link>
                    <SheetClose asChild>
                        <Button variant="ghost" size="icon" className='h-9 w-9'>
                            <X className="h-5 w-5 text-muted-foreground" />
                            <span className="sr-only">Close</span>
                        </Button>
                    </SheetClose>
                </div>
                 <div className="flex flex-1 flex-col gap-2 p-6">
                   <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                    {navLinks.map((link) => {
                        const Icon = link.icon;
                        return (
                            <SheetClose asChild key={link.href}>
                                <Link href={link.href} className="flex items-center gap-4 rounded-lg p-3 text-lg font-medium text-foreground/80 transition-colors hover:bg-accent hover:text-accent-foreground">
                                    <Icon className="h-6 w-6 text-primary" />
                                    <span>{link.label}</span>
                                </Link>
                            </SheetClose>
                        )
                    })}
                 </div>
                 <div className="space-y-2 border-t border-border/40 p-6">
                     <SheetClose asChild>
                        <Button asChild className="w-full text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                           <Link href={t.kidsCorner.href}>
                                <t.kidsCorner.icon className="mr-2 h-4 w-4" />
                                {t.kidsCorner.label}
                           </Link>
                        </Button>
                    </SheetClose>
                     <SheetClose asChild>
                         {isClient && isParent ? (
                             <Button asChild className="w-full">
                                <Link href="/dashboard"> <LayoutDashboard className="mr-2 h-4 w-4" /> {t.dashboard}</Link>
                             </Button>
                         ) : (
                             <Button asChild className="w-full">
                                <Link href="/login">{t.portal}</Link>
                             </Button>
                         )}
                     </SheetClose>
                    <SheetClose asChild>
                        <Button asChild variant="outline" className="w-full">
                            <Link href="/staff/login">{t.staffLogin}</Link>
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
