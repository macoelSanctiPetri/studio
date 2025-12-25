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

const navLinks = [
  { name: 'About', href: '#about' },
  { name: 'Events', href: '#events' },
  { name: 'Music', href: '#music' },
  { name: 'Contact', href: '#contact' },
];

export default function Header() {
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-primary/95 text-primary-foreground backdrop-blur supports-[backdrop-filter]:bg-primary/60">
        <div className="container flex h-16 max-w-7xl items-center">
          <a href="#home" className="mr-6 flex items-center space-x-2">
            <Logo className="h-6 w-6" />
            <span className="hidden font-bold sm:inline-block font-headline">
              Sacred Echoes
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
              aria-label="Open search"
              onClick={() => setIsSearchOpen(true)}
              className="hover:bg-accent/20"
            >
              <Search className="h-5 w-5 text-accent" />
            </Button>
            
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[400px] bg-primary text-primary-foreground">
                <nav className="flex flex-col gap-6 text-lg font-medium mt-10">
                   <a href="#home" className="mb-4 flex items-center space-x-2" onClick={() => setIsMobileMenuOpen(false)}>
                      <Logo className="h-8 w-8" />
                      <span className="font-bold font-headline">
                        Sacred Echoes
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
            <DialogTitle className="font-headline">Search Website</DialogTitle>
            <DialogDescription>
              Find information about events, music, and more.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input
              id="search"
              placeholder="e.g., 'Christmas Concert'"
              className="col-span-3"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
