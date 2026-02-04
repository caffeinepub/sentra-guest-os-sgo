import { Heart } from 'lucide-react';
import { useI18n } from '../i18n/I18nProvider';

export default function AppFooter() {
  const { t } = useI18n();
  
  return (
    <footer className="border-t bg-muted/30 mt-auto">
      <div className="container py-6 px-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p className="text-center sm:text-left">
            © 2026. {t('footer.builtWith')}{' '}
            <Heart className="inline h-4 w-4 text-red-500 fill-red-500" />{' '}
            <a
              href="https://caffeine.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </p>
          <p className="text-center sm:text-right">
            <a
              href="mailto:sentraguestos.info@gmail.com"
              className="text-primary hover:underline"
            >
              sentraguestos.info@gmail.com
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
