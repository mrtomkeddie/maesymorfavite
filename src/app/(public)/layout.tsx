import { PublicHeader } from '@/components/layout/PublicHeader';
import { PublicFooter } from '@/components/layout/PublicFooter';
import { LanguageProvider } from './LanguageProvider';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LanguageProvider>
        <div className="flex min-h-screen flex-col">
          <PublicHeader />
          <main className="flex-1">{children}</main>
          <PublicFooter />
        </div>
    </LanguageProvider>
  );
}
