// src/components/dashboard/admin/reports/ReportsTab.tsx
import { ReportsTable } from "./ReportsTable";
import type { ReportResponse } from "../../../../api";

interface ReportsTabProps {
  reports: ReportResponse[];
  formatDate: (date: string) => string;
  getStatusColor: (status: string | boolean) => string;
}

export function ReportsTab({
  reports,
  formatDate,
  getStatusColor,
}: ReportsTabProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-[#2B2B2B]">
        Reports & Suspicious Activity ({reports.length})
      </h2>
      <ReportsTable
        reports={reports}
        formatDate={formatDate}
        getStatusColor={getStatusColor}
      />
    </div>
  );
}
