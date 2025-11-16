// src/components/dashboard/admin/reports/ReportsTable.tsx
import { AlertTriangle, Eye } from "lucide-react";
import { Card } from "../../../ui/card";
import { Badge } from "../../../ui/badge";
import { Button } from "../../../ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../ui/table";
import type { ReportResponse } from "../../../../api";

interface ReportsTableProps {
  reports: ReportResponse[];
  formatDate: (date: string) => string;
  getStatusColor: (status: string | boolean) => string;
}

export function ReportsTable({
  reports,
  formatDate,
  getStatusColor,
}: ReportsTableProps) {
  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Type</TableHead>
            <TableHead>Reason</TableHead>
            <TableHead>Reporter</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reports.map((report) => (
            <TableRow key={report.reportId}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  <span className="font-medium">{report.reportType}</span>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline">{report.reason}</Badge>
              </TableCell>
              <TableCell>Reporter ID: {report.reporterId}</TableCell>
              <TableCell>{formatDate(report.createdAt)}</TableCell>
              <TableCell>
                <Badge className={getStatusColor(report.status)}>
                  {report.status}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="w-3 h-3 mr-1" />
                    Review
                  </Button>
                  {report.status !== "resolved" && (
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Resolve
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
