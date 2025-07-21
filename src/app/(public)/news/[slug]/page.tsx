'use client';

import { useLanguage } from "@/app/(public)/LanguageProvider";
import { Badge } from "@/components/ui/badge";
import { news as mockNews, NewsPost } from "@/lib/mockNews";
import { ArrowLeft, Calendar, Download, Tag } from "lucide-react";
import { notFound } from "next/navigation";
import Image from 'next/image';
import Link from "next/link";
import { Button } from "@/components/ui/button";

const content = {
    en: {
        back: 'Back to News',
        attachments: 'Attachments',
        categories: {
            Urgent: 'Urgent',
            Event: 'Event',
            General: 'General',
        }
    },
    cy: {
        back: 'Yn ôl i Newyddion',
        attachments: 'Atodiadau',
        categories: {
            Urgent: 'Pwysig',
            Event: 'Digwyddiad',
            General: 'Cyffredinol',
        }
    }
}

export default function NewsArticlePage({ params }: { params: { slug: string }}) {
    const { language } = useLanguage();
    const t = content[language];
    const post = mockNews.find(p => p.slug === params.slug && p.published) as NewsPost | undefined;

    if (!post) {
        notFound();
    }
    
    const getCategoryVariant = (category: 'Urgent' | 'Event' | 'General'): 'destructive' | 'secondary' | 'outline' => {
        switch (category) {
            case 'Urgent': return 'destructive';
            case 'Event': return 'secondary';
            default: return 'outline';
        }
    }

    return (
        <div className="bg-background">
            <article className="w-full py-16 md:py-24">
                <div className="container mx-auto max-w-4xl px-8">
                    <div className="mb-8">
                         <Link href="/news" className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
                            <ArrowLeft className="mr-2 h-4 w-4" /> {t.back}
                         </Link>
                    </div>

                    <header className="mb-8">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                <span>{new Date(post.date).toLocaleDateString(language === 'cy' ? 'cy-GB' : 'en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Tag className="h-4 w-4" />
                                <Badge variant={getCategoryVariant(post.category)}>
                                    {t.categories[post.category]}
                                </Badge>
                            </div>
                        </div>
                        <h1 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tighter text-foreground">
                            {post[`title_${language}`]}
                        </h1>
                    </header>
                    
                    <div className="prose prose-lg max-w-none text-foreground/90 prose-headings:font-headline prose-headings:text-foreground prose-a:text-primary hover:prose-a:underline">
                        {/* Using dangerouslySetInnerHTML for mock data with HTML. Replace with a safer markdown renderer for real data. */}
                        <div dangerouslySetInnerHTML={{ __html: post[`body_${language}`] }} />
                    </div>

                    {post.attachments && post.attachments.length > 0 && (
                        <div className="mt-12">
                            <h2 className="font-headline text-2xl font-bold mb-4">{t.attachments}</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {post.attachments.map((att, index) => (
                                    <div key={index}>
                                        {att.type === 'image' && (
                                             <Image src={att.url} alt={`Attachment ${index+1}`} width={600} height={400} className="rounded-lg object-cover w-full h-auto" />
                                        )}
                                        {att.type === 'pdf' && (
                                            <a href={att.url} target="_blank" rel="noopener noreferrer" className="block p-4 border rounded-lg hover:bg-secondary transition-colors">
                                                <div className="flex items-center gap-4">
                                                    <Download className="h-8 w-8 text-primary" />
                                                    <div>
                                                        <p className="font-semibold">{att.name}</p>
                                                        <p className="text-sm text-muted-foreground">PDF Document</p>
                                                    </div>
                                                </div>
                                            </a>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                </div>
            </article>
        </div>
    )
}
