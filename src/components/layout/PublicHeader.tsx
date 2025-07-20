import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, School, Search } from 'lucide-react';

export function PublicHeader() {
  const navLinks = [
    { href: '#solutions', label: 'Solutions' },
    { href: '#who-we-help', label: 'Who we help' },
    { href: '#resources', label: 'Resources' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-20 max-w-7xl items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold">
          <School className="h-7 w-7 text-primary" />
          <span className="text-xl font-extrabold tracking-tight">Juniper</span>
        </Link>

        <nav className="hidden md:flex md:items-center md:gap-8 text-base font-medium">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="text-foreground/80 transition-colors hover:text-foreground">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
           <Button variant="ghost" size="icon">
                <Search className="h-5 w-5" />
           </Button>
          <Button asChild className="hidden sm:inline-flex">
            <Link href="/login">Parent Portal</Link>
          </Button>
           <Button variant="outline" className="hidden sm:inline-flex">
            <Link href="#">Contact Sales</Link>
          </Button>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="flex flex-col gap-6 pt-10">
                <Link href="/" className="flex items-center gap-2 font-bold text-xl">
                  <School className="h-7 w-7 text-primary" />
                  <span>Juniper</span>
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
                        <Link href="/login">Parent Portal</Link>
                    </Button>
                    <Button variant="outline">
                        <Link href="#">Contact Sales</Link>
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
