import Logo from '@/components/icons/logo';

const footerNav = [
    { name: 'About', href: '#about' },
    { name: 'Events', href: '#events' },
    { name: 'Music', href: '#music' },
    { name: 'Contact', href: '#contact' },
];

export default function Footer() {
    return (
        <footer className="bg-white" aria-labelledby="footer-heading">
            <h2 id="footer-heading" className="sr-only">
                Footer
            </h2>
            <div className="container mx-auto max-w-7xl px-6 pb-8 pt-16 sm:pt-24 lg:px-8 lg:pt-32">
                <div className="flex flex-col items-center">
                    <div className="flex items-center space-x-3">
                        <Logo className="h-8 w-8 text-secondary" />
                        <span className="font-headline text-xl font-bold text-gray-900">
                            Sacred Echoes
                        </span>
                    </div>
                    <nav className="mt-8 flex gap-x-6" aria-label="Footer">
                        {footerNav.map((item) => (
                            <a key={item.name} href={item.href} className="text-sm leading-6 text-gray-600 hover:text-gray-900 font-headline">
                                {item.name}
                            </a>
                        ))}
                    </nav>
                </div>
                <div className="mt-16 border-t border-gray-900/10 pt-8 sm:mt-20 lg:mt-24">
                    <p className="text-center text-xs leading-5 text-gray-500 font-body">
                        &copy; {new Date().getFullYear()} Sacred Echoes. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
