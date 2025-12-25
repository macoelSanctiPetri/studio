import { Button } from '@/components/ui/button';
import { Music } from 'lucide-react';

export default function AnnouncementBar() {
  return (
    <div className="bg-accent text-accent-foreground">
      <div className="container mx-auto max-w-7xl px-6 py-3 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
          <p className="text-sm leading-6 font-semibold flex items-center gap-2">
            <Music className="h-5 w-5 flex-none" aria-hidden="true" />
            <strong className="font-headline">Upcoming Concert:</strong>
            <span className="hidden sm:inline">A Night of Requiems. Don&apos;t miss out.</span>
          </p>
          <Button
            variant="default"
            className="rounded-none bg-primary text-primary-foreground hover:bg-primary/80 flex-none px-6 py-2 text-sm shadow-sm"
          >
            Get Tickets
          </Button>
        </div>
      </div>
    </div>
  );
}
