import { School } from 'lucide-react';
import Link from 'next/link';

export function PublicFooter() {
  return (
    <footer className="border-t bg-secondary">
      <div className="container mx-auto max-w-7xl px-4 py-8 md:py-12">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <Link href="/" className="flex items-center gap-2">
            <School className="h-6 w-6 text-primary" />
            <span className="font-bold">MorfaConnect</span>
          </Link>
          <p className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} Maes Y Morfa. All Rights Reserved.
          </p>
          <nav className="flex gap-4">
            <Link href="#" className="text-sm hover:underline">Privacy Policy</Link>
            <Link href="#" className="text-sm hover:underline">Terms of Service</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
