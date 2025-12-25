"use client";

import * as React from 'react';
import { Menu, Search, X } from 'lucide-react';
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
  const { language, setLanguage } = useLanguage();
  const t = translations[language].header;

  const navLinks = t.navLinks;

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-primary/95 text-primary-foreground backdrop-blur supports-[backdrop-filter]:bg-primary/60">
        <div className="container flex h-16 max-w-7xl items-center">
          <a href="#home" className="mr-6 flex items-center space-x-2">
            <Logo className="h-10 w-auto" />
            <span className="hidden font-bold sm:inline-block font-headline">
              NovaMvsica
            </span>
          </a>

          <nav className="hidden md:flex md:items-center md:gap-6 text-sm font-medium">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="transition-colors hover:text-accent"
              >
                {link.name}
              </a>
            ))}
          </nav>

          <div className="flex flex-1 items-center justify-end space-x-2">
            <Button
              variant="ghost"
              size="icon"
              aria-label={t.openSearch}
              onClick={() => setIsSearchOpen(true)}
              className="hover:bg-accent/20"
            >
              <Search className="h-5 w-5 text-accent" />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label={t.changeLanguage} className="hover:bg-accent/20">
                  <Globe className="h-5 w-5 text-accent" />
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

            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden" aria-label={t.openMenu}>
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[400px] bg-primary text-primary-foreground">
                <nav className="flex flex-col gap-6 text-lg font-medium mt-10">
                   <a href="#home" className="mb-4 flex items-center space-x-2" onClick={() => setIsMobileMenuOpen(false)}>
                      <Logo className="h-10 w-auto" />
                      <span className="font-bold font-headline">
                        NovaMvsica
                      </span>
                    </a>
                  {navLinks.map((link) => (
                    <a
                      key={link.name}
                      href={link.href}
                      className="transition-colors hover:text-accent"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {link.name}
                    </a>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
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
