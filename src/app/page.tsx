"use client";

import Header from '@/components/custom/header';
import HeroSection from '@/components/custom/hero-section';
import AnnouncementBar from '@/components/custom/announcement-bar';
import AboutSection from '@/components/custom/about-section';
import DirectorMessage from '@/components/custom/director-message';
import EventsSection from '@/components/custom/events-section';
import MusicSection from '@/components/custom/music-section';
import SocialPanel from '@/components/custom/social-panel';
import Footer from '@/components/custom/footer';
import { useLanguage } from '@/context/language-context';
import { useEffect } from 'react';

export default function Home() {
  const { language } = useLanguage();
  
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
    }
  }, [language]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <AnnouncementBar />
        <AboutSection />
        <DirectorMessage />
        <EventsSection />
        <MusicSection />
        <SocialPanel />
      </main>
      <Footer />
    </div>
  );
}
