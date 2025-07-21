'use client';

import { useLanguage } from '@/app/(public)/LanguageProvider';
import { AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import type { UrgentNewsPost } from '@/lib/mockNews';

const content = {
    en: {
        urgent: 'Urgent Announcement',
    },
    cy: {
        urgent: 'Hysbysiad Pwysig',
    }
}

export function UrgentBanner({ post }: { post: UrgentNewsPost }) {
  const { language } = useLanguage();
  const t = content[language];

  return (
    <div className="bg-destructive text-destructive-foreground">
      <div className="container mx-auto max-w-7xl px-8 py-3">
        <div className="flex items-center justify-center gap-4 text-sm md:text-base">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <p className="font-bold">{t.urgent}:</p>
          <Link href={`/news/${post.slug}`} className="flex-grow text-left underline hover:text-destructive-foreground/80">
            {post[`title_${language}`]}
          </Link>
        </div>
      </div>
    </div>
  );
}
