'use client';

import { useLanguage } from '@/app/(public)/LanguageProvider';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { news as mockNews } from '@/lib/mockNews';
import { ArrowRight, Calendar, Tag } from 'lucide-react';
import Link from 'next/link';

const content = {
    en: {
        title: 'News & Announcements',
        description: 'The latest updates, news, and announcements from Maes Y Morfa.',
        readMore: 'Read More',
        categories: {
            Urgent: 'Urgent',
            Event: 'Event',
            General: 'General',
        }
    },
    cy: {
        title: 'Newyddion a Hysbysiadau',
        description: 'Y diweddariadau, newyddion a hysbysiadau diweddaraf o Maes Y Morfa.',
        readMore: 'Darllen Mwy',
        categories: {
            Urgent: 'Pwysig',
            Event: 'Digwyddiad',
            General: 'Cyffredinol',
        }
    }
}

export default function NewsPage() {
    const { language } = useLanguage();
    const t = content[language];
    const publishedNews = mockNews.filter(n => n.published);

    const getCategoryVariant = (category: 'Urgent' | 'Event' | 'General'): 'destructive' | 'secondary' | 'outline' => {
        switch (category) {
            case 'Urgent': return 'destructive';
            case 'Event': return 'secondary';
            default: return 'outline';
        }
    }

    return (
        <div className="bg-background">
            <section className="w-full py-16 md:py-24">
                <div className="container mx-auto max-w-7xl px-8">
                    <div className="text-center mb-12">
                        <h1 className="font-headline text-5xl font-extrabold tracking-tighter text-foreground md:text-7xl">
                            {t.title}
                        </h1>
                        <p className="mt-4 max-w-2xl mx-auto text-lg text-foreground/80">
                           {t.description}
                        </p>
                    </div>

                    <div className="space-y-8">
                        {publishedNews.map(post => (
                            <Card key={post.id} className="hover:shadow-lg transition-shadow">
                                <Link href={`/news/${post.slug}`} className="block">
                                    <CardHeader>
                                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
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
                                        <CardTitle className="text-2xl font-bold text-primary hover:underline">
                                            {post[`title_${language}`]}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-muted-foreground line-clamp-2">
                                            {post[`body_${language}`]}
                                        </p>
                                        <div className="flex items-center text-primary font-semibold mt-4">
                                            {t.readMore} <ArrowRight className="ml-2 h-4 w-4" />
                                        </div>
                                    </CardContent>
                                </Link>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    )
}
