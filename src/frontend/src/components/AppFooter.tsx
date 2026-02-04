export default function AppFooter() {
  return (
    <footer className="border-t border-border/40 bg-muted/30">
      <div className="container py-8">
        <div className="flex flex-col items-center justify-center gap-4 text-center">
          <p className="text-sm text-muted-foreground">
            © 2026. Develop Sentra Guest Os (SGO)
          </p>
          <a
            href="mailto:sentraguestos.info@gmail.com"
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            sentraguestos.info@gmail.com
          </a>
        </div>
      </div>
    </footer>
  );
}
