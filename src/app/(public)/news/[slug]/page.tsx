
'use client';

import { useLanguage } from '@/app/(public)/LanguageProvider';
import { news as mockNews } from '@/lib/mockNews';
import { notFound } from 'next/navigation';
import { ArrowLeft, Calendar, Paperclip } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const content = {
    en: {
        back: 'Back to all news',
        urgent: 'Urgent',
        by: 'Posted on',
        attachment: 'Attachment'
    },
    cy: {
        back: 'Yn ôl i\'r holl newyddion',
        urgent: 'Pwysig',
        by: 'Postiwyd ar',
        attachment: 'Atodiad'
    }
}

export default function NewsArticlePage({ params }: { params: { slug: string } }) {
    const { language } = useLanguage();
    const t = content[language];
    const post = mockNews.find(p => p.slug === params.slug);

    if (!post) {
        notFound();
    }
    
    const pageTitle = post[`title_${language}`];
    const pageBody = post[`body_${language}`];
    const postDate = new Date(post.date).toLocaleDateString(language === 'cy' ? 'cy-GB' : 'en-GB', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });


    return (
        <div className="bg-background">
            <section className="w-full py-16 md:py-24">
                <div className="container mx-auto max-w-4xl px-8">
                    <div className="mb-8">
                         <Link href="/news" className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
                            <ArrowLeft className="mr-2 h-4 w-4" /> {t.back}
                         </Link>
                    </div>

                    <article>
                        <header className="mb-8">
                             {post.isUrgent && (
                                <Badge variant="destructive" className="mb-2">
                                    {t.urgent}
                                </Badge>
                            )}
                            <h1 className="font-headline text-4xl font-extrabold tracking-tighter text-foreground md:text-5xl">
                                {pageTitle}
                            </h1>
                            <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                <span>{t.by} {postDate}</span>
                            </div>
                        </header>
                        
                        <div 
                            className="prose prose-lg max-w-none dark:prose-invert text-foreground/90" 
                            dangerouslySetInnerHTML={{ __html: pageBody }}
                        />

                        {post.attachmentUrl && post.attachmentName && (
                            <div className="mt-12 rounded-lg border bg-secondary/30 p-6">
                                <h3 className="font-bold text-lg mb-2 flex items-center gap-2"><Paperclip className="h-5 w-5" />{t.attachment}</h3>
                                <Button asChild>
                                    <a href={post.attachmentUrl} download={post.attachmentName}>
                                        Download {post.attachmentName}
                                    </a>
                                </Button>
                            </div>
                        )}
                    </article>
                </div>
            </section>
        </div>
    )

}
