// src/components/dashboard/admin/AdminDashboard.tsx
import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  Home,
  CheckCircle,
  Flag,
  TrendingUp,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { Badge } from "../../ui/badge";
import { Button } from "../../ui/button";
import { OverviewTab } from "./overview/OverviewTab";
import { UsersTab } from "./users/UsersTab";
import { PropertiesTab } from "./properties/PropertiesTab";
import { ApprovalsTab } from "./approvals/ApprovalsTab";
import { ReportsTab } from "./reports/ReportsTab";
import { AnalyticsTab } from "./analytics/AnalyticsTab";
import { DeleteConfirmDialog } from "./shared/DeleteConfirmDialog";
import { useAdminDashboard } from "./hooks/useAdminDashboard";
import { formatCurrency, formatDate, getStatusColor } from "./utils/adminUtils";

interface AdminDashboardProps {
  onNavigate: (page: string) => void;
}

export function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    type: string;
    id: number;
    name: string;
  }>({
    open: false,
    type: "",
    id: 0,
    name: "",
  });

  const {
    stats,
    users,
    properties,
    pendingListings,
    reports,
    analytics,
    loading,
    error,
    handleBanUser,
    handleUnbanUser,
    handleDeleteProperty,
    handleApprove,
    handleReject,
    loadDashboardData,
  } = useAdminDashboard();

  const handleDelete = (type: string, id: number, name: string) => {
    setDeleteDialog({ open: true, type, id, name });
  };

  const confirmDelete = async () => {
    if (deleteDialog.type === "Property") {
      await handleDeleteProperty(deleteDialog.id);
    }
    setDeleteDialog({ open: false, type: "", id: 0, name: "" });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9F6F1] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-[#00BFA6]" />
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="min-h-screen bg-[#F9F6F1] flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-[#2B2B2B] mb-2">
            Error Loading Dashboard
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button
            onClick={loadDashboardData}
            className="bg-[#00BFA6] hover:bg-[#00A896]"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F6F1]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-semibold text-[#2B2B2B]">
              Admin Dashboard
            </h1>
            <p className="text-gray-600 mt-1">Manage your platform</p>
          </div>
          <Button variant="outline" onClick={() => onNavigate("home")}>
            Back to Home
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6 mb-8">
            <TabsTrigger value="overview" className="gap-2">
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Users</span>
            </TabsTrigger>
            <TabsTrigger value="properties" className="gap-2">
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Properties</span>
            </TabsTrigger>
            <TabsTrigger value="approvals" className="gap-2">
              <CheckCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Approvals</span>
              {pendingListings.length > 0 && (
                <Badge className="ml-1 bg-red-500">
                  {pendingListings.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="reports" className="gap-2">
              <Flag className="w-4 h-4" />
              <span className="hidden sm:inline">Reports</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <OverviewTab
              stats={stats}
              formatCurrency={formatCurrency}
              onTabChange={setActiveTab}
            />
          </TabsContent>

          <TabsContent value="users">
            <UsersTab
              users={users}
              formatDate={formatDate}
              getStatusColor={getStatusColor}
              onBan={handleBanUser}
              onUnban={handleUnbanUser}
            />
          </TabsContent>

          <TabsContent value="properties">
            <PropertiesTab
              properties={properties}
              formatCurrency={formatCurrency}
              getStatusColor={getStatusColor}
              onDelete={handleDelete}
            />
          </TabsContent>

          <TabsContent value="approvals">
            <ApprovalsTab
              pendingListings={pendingListings}
              stats={stats}
              formatCurrency={formatCurrency}
              formatDate={formatDate}
              onApprove={handleApprove}
              onReject={handleReject}
              onRefresh={loadDashboardData}
            />
          </TabsContent>

          <TabsContent value="reports">
            <ReportsTab
              reports={reports}
              formatDate={formatDate}
              getStatusColor={getStatusColor}
            />
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsTab
              analytics={analytics}
              formatCurrency={formatCurrency}
              formatDate={formatDate}
            />
          </TabsContent>
        </Tabs>
      </div>

      <DeleteConfirmDialog
        open={deleteDialog.open}
        type={deleteDialog.type}
        name={deleteDialog.name}
        onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
