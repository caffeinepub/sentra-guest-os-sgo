import { useState } from 'react';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, CheckCircle2, User } from 'lucide-react';
import { toast } from 'sonner';

export default function PrincipalIdPanel() {
  const { identity } = useInternetIdentity();
  const [copied, setCopied] = useState(false);

  if (!identity) {
    return null;
  }

  const principalId = identity.getPrincipal().toString();

  const handleCopy = () => {
    navigator.clipboard.writeText(principalId);
    setCopied(true);
    toast.success('Principal ID copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <User className="h-4 w-4" />
          Your Principal ID
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          Your unique Internet Identity identifier
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="rounded-lg border bg-muted/50 p-3">
          <code className="text-xs break-all font-mono block">
            {principalId}
          </code>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopy}
          className="w-full sm:w-auto"
        >
          {copied ? (
            <>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="mr-2 h-4 w-4" />
              Copy Principal ID
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
