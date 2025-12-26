"use client";

import * as React from 'react';
import { Facebook, Instagram, Menu, Search, X, Youtube } from 'lucide-react';
import Logo from '@/components/icons/logo';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/context/language-context';
import { translations } from '@/lib/translations';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Globe } from 'lucide-react';

export default function Header() {
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [aboutOpen, setAboutOpen] = React.useState(false);
  const [eventsOpen, setEventsOpen] = React.useState(false);
  const [repertoireOpen, setRepertoireOpen] = React.useState(false);
  const { language, setLanguage } = useLanguage();
  const t = translations[language].header;

  const navLinks = t.navLinks;
  const socialLinks = [
    { name: 'Facebook', href: 'https://www.facebook.com/nmvsica', icon: Facebook },
    { name: 'Instagram', href: 'https://www.instagram.com/novamvsica', icon: Instagram },
    { name: 'YouTube', href: 'https://www.youtube.com/user/novamvsica', icon: Youtube },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-neutral-900 text-white backdrop-blur supports-[backdrop-filter]:bg-neutral-900/90">
        <div className="container flex h-24 max-w-7xl items-center">
          <a
            href="#home"
            className="mr-6 flex items-center space-x-2 group"
            aria-label="Ir al inicio"
          >
            <Logo className="h-[6.1rem] w-auto transition-transform duration-200 group-hover:scale-105 group-hover:drop-shadow-[0_0_12px_rgba(196,168,80,0.45)]" />
          </a>

          <div className="flex flex-1 items-center justify-end space-x-6">
            <nav className="hidden md:flex md:items-center md:gap-6 text-base font-medium">
              {navLinks.map((link) =>
                link.href === '#about' ? (
                  <DropdownMenu
                    key={link.name}
                    open={aboutOpen}
                    onOpenChange={setAboutOpen}
                  >
                    <div
                      onMouseEnter={() => setAboutOpen(true)}
                      onMouseLeave={() => setAboutOpen(false)}
                      className="relative"
                    >
                      <DropdownMenuTrigger asChild>
                        <button className="transition-colors hover:text-[hsl(46,45%,54%)] focus:outline-none">
                          {link.name}
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="start"
                        onMouseEnter={() => setAboutOpen(true)}
                        onMouseLeave={() => setAboutOpen(false)}
                      >
                        <DropdownMenuItem asChild>
                          <a href="#about" className="w-full">{t.aboutSub.overview}</a>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <a href="#team" className="w-full">{t.aboutSub.team}</a>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </div>
                  </DropdownMenu>
                ) : link.href === '#events' ? (
                  <DropdownMenu
                    key={link.name}
                    open={eventsOpen}
                    onOpenChange={setEventsOpen}
                  >
                    <div
                      onMouseEnter={() => setEventsOpen(true)}
                      onMouseLeave={() => setEventsOpen(false)}
                      className="relative"
                    >
                      <DropdownMenuTrigger asChild>
                        <button className="transition-colors hover:text-[hsl(46,45%,54%)] focus:outline-none">
                          {link.name}
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="start"
                        onMouseEnter={() => setEventsOpen(true)}
                        onMouseLeave={() => setEventsOpen(false)}
                      >
                        <DropdownMenuItem asChild>
                          <a href="#events" className="w-full">{t.eventsSub.upcoming}</a>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <a href="#events-past" className="w-full">{t.eventsSub.past}</a>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </div>
                  </DropdownMenu>
                ) : link.href === '#repertoire' ? (
                  <DropdownMenu
                    key={link.name}
                    open={repertoireOpen}
                    onOpenChange={setRepertoireOpen}
                  >
                    <div
                      onMouseEnter={() => setRepertoireOpen(true)}
                      onMouseLeave={() => setRepertoireOpen(false)}
                      className="relative"
                    >
                      <DropdownMenuTrigger asChild>
                        <button className="transition-colors hover:text-[hsl(46,45%,54%)] focus:outline-none">
                          {link.name}
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="start"
                        onMouseEnter={() => setRepertoireOpen(true)}
                        onMouseLeave={() => setRepertoireOpen(false)}
                      >
                        <DropdownMenuItem asChild>
                          <a href="#repertoire-religious" className="w-full">{t.repertoireSub.religious}</a>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <a href="#repertoire-secular" className="w-full">{t.repertoireSub.secular}</a>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <a href="#repertoire-christmas" className="w-full">{t.repertoireSub.christmas}</a>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </div>
                  </DropdownMenu>
                ) : (
                  <a
                    key={link.name}
                    href={link.href}
                    className="transition-colors hover:text-[hsl(46,45%,54%)]"
                  >
                    {link.name}
                  </a>
                )
              )}
            </nav>

            <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              aria-label={t.openSearch}
              onClick={() => setIsSearchOpen(true)}
              className="group hover:bg-transparent focus-visible:ring-0 active:bg-transparent"
            >
              <Search className="h-5 w-5 text-white transition-colors group-hover:text-[hsl(46,45%,54%)]" />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={t.changeLanguage}
                  className="group hover:bg-transparent focus-visible:ring-0 active:bg-transparent"
                >
                  <Globe className="h-5 w-5 text-white transition-colors group-hover:text-[hsl(46,45%,54%)]" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setLanguage('en')}>
                  English
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLanguage('es')}>
                  Español
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="hidden md:flex items-center space-x-3 pl-2">
              {socialLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={link.name}
                  className="text-white hover:text-[hsl(46,45%,54%)] transition-colors"
                >
                  <link.icon className="h-[18px] w-[18px]" aria-hidden="true" />
                </a>
              ))}
            </div>

            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden" aria-label={t.openMenu}>
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[400px] bg-neutral-900 text-white">
                <nav className="flex flex-col gap-6 text-lg font-medium mt-10">
                   <a
                     href="#home"
                     className="mb-4 flex items-center space-x-2 group"
                     onClick={() => setIsMobileMenuOpen(false)}
                     aria-label="Ir al inicio"
                   >
                      <Logo className="h-[6.1rem] w-auto transition-transform duration-200 group-hover:scale-105 group-hover:drop-shadow-[0_0_12px_rgba(196,168,80,0.45)]" />
                    </a>
                  {navLinks.map((link) => (
                    link.href === '#about' ? (
                      <div key={link.name} className="flex flex-col gap-3">
                        <span className="text-lg">{link.name}</span>
                        <a
                          href="#about"
                          className="transition-colors hover:text-[hsl(46,45%,54%)] pl-3 text-base"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {t.aboutSub.overview}
                        </a>
                        <a
                          href="#team"
                          className="transition-colors hover:text-[hsl(46,45%,54%)] pl-3 text-base"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {t.aboutSub.team}
                        </a>
                      </div>
                    ) : link.href === '#events' ? (
                      <div key={link.name} className="flex flex-col gap-3">
                        <span className="text-lg">{link.name}</span>
                        <a
                          href="#events"
                          className="transition-colors hover:text-[hsl(46,45%,54%)] pl-3 text-base"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {t.eventsSub.upcoming}
                        </a>
                        <a
                          href="#events-past"
                          className="transition-colors hover:text-[hsl(46,45%,54%)] pl-3 text-base"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {t.eventsSub.past}
                        </a>
                      </div>
                    ) : link.href === '#repertoire' ? (
                      <div key={link.name} className="flex flex-col gap-3">
                        <span className="text-lg">{link.name}</span>
                        <a
                          href="#repertoire-religious"
                          className="transition-colors hover:text-[hsl(46,45%,54%)] pl-3 text-base"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {t.repertoireSub.religious}
                        </a>
                        <a
                          href="#repertoire-secular"
                          className="transition-colors hover:text-[hsl(46,45%,54%)] pl-3 text-base"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {t.repertoireSub.secular}
                        </a>
                        <a
                          href="#repertoire-christmas"
                          className="transition-colors hover:text-[hsl(46,45%,54%)] pl-3 text-base"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {t.repertoireSub.christmas}
                        </a>
                      </div>
                    ) : (
                      <a
                        key={link.name}
                        href={link.href}
                        className="transition-colors hover:text-[hsl(46,45%,54%)]"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {link.name}
                      </a>
                    )
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
            </div>
          </div>
        </div>
      </header>
      
      <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <DialogContent className="sm:max-w-[425px] bg-background">
          <DialogHeader>
            <DialogTitle className="font-headline">{t.search.title}</DialogTitle>
            <DialogDescription>
              {t.search.description}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input
              id="search"
              placeholder={t.search.placeholder}
              className="col-span-3"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

