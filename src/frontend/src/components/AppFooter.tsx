import { SiCaffeine } from 'react-icons/si';

export default function AppFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex flex-col items-center justify-center gap-2 py-6 text-center text-sm text-muted-foreground">
        <p className="flex items-center gap-1.5">
          © {currentYear}. Built with love using{' '}
          <a
            href="https://caffeine.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-medium text-foreground hover:underline"
          >
            <SiCaffeine className="h-4 w-4" />
            caffeine.ai
          </a>
        </p>
      </div>
    </footer>
  );
}
