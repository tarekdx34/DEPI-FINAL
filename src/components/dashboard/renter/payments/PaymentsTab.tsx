// src/components/dashboard/renter/payments/PaymentsTab.tsx
import { useState, useEffect } from "react";
import { Card } from "../../../ui/card";
import { Button } from "../../../ui/button";
import { Badge } from "../../../ui/badge";
import { EmptyState } from "../../shared/components/EmptyState";
import api, { TransactionResponse } from "../../../../../api";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../ui/table";
import { Receipt, Loader2, CreditCard, Download } from "lucide-react";
import { toast } from "sonner";

interface PaymentsTabProps {
  onNavigate: (page: string, id?: string) => void;
}

export function PaymentsTab({ onNavigate }: PaymentsTabProps) {
  const [payments, setPayments] = useState<TransactionResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const data = await api.getPaymentHistory();
      setPayments(data);
    } catch (err) {
      toast.error('Failed to load payment history');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      completed: "bg-green-50 text-green-700 border-green-200",
      pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
      failed: "bg-red-50 text-red-700 border-red-200",
      refunded: "bg-blue-50 text-blue-700 border-blue-200"
    };

    return (
      <Badge variant="outline" className={styles[status as keyof typeof styles] || ""}>
        {status}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#00BFA6] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Payment History */}
      <div>
        <h2 className="text-2xl font-semibold text-[#2B2B2B] mb-4">
          Payment History
        </h2>
        
        {payments.length > 0 ? (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Property</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.transactionId}>
                    <TableCell>{formatDate(payment.createdAt)}</TableCell>
                    <TableCell className="font-medium max-w-xs truncate">
                      {payment.propertyTitle || 'N/A'}
                    </TableCell>
                    <TableCell className="text-[#00BFA6] font-mono text-sm">
                      {payment.transactionReference}
                    </TableCell>
                    <TableCell className="capitalize">
                      {payment.paymentMethod}
                    </TableCell>
                    <TableCell className="font-semibold">
                      {payment.amount.toLocaleString()} {payment.currency}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(payment.status)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="gap-1">
                        <Download className="w-4 h-4" />
                        Receipt
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        ) : (
          <EmptyState
            icon={Receipt}
            title="No payment history"
            description="Your completed transactions will appear here"
          />
        )}
      </div>

      {/* Payment Methods */}
      <div>
        <h2 className="text-2xl font-semibold text-[#2B2B2B] mb-4">
          Payment Methods
        </h2>
        
        <Card className="p-6 max-w-2xl">
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Manage your saved payment methods for faster checkout
            </p>
            
            <div className="border rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="font-medium">No saved payment methods</p>
                  <p className="text-sm text-gray-600">Add a payment method to save time on your next booking</p>
                </div>
              </div>
            </div>
            
            <Button variant="outline" className="mt-4">
              + Add Payment Method
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}