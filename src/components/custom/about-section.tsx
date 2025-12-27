"use client";

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useLanguage } from '@/context/language-context';
import { translations } from '@/lib/translations';
import { loadTeamData, TeamMember } from '@/lib/team-data';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function AboutSection() {
  const { language } = useLanguage();
  const t = translations[language].aboutSection;
  const [team, setTeam] = useState<TeamMember[]>(t.team);
  const [bioOpen, setBioOpen] = useState(false);
  const [selectedName, setSelectedName] = useState<string>('');

  const directorBio = `Natural de Cádiz, comienza sus estudios musicales al tiempo que simultanea los estudios universitarios de Filología Anglo-Germánica.

Obtenida la licenciatura y los estudios correspondientes al Título Profesional de Piano, continúa estudiando Armonía y Contrapunto para marchar posteriormente al Conservatorio Superior de Música de Sevilla "Manuel Castillo" donde recibe clases entre otros, del propio Manuel Castillo, Ignacio Marín y Carlos Baena.

En junio de 2004 terminó los estudios correspondientes al Título Profesional de Oboe.

Como cantor formó parte de varios coros destacando la Coral Universitaria de Cádiz y el Grupo Vocal de Cámara "Romanza". De manera ocasional, ha colaborado también con el "Taller Hispalense de Música Antigua" y el Conjunto Vocal de Cámara "Francisco Guerrero – Virelay".

Entre sus cursos destacan los realizados con profesores como Ramón Coll, J. López Gimeno, Ricardo Rodríguez, Laurentino Sáenz de Buruaga, Martin Schmidt, Octav Calleya o Harry Christophers y The Sixteen.

En el terreno de la dirección coral es director del Coro de Cámara "Nova Mvsica", especializado en la polifonía del renacimiento, desde su fundación en 1991, habiendo dado conciertos por Andalucía, España, Portugal, Austria y Reino Unido así como varias grabaciones.

Durante los años 96 a 98 fue además segundo director de la Coral Polifónica "Canticum Novum" de Cádiz.

Fue profesor durante varios cursos académicos de Lenguaje Musical y piano en la Escuela de Música San José de San Fernando e impartido también para el Centro de Profesores (CEP) de Cádiz varios cursos de iniciación a la dirección coral.

Entre las obras corales con orquesta que ha dirigido destacan el Stabat Mater de Karl Jenkins, junio de 2021, junto al coro de cámara Nova Mvsica, The Maidstone Singers (Kent, Reino Unido) y el ensemble instrumental La Stravaganza, formación de su propia creación, y en 2021 el Gloria de Vivaldi en la catedral de Cádiz.

Desde noviembre de 2024 es director asistente de la Joven Orquesta Filarmónica "Campos Andaluces" (JOFCA) de Jerez.

Actualmente compagina interpretación con composición y dirección.

director@novamvsica.com`;

  useEffect(() => {
    let active = true;
    loadTeamData().then((data) => {
      if (!active) return;
      setTeam(data.length ? data : t.team);
    });
    return () => {
      active = false;
    };
  }, [language, t.team]);

  const imageDescription =
    language === 'es'
      ? 'Portada del disco de Nova Mvsica.'
      : 'Album cover of Nova Mvsica.';

  return (
    <section id="about" className="bg-background py-24 sm:py-32">
      <div className="container mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-x-16 gap-y-16 lg:grid-cols-2">
          <div>
            <div className="w-10 h-0.5 bg-secondary mb-4"></div>
            <h2 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {t.title}
            </h2>
            <p className="mt-6 text-lg leading-8 text-secondary-foreground font-body text-justify">
              {t.p1}
            </p>
            <p className="mt-4 text-lg leading-8 text-secondary-foreground font-body text-justify">
              {t.p2}
            </p>
          </div>

          <div className="w-full max-w-xl justify-self-center lg:max-w-2xl">
            <Image
              src="/portada_disco.png"
              alt={imageDescription}
              width={800}
              height={800}
              className="w-full h-auto object-contain"
              priority
            />
          </div>
        </div>

        <div id="team" className="mt-16">
          <div className="w-10 h-0.5 bg-secondary mb-4"></div>
          <h3 className="font-headline text-2xl font-semibold text-foreground">
            {t.teamTitle}
          </h3>
          <p className="mt-3 text-base leading-7 text-secondary-foreground font-body">
            {t.teamDescription}
          </p>
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {team.map((member: { name: string; role: string; photoUrl?: string; photoAlt?: string }) => (
              <div
                key={`${member.name}-${member.role}`}
                className="group rounded-2xl border border-border/60 bg-neutral-900/60 p-5 shadow-md backdrop-blur"
              >
                <div className="mb-4 flex w-full justify-center">
                  {member.photoUrl ? (
                    <button
                      type="button"
                      onClick={() => {
                        if (member.role.toLowerCase().includes('director')) {
                          setSelectedName(member.name);
                          setBioOpen(true);
                        }
                      }}
                      className={`relative flex h-40 w-40 items-center justify-center overflow-hidden rounded-full border border-border bg-neutral-900 transition-transform duration-200 group-hover:scale-[1.05] focus:outline-none ${
                        member.role.toLowerCase().includes('director')
                          ? 'cursor-pointer focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-background'
                          : 'cursor-default'
                      }`}
                    >
                      {(() => {
                        const photoSrc = member.photoUrl || '/avatars/fallback.png';
                        const isDirector = member.role.toLowerCase().includes('director');
                        const isFallback = photoSrc.toLowerCase().includes('fallback');
                        const isBajoEduardo = photoSrc.toLowerCase().includes('bajo_eduardo');
                        const fit = isFallback ? 'object-contain' : 'object-cover';
                        const objectPosition = isDirector
                          ? '95% 22%'
                          : isBajoEduardo
                            ? '50% 15%'
                            : '50% 50%';
                        const size = isBajoEduardo ? 'h-[9.6rem] w-[9.6rem]' : 'h-[9.2rem] w-[9.2rem]';
                        const displaySrc =
                          isDirector && !photoSrc.includes('?v=dir')
                            ? `${photoSrc}?v=dir-shift2`
                            : photoSrc;
                        return (
                          <>
                            <Image
                              src={displaySrc}
                              alt={member.photoAlt ?? member.name}
                              width={156}
                              height={156}
                              className={`${size} rounded-full ${fit} bg-neutral-800 transition-transform duration-200 group-hover:scale-105`}
                              style={{ objectPosition }}
                            />
                            {isDirector && (
                              <div className="absolute inset-0 flex items-end justify-center rounded-full bg-gradient-to-t from-black/45 via-black/15 to-transparent opacity-0 transition-opacity duration-150 group-hover:opacity-100">
                                <span className="mb-2 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-neutral-900">
                                  Pulsa para ver trayectoria
                                </span>
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </button>
                  ) : (
                    <div className="flex h-36 w-36 items-center justify-center rounded-full border border-border bg-neutral-800 text-sm text-muted-foreground transition-transform duration-200 group-hover:scale-[1.05]">
                      Foto
                    </div>
                  )}
                </div>
                <h4 className="text-lg font-semibold text-foreground text-center">
                  {member.name}
                </h4>
                <p className="mt-1 text-sm text-secondary-foreground text-center">
                  {(() => {
                    const roleLower = member.role.toLowerCase();
                    if (roleLower.includes('director')) return 'Director';
                    if (roleLower.includes('soprano')) return 'Soprano';
                    if (roleLower.includes('contralto') || roleLower.includes('alto')) return 'Contralto';
                    if (roleLower.includes('tenor')) return 'Tenor';
                    if (roleLower.includes('bajo')) return 'Bajo';
                    return member.role;
                  })()}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Dialog open={bioOpen} onOpenChange={setBioOpen}>
        <DialogContent className="max-h-[80vh] overflow-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{selectedName || 'Director'}</DialogTitle>
            <DialogDescription>Trayectoria</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm leading-6 text-secondary-foreground whitespace-pre-line">
            {directorBio}
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
