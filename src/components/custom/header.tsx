"use client";

import * as React from 'react';
import { Facebook, Instagram, Menu, Search, X, Youtube, KeyRound, LogOut } from 'lucide-react';
import Logo from '@/components/icons/logo';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/context/language-context';
import { translations } from '@/lib/translations';
import { buildSearchEntries, matchEntries } from '@/lib/search-index';
import { loadTeamData, TeamMember } from '@/lib/team-data';
import { loadRepertoire, RepertoireWork } from '@/lib/repertoire-loader';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Globe } from 'lucide-react';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [aboutOpen, setAboutOpen] = React.useState(false);
  const [eventsOpen, setEventsOpen] = React.useState(false);
  const [mediaOpen, setMediaOpen] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [authOpen, setAuthOpen] = React.useState(false);
  const [authSecret, setAuthSecret] = React.useState('');
  const [authError, setAuthError] = React.useState('');
  const [authLoading, setAuthLoading] = React.useState(false);
  const [isAuthed, setIsAuthed] = React.useState(false);
  const [nextConcert, setNextConcert] = React.useState<{ id: string; titulo: string; fecha: string; lugar: string } | null>(null);
  const [query, setQuery] = React.useState('');
  const { language, setLanguage } = useLanguage();
  const t = translations[language].header;

  const navLinks = t.navLinks;
  const [searchEntries, setSearchEntries] = React.useState(() => buildSearchEntries(language));

  React.useEffect(() => {
    // base entries por idioma
    setSearchEntries(buildSearchEntries(language));
    // añadir componentes desde el CSV si están disponibles
    loadTeamData().then((team: TeamMember[]) => {
      if (!team || team.length === 0) return;
      setSearchEntries((prev) => [
        ...prev,
        ...team.map((member, idx) => ({
          id: `team-${idx}`,
          title: member.name ?? '',
          summary: member.role ?? '',
          href: '#team',
          kind: 'section' as const,
        })),
      ]);
    });
    // añadir obras del repertorio (CSV o fallback estático)
    loadRepertoire().then((works: RepertoireWork[]) => {
      if (!works || works.length === 0) return;
      setSearchEntries((prev) => [
        ...prev,
        ...works.map((work) => ({
          id: `rep-${work.id}`,
          title: work.title ?? '',
          summary: [work.composer, work.voices].filter(Boolean).join(' · '),
          href:
            work.type === 'christmas'
              ? '#repertoire-christmas'
              : work.type === 'secular'
                ? '#repertoire-secular'
                : '#repertoire-religious',
          kind: 'media' as const,
        })),
      ]);
    });
  }, [language]);

  React.useEffect(() => {
    const checkAuth = () => {
      fetch('/api/auth/status', { cache: 'no-store' })
        .then((r) => (r.ok ? r.json() : { ok: false }))
        .then((d) => setIsAuthed(Boolean(d.ok)))
        .catch(() => setIsAuthed(false));
    };
    checkAuth();
    const listener = () => checkAuth();
    window.addEventListener('nm-auth-change', listener);
    return () => window.removeEventListener('nm-auth-change', listener);
  }, []);

  React.useEffect(() => {
    fetch('/api/actuaciones', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : { rows: [] }))
      .then((payload) => {
        type UpcomingActuacion = {
          id?: string;
          estado?: string;
          fecha?: string;
          titulo?: string;
          lugar?: string;
        };
        const rows: UpcomingActuacion[] = Array.isArray(payload?.rows) ? payload.rows : [];
        const now = Date.now();
        const upcoming = rows
          .filter((a) => a.estado === 'Proxima' && typeof a.fecha === 'string')
          .filter((a) => new Date(a.fecha as string).getTime() >= now)
          .sort(
            (a, b) =>
              new Date(a.fecha as string).getTime() - new Date(b.fecha as string).getTime(),
          );
        if (upcoming.length === 0) {
          setNextConcert(null);
          return;
        }
        setNextConcert({
          id: upcoming[0].id ?? '',
          titulo: upcoming[0].titulo ?? '',
          fecha: upcoming[0].fecha,
          lugar: upcoming[0].lugar ?? '',
        });
      })
      .catch(() => setNextConcert(null));
  }, []);

  const filteredResults = React.useMemo(() => matchEntries(searchEntries, query), [query, searchEntries]);
  const bannerDate = React.useMemo(() => {
    if (!nextConcert?.fecha) return '';
    return new Intl.DateTimeFormat(language === 'es' ? 'es-ES' : 'en-GB', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(nextConcert.fecha));
  }, [nextConcert, language]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (filteredResults.length > 0) {
      window.location.hash = filteredResults[0].href;
      setSearchOpen(false);
      setQuery('');
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret: authSecret }),
    });
    setAuthLoading(false);
    if (res.ok) {
      setIsAuthed(true);
      setAuthSecret('');
      setAuthOpen(false);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('nm-auth-change'));
      }
    } else {
      setAuthError('Clave incorrecta');
    }
  };

  const handleLogout = async () => {
    if (!window.confirm('¿Seguro que quieres salir?')) return;
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.warn('No se pudo cerrar sesión en el servidor', err);
    } finally {
      setIsAuthed(false);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('nm-auth-change'));
      }
    }
  };
  const socialLinks = [
    { name: 'Facebook', href: 'https://www.facebook.com/nmvsica', icon: Facebook },
    { name: 'Instagram', href: 'https://www.instagram.com/novamvsica', icon: Instagram },
    { name: 'YouTube', href: 'https://www.youtube.com/@novamvsica9623', icon: Youtube },
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
            <Logo className="h-[5rem] w-auto transition-transform duration-200 group-hover:scale-105 group-hover:drop-shadow-[0_0_12px_rgba(196,168,80,0.45)]" />
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
                        <a
                          href="#about"
                          className="transition-colors hover:text-[hsl(46,45%,54%)] focus:outline-none"
                        >
                          {link.name}
                        </a>
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
                        <DropdownMenuItem asChild>
                          <a href="#photos" className="w-full">{t.aboutSub.photos}</a>
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
                ) : link.href === '#media' ? (
                  <DropdownMenu
                    key={link.name}
                    open={mediaOpen}
                    onOpenChange={setMediaOpen}
                  >
                    <div
                      onMouseEnter={() => setMediaOpen(true)}
                      onMouseLeave={() => setMediaOpen(false)}
                      className="relative"
                    >
                      <DropdownMenuTrigger asChild>
                        <button className="transition-colors hover:text-[hsl(46,45%,54%)] focus:outline-none">
                          {link.name}
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="start"
                        onMouseEnter={() => setMediaOpen(true)}
                        onMouseLeave={() => setMediaOpen(false)}
                      >
                        <DropdownMenuItem asChild>
                          <a href="#photos" className="w-full">{t.multimediaSub.photos}</a>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <a href="#media-videos" className="w-full">{t.multimediaSub.videos}</a>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <a href="#media-audios" className="w-full">{t.multimediaSub.audios}</a>
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
            <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={t.openSearch}
                  className="group hover:bg-transparent focus-visible:ring-0 active:bg-transparent"
                  onClick={() => setSearchOpen(true)}
                >
                  <Search className="h-5 w-5 text-white transition-colors group-hover:text-[hsl(46,45%,54%)]" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] bg-background">
                <DialogHeader>
                  <DialogTitle className="font-headline">{t.search.title}</DialogTitle>
                  <DialogDescription>
                    {t.search.description}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSearchSubmit} className="grid gap-4 py-4">
                  <Input
                    id="search"
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={t.search.placeholder}
                    className="col-span-3"
                    autoFocus
                  />
                  <div className="flex flex-col gap-2 max-h-48 overflow-auto">
                    {filteredResults.length === 0 ? (
                      <p className="text-sm text-muted-foreground">{t.search.description}</p>
                    ) : (
                      filteredResults.map((item) => (
                        <Button
                          key={item.href + item.id}
                          type="button"
                          variant="ghost"
                          className="justify-start flex-col items-start"
                          onClick={() => {
                            window.location.hash = item.href;
                            setSearchOpen(false);
                            setQuery('');
                          }}
                        >
                          <span className="font-medium text-left">{item.title}</span>
                          {item.summary && (
                            <span className="text-xs text-muted-foreground line-clamp-1">
                              {item.summary}
                            </span>
                          )}
                        </Button>
                      ))
                    )}
                  </div>
                </form>
              </DialogContent>
            </Dialog>
            
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
            <div className="flex items-center space-x-2 pl-2">
              {isAuthed ? (
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Salir"
                  className="group hover:bg-transparent focus-visible:ring-0 active:bg-transparent"
                  onClick={handleLogout}
                >
                  <LogOut className="h-5 w-5 text-white transition-colors group-hover:text-[hsl(46,45%,54%)]" />
                </Button>
              ) : (
                <Dialog open={authOpen} onOpenChange={setAuthOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Entrar"
                      className="group hover:bg-transparent focus-visible:ring-0 active:bg-transparent"
                      onClick={() => setAuthOpen(true)}
                    >
                      <KeyRound className="h-5 w-5 text-white transition-colors group-hover:text-[hsl(46,45%,54%)]" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px] bg-background">
                    <DialogHeader>
                      <DialogTitle className="font-headline">Acceso privado</DialogTitle>
                      <DialogDescription>
                        Introduce la clave para activar la zona privada.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleAuthSubmit} className="grid gap-4 py-4">
                      <Input
                        type="password"
                        value={authSecret}
                        onChange={(e) => setAuthSecret(e.target.value)}
                        placeholder="Introduce la clave"
                        className="col-span-3"
                        autoFocus
                        required
                      />
                      {authError && <p className="text-sm text-red-500">{authError}</p>}
                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="ghost" onClick={() => setAuthOpen(false)}>
                          Cancelar
                        </Button>
                        <Button type="submit" disabled={authLoading}>
                          {authLoading ? 'Validando...' : 'Entrar'}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              )}
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
                        <a
                          href="#about"
                          className="text-lg transition-colors hover:text-[hsl(46,45%,54%)]"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {link.name}
                        </a>
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
                    ) : link.href === '#media' ? (
                      <div key={link.name} className="flex flex-col gap-3">
                        <span className="text-lg">{link.name}</span>
                        <a
                          href="#photos"
                          className="transition-colors hover:text-[hsl(46,45%,54%)] pl-3 text-base"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {t.multimediaSub.photos}
                        </a>
                        <a
                          href="#media-videos"
                          className="transition-colors hover:text-[hsl(46,45%,54%)] pl-3 text-base"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {t.multimediaSub.videos}
                        </a>
                        <a
                          href="#media-audios"
                          className="transition-colors hover:text-[hsl(46,45%,54%)] pl-3 text-base"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {t.multimediaSub.audios}
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
        <div className="w-full bg-gradient-to-r from-[#b8860b] via-[#d4af37] to-[#f3d25b] text-[#1f1a0a] border-t border-[#f6df8d]/50">
          <div className="container max-w-7xl px-4 py-2 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs sm:text-sm font-semibold leading-5">
                {nextConcert
                  ? (
                    language === 'es'
                      ? `Próximo concierto: ${nextConcert.titulo} · ${bannerDate} · ${nextConcert.lugar} · Entrada libre hasta completar aforo.`
                      : `Next concert: ${nextConcert.titulo} · ${bannerDate} · ${nextConcert.lugar} · Free entry until full capacity.`
                  )
                  : (language === 'es' ? 'Próximo concierto: información disponible en Eventos. Entrada libre hasta completar aforo.' : 'Next concert: details available in Events. Free entry until full capacity.')}
              </p>
              <a
                href={nextConcert?.id ? `#event-${nextConcert.id}` : '#events'}
                className="text-xs sm:text-sm font-bold underline underline-offset-2 hover:opacity-85 transition-opacity"
              >
                {language === 'es' ? 'Más info' : 'More info'}
              </a>
            </div>
          </div>
        </div>
      </header>
      
      {/* Dialog ya incrustado arriba como controlled component */}
    </>
  );
}

