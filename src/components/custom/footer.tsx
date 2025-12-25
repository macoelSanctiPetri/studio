import Logo from '@/components/icons/logo';
import { useLanguage } from '@/context/language-context';
import { translations } from '@/lib/translations';

export default function Footer() {
    const { language } = useLanguage();
    const t = translations[language].footer;

    return (
        <footer className="bg-background" aria-labelledby="footer-heading">
            <h2 id="footer-heading" className="sr-only">
                {t.srHeading}
            </h2>
            <div className="container mx-auto max-w-7xl px-6 pb-8 pt-16 sm:pt-24 lg:px-8 lg:pt-32">
                <div className="flex flex-col items-center">
                    <div className="flex items-center space-x-3">
                        <Logo className="h-10 w-auto text-secondary" />
                        <span className="font-headline text-xl font-bold text-foreground">
                            NovaMvsica
                        </span>
                    </div>
                    <nav className="mt-8 flex gap-x-6" aria-label="Footer">
                        {t.nav.map((item) => (
                            <a key={item.name} href={item.href} className="text-sm leading-6 text-secondary-foreground hover:text-foreground font-headline">
                                {item.name}
                            </a>
                        ))}
                    </nav>
                </div>
                <div className="mt-16 border-t border-gray-900/10 pt-8 sm:mt-20 lg:mt-24">
                    <p className="text-center text-xs leading-5 text-gray-500 font-body">
                        &copy; {new Date().getFullYear()} NovaMvsica. {t.copy}
                    </p>
                </div>
            </div>
        </footer>
    );
}
