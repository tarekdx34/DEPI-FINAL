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
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const data = await api.getPaymentHistory();
      setPayments(data);
    } catch (err) {
      toast.error("Failed to load payment history");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const filteredPayments = payments.filter((payment) => {
    if (statusFilter === "all") return true;
    return payment.status === statusFilter;
  });

  const getStatusBadge = (status: string) => {
    const styles = {
      completed: "bg-green-50 text-green-700 border-green-200",
      pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
      failed: "bg-red-50 text-red-700 border-red-200",
      refunded: "bg-blue-50 text-blue-700 border-blue-200",
    };

    return (
      <Badge
        variant="outline"
        className={styles[status as keyof typeof styles] || ""}
      >
        {status}
      </Badge>
    );
  };

  const handleDownloadReceipt = async (payment: TransactionResponse) => {
    try {
      // ✅ FIX: Store toast ID to dismiss it specifically
      const loadingToastId = toast.loading("Generating receipt...");

      // Create HTML receipt
      const receiptHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Ajarly Receipt - ${payment.transactionReference}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 40px auto;
            padding: 20px;
            background: #f5f5f5;
          }
          .receipt {
            background: white;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            border-bottom: 3px solid #00BFA6;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 32px;
            font-weight: bold;
            color: #00BFA6;
            margin-bottom: 10px;
          }
          .title {
            font-size: 24px;
            color: #2B2B2B;
            margin: 10px 0;
          }
          .info-row {
            display: flex;
            justify-content: space-between;
            padding: 12px 0;
            border-bottom: 1px solid #eee;
          }
          .info-label {
            color: #666;
            font-weight: 500;
          }
          .info-value {
            color: #2B2B2B;
            font-weight: 600;
          }
          .amount {
            background: #f0fdf4;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            text-align: center;
          }
          .amount-label {
            color: #666;
            font-size: 14px;
            margin-bottom: 5px;
          }
          .amount-value {
            font-size: 36px;
            color: #00BFA6;
            font-weight: bold;
          }
          .status {
            display: inline-block;
            padding: 6px 16px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
          }
          .status-completed {
            background: #dcfce7;
            color: #166534;
          }
          .status-pending {
            background: #fef3c7;
            color: #92400e;
          }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 2px solid #eee;
            text-align: center;
            color: #666;
            font-size: 14px;
          }
          @media print {
            body {
              background: white;
              margin: 0;
            }
            .receipt {
              box-shadow: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="header">
            <div class="logo">AJARLY</div>
            <div class="title">Payment Receipt</div>
            <p style="color: #666; margin: 5px 0;">Thank you for your payment</p>
          </div>
          
          <div class="amount">
            <div class="amount-label">Amount Paid</div>
            <div class="amount-value">${payment.amount.toLocaleString()} ${
        payment.currency
      }</div>
          </div>
          
          <div class="info-row">
            <span class="info-label">Transaction Reference</span>
            <span class="info-value">${payment.transactionReference}</span>
          </div>
          
          <div class="info-row">
            <span class="info-label">Date</span>
            <span class="info-value">${formatDate(payment.createdAt)}</span>
          </div>
          
          <div class="info-row">
            <span class="info-label">Property</span>
            <span class="info-value">${payment.propertyTitle || "N/A"}</span>
          </div>
          
          ${
            payment.bookingReference
              ? `
          <div class="info-row">
            <span class="info-label">Booking Reference</span>
            <span class="info-value">${payment.bookingReference}</span>
          </div>
          `
              : ""
          }
          
          <div class="info-row">
            <span class="info-label">Payment Method</span>
            <span class="info-value">${payment.paymentMethod
              .toUpperCase()
              .replace("_", " ")}</span>
          </div>
          
          <div class="info-row">
            <span class="info-label">Status</span>
            <span class="info-value">
              <span class="status status-${payment.status}">
                ${payment.status.toUpperCase()}
              </span>
            </span>
          </div>
          
          ${
            payment.completedAt
              ? `
          <div class="info-row">
            <span class="info-label">Completed</span>
            <span class="info-value">${formatDate(payment.completedAt)}</span>
          </div>
          `
              : ""
          }
          
          <div class="footer">
            <p><strong>Need help?</strong> Contact us at support@ajarly.com</p>
            <p style="margin: 10px 0;">Visit us at www.ajarly.com</p>
            <p style="font-size: 12px; color: #999;">
              This is an electronic receipt. No signature required.
            </p>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 20px;">
          <button onclick="window.print()" style="
            background: #00BFA6;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 6px;
            font-size: 16px;
            cursor: pointer;
            font-weight: 600;
          ">
            Print Receipt
          </button>
        </div>
      </body>
      </html>
    `;

      // ✅ FIX: Use setTimeout to ensure DOM is ready
      setTimeout(() => {
        // Open in new window
        const printWindow = window.open("", "_blank");
        if (printWindow) {
          printWindow.document.write(receiptHTML);
          printWindow.document.close();

          // ✅ FIX: Dismiss the specific loading toast
          toast.dismiss(loadingToastId);
          toast.success("Receipt opened in new window!", { duration: 3000 });
        } else {
          // Fallback: Download as HTML file
          const blob = new Blob([receiptHTML], { type: "text/html" });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `Ajarly-Receipt-${payment.transactionReference}.html`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);

          // ✅ FIX: Dismiss the specific loading toast
          toast.dismiss(loadingToastId);
          toast.success("Receipt downloaded!", { duration: 3000 });
        }
      }, 100); // Small delay to ensure everything is ready
    } catch (error) {
      console.error("Error generating receipt:", error);
      toast.error("Failed to generate receipt");
    }
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
        {payments.length > 0 && (
          <div className="flex items-center gap-4 mb-4 flex-wrap">
            <span className="text-sm font-medium">Filter:</span>
            <div className="flex gap-2">
              {["all", "completed", "pending", "failed", "refunded"].map(
                (status) => (
                  <Button
                    key={status}
                    variant={statusFilter === status ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter(status)}
                    className={
                      statusFilter === status
                        ? "bg-[#00BFA6] hover:bg-[#00A890]"
                        : ""
                    }
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Button>
                )
              )}
            </div>
            <span className="text-sm text-gray-500 ml-auto">
              Showing {filteredPayments.length} of {payments.length}
            </span>
          </div>
        )}

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
                {filteredPayments.map((payment) => (
                  <TableRow key={payment.transactionId}>
                    <TableCell>{formatDate(payment.createdAt)}</TableCell>
                    <TableCell className="font-medium max-w-xs truncate">
                      {payment.propertyTitle || "N/A"}
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
                    <TableCell>{getStatusBadge(payment.status)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1"
                        onClick={() => handleDownloadReceipt(payment)}
                      >
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
                  <p className="text-sm text-gray-600">
                    Add a payment method to save time on your next booking
                  </p>
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
