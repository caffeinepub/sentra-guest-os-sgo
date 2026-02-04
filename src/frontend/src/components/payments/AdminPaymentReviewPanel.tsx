import { useAdminPayments } from '../../hooks/useAdminPayments';
import { PaymentStatus } from '../../backend';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { CheckCircle2, XCircle, Loader2, Shield, AlertCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { getErrorMessage } from '../../utils/getErrorMessage';

export default function AdminPaymentReviewPanel() {
  const { allPayments, confirmPayment, rejectPayment } = useAdminPayments();

  const handleConfirm = async (id: string) => {
    try {
      await confirmPayment.mutateAsync(id);
      toast.success('Payment confirmed successfully');
    } catch (error) {
      console.error('Failed to confirm payment:', error);
      toast.error(`Failed to confirm payment: ${getErrorMessage(error)}`);
    }
  };

  const handleReject = async (id: string) => {
    try {
      await rejectPayment.mutateAsync(id);
      toast.success('Payment rejected');
    } catch (error) {
      console.error('Failed to reject payment:', error);
      toast.error(`Failed to reject payment: ${getErrorMessage(error)}`);
    }
  };

  const getStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.pending:
        return <Badge variant="outline">Pending</Badge>;
      case PaymentStatus.confirmed:
        return <Badge className="bg-green-500/10 text-green-700 dark:text-green-400 hover:bg-green-500/20">Confirmed</Badge>;
      case PaymentStatus.rejected:
        return <Badge variant="destructive">Rejected</Badge>;
    }
  };

  if (allPayments.isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Shield className="h-5 w-5 flex-shrink-0" />
            Payment Review Panel
          </CardTitle>
          <CardDescription className="text-sm">
            Review and manage hotel subscription payments
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (allPayments.error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Shield className="h-5 w-5 flex-shrink-0" />
            Payment Review Panel
          </CardTitle>
          <CardDescription className="text-sm">
            Review and manage hotel subscription payments
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load payments: {getErrorMessage(allPayments.error)}
            </AlertDescription>
          </Alert>
          <Button
            variant="outline"
            size="sm"
            onClick={() => allPayments.refetch()}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  const payments = allPayments.data || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
          <Shield className="h-5 w-5 flex-shrink-0" />
          Payment Review Panel
        </CardTitle>
        <CardDescription className="text-sm">
          Review and manage hotel subscription payments
        </CardDescription>
      </CardHeader>
      <CardContent>
        {payments.length === 0 ? (
          <p className="text-center text-muted-foreground py-8 text-sm">No payment requests found</p>
        ) : (
          <div className="rounded-md border overflow-hidden">
            <ScrollArea className="w-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[120px]">Reference</TableHead>
                    <TableHead className="min-w-[100px]">Method</TableHead>
                    <TableHead className="min-w-[80px]">Amount</TableHead>
                    <TableHead className="min-w-[100px]">Status</TableHead>
                    <TableHead className="text-right min-w-[180px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-mono text-xs sm:text-sm">{payment.reference}</TableCell>
                      <TableCell className="capitalize text-xs sm:text-sm">{payment.option}</TableCell>
                      <TableCell className="text-xs sm:text-sm">${payment.amount.toString()}</TableCell>
                      <TableCell>{getStatusBadge(payment.status)}</TableCell>
                      <TableCell className="text-right">
                        {payment.status === PaymentStatus.pending && (
                          <div className="flex flex-col sm:flex-row justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleConfirm(payment.id)}
                              disabled={confirmPayment.isPending || rejectPayment.isPending}
                              className="gap-1 text-xs sm:text-sm w-full sm:w-auto"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Confirm
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleReject(payment.id)}
                              disabled={confirmPayment.isPending || rejectPayment.isPending}
                              className="gap-1 text-destructive hover:text-destructive text-xs sm:text-sm w-full sm:w-auto"
                            >
                              <XCircle className="h-3.5 w-3.5" />
                              Reject
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
