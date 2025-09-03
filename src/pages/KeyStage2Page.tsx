import { useLanguage } from '@/contexts/LanguageProvider';

const content = {
  en: { title: "Key Stage 2", description: "Key Stage 2 curriculum and learning objectives." },
  cy: { title: "Cyfnod Allweddol 2", description: "Cwricwlwm a nodau dysgu Cyfnod Allweddol 2." }
};

export default function KeyStage2Page() {
  const { language } = useLanguage();
  const t = content[language];
  
  return (
    <div className="container mx-auto px-8 py-16">
      <h1 className="text-4xl font-bold mb-8">{t.title}</h1>
      <p className="text-lg">{t.description}</p>
    </div>
  );
}
