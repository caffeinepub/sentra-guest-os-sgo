import { useState } from 'react';
import { useGenerateInviteToken, useGetAllInviteTokens } from '../../hooks/useHotelInvites';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Plus, Copy, CheckCircle2, XCircle, Link as LinkIcon, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { getErrorMessage } from '../../utils/getErrorMessage';

export default function AdminHotelInvitePanel() {
  const { data: tokens, isLoading, isFetching, error, refetch } = useGetAllInviteTokens();
  const generateToken = useGenerateInviteToken();
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const handleGenerateToken = async () => {
    try {
      const newToken = await generateToken.mutateAsync();
      toast.success('New invite token generated successfully');
      // Trigger a background refetch to sync with backend
      refetch();
    } catch (error) {
      console.error('Failed to generate token:', error);
      const errorMessage = getErrorMessage(error);
      toast.error(`Failed to generate invite token: ${errorMessage}`);
    }
  };

  const handleCopyToken = (token: string) => {
    navigator.clipboard.writeText(token);
    setCopiedToken(token);
    toast.success('Token copied to clipboard');
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const handleCopyInviteLink = (token: string) => {
    const inviteUrl = `${window.location.origin}/hotel?token=${encodeURIComponent(token)}`;
    navigator.clipboard.writeText(inviteUrl);
    toast.success('Invite link copied to clipboard');
  };

  // Show initial loading state only when no data exists yet
  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  // Show error state but keep previous data visible if available
  const hasError = error && !tokens;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
              Hotel Invite Management
              {isFetching && !isLoading && (
                <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </CardTitle>
            <CardDescription className="text-sm">
              Generate and manage invite tokens for hotel registration
            </CardDescription>
          </div>
          <Button
            onClick={handleGenerateToken}
            disabled={generateToken.isPending}
            size="sm"
          >
            {generateToken.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Generate Token
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {hasError ? (
          <div className="text-center py-8 space-y-4">
            <p className="text-sm text-destructive">
              Failed to load invite tokens: {getErrorMessage(error)}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </div>
        ) : !tokens || tokens.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">No invite tokens generated yet</p>
            <p className="text-xs mt-1">Click "Generate Token" to create your first invite</p>
          </div>
        ) : (
          <ScrollArea className="w-full">
            <div className="min-w-[600px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40%]">Token</TableHead>
                    <TableHead className="w-[20%]">Status</TableHead>
                    <TableHead className="w-[40%]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tokens.map((tokenData) => (
                    <TableRow key={tokenData.token}>
                      <TableCell className="font-mono text-xs break-all">
                        {tokenData.token}
                      </TableCell>
                      <TableCell>
                        {tokenData.isConsumed ? (
                          <Badge variant="secondary" className="gap-1">
                            <XCircle className="h-3 w-3" />
                            Used
                          </Badge>
                        ) : (
                          <Badge variant="default" className="gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Available
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCopyToken(tokenData.token)}
                            disabled={tokenData.isConsumed}
                          >
                            {copiedToken === tokenData.token ? (
                              <>
                                <CheckCircle2 className="mr-1 h-3 w-3" />
                                Copied
                              </>
                            ) : (
                              <>
                                <Copy className="mr-1 h-3 w-3" />
                                Copy Token
                              </>
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCopyInviteLink(tokenData.token)}
                            disabled={tokenData.isConsumed}
                          >
                            <LinkIcon className="mr-1 h-3 w-3" />
                            Copy Link
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
