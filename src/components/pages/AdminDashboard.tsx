import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Users,
  Home,
  CheckCircle,
  Flag,
  TrendingUp,
  Search,
  MoreVertical,
  UserCheck,
  UserX,
  Eye,
  Trash2,
  AlertTriangle,
  MapPin,
  Star,
  DollarSign,
  Calendar,
  Loader2,
  MessageSquare,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { AdminReviewsManagement } from "../dashboard/admin/AdminReviewsManagement";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { toast } from "sonner";
import api from "../../../api";
import type {
  DashboardStatsResponse,
  UserProfile,
  PropertyResponse,
  PendingPropertyResponse,
  ReportResponse,
  PlatformAnalyticsResponse,
} from "../../../api";

interface AdminDashboardProps {
  onNavigate: (page: string) => void;
}

export function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
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

  // State for real data
  const [stats, setStats] = useState<DashboardStatsResponse | null>(null);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [properties, setProperties] = useState<PropertyResponse[]>([]);
  const [pendingListings, setPendingListings] = useState<PendingPropertyResponse[]>([]);
  const [reports, setReports] = useState<ReportResponse[]>([]);
  const [analytics, setAnalytics] = useState<PlatformAnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load data on component mount
  useEffect(() => {
    checkAuthAndLoadData();
  }, []);

  const checkAuthAndLoadData = async () => {
    try {
      const profile = await api.getProfile();
      console.log("Current user:", profile);

      if (profile.userType !== "admin") {
        setError("Access Denied: Admin privileges required");
        setLoading(false);
        toast.error("You must be logged in as an admin to access this page");
        return;
      }

      loadDashboardData();
    } catch (err) {
      console.error("Auth check failed:", err);
      setError("Authentication failed. Please login as admin.");
      setLoading(false);
      toast.error("Please login as admin");
    }
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load dashboard stats with error handling
      try {
        const statsData = await api.getDashboardStats();
        console.log("✅ Stats loaded:", statsData);
        setStats(statsData);
      } catch (err: any) {
        console.error("❌ Stats failed:", err.message);
        // Set default stats if API fails
        setStats({
          totalUsers: 0,
          totalProperties: 0,
          activeProperties: 0,
          pendingApprovalsCount: 0,
          totalBookings: 0,
          totalRevenue: 0,
          bannedUsersCount: 0,
          recentActivity: {
            recentRegistrations: 0,
            recentPropertyListings: 0,
            recentBookings: 0
          }
        } as DashboardStatsResponse);
      }

      // Load users with error handling
      try {
        const usersData = await api.getAllUsers({ page: 0, size: 20 });
        console.log("✅ Users loaded:", usersData);
        setUsers(usersData.content || []);
      } catch (err: any) {
        console.error("❌ Users failed:", err.message);
        setUsers([]);
      }

      // Load properties with error handling
      try {
        const propertiesData = await api.getProperties({ page: 0, size: 20 });
        console.log("✅ Properties loaded:", propertiesData);
        if (Array.isArray(propertiesData)) {
          setProperties(propertiesData);
        } else {
          setProperties(propertiesData.content || []);
        }
      } catch (err: any) {
        console.error("❌ Properties failed:", err.message);
        setProperties([]);
      }

      // Load pending properties with error handling
      try {
        const pendingData = await api.getPendingProperties({ page: 0, size: 20 });
        console.log("✅ Pending properties loaded:", pendingData);
        const actuallyPending = (pendingData.content || []).filter(
          (p: PendingPropertyResponse) =>
            p.status?.toLowerCase() === "pending" ||
            p.status?.toLowerCase() === "pending_approval"
        );
        setPendingListings(actuallyPending);
      } catch (err: any) {
        console.error("❌ Pending properties failed:", err.message);
        setPendingListings([]);
      }

      // Load reports with error handling
      try {
        const reportsData = await api.getAllReports({ page: 0, size: 20 });
        console.log("✅ Reports loaded:", reportsData);
        setReports(reportsData.content || []);
      } catch (err: any) {
        console.error("❌ Reports failed:", err.message);
        setReports([]);
      }

      // Load analytics with error handling
      try {
        const analyticsData = await api.getPlatformAnalytics();
        console.log("✅ Analytics loaded:", analyticsData);
        setAnalytics(analyticsData);
      } catch (err: any) {
        console.error("❌ Analytics failed:", err.message);
        setAnalytics(null);
      }
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
      setError("Failed to load some dashboard data. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (type: string, id: number, name: string) => {
    setDeleteDialog({ open: true, type, id, name });
  };

  const confirmDelete = async () => {
    try {
      if (deleteDialog.type === "User") {
        await api.banUser(deleteDialog.id, "Deleted by admin");
        setUsers(users.filter((u) => u.userId !== deleteDialog.id));
      } else if (deleteDialog.type === "Property") {
        await api.deleteProperty(deleteDialog.id);
        setProperties(properties.filter((p) => p.propertyId !== deleteDialog.id));
      }
      toast.success(`${deleteDialog.type} deleted successfully`);
    } catch (err) {
      toast.error(`Failed to delete ${deleteDialog.type}`);
    } finally {
      setDeleteDialog({ open: false, type: "", id: 0, name: "" });
    }
  };

  const handleApprove = async (id: number, title: string) => {
    try {
      await api.approveProperty(id);
      setPendingListings(pendingListings.filter((p) => p.propertyId !== id));
      toast.success(`Property "${title}" has been approved`);
      await loadDashboardData();
    } catch (err) {
      console.error("Approve error:", err);
      toast.error("Failed to approve property");
    }
  };

  const handleReject = async (id: number, title: string) => {
    try {
      await api.rejectProperty(id, "Does not meet platform standards");
      setPendingListings(pendingListings.filter((p) => p.propertyId !== id));
      toast.error(`Property "${title}" has been rejected`);
      await loadDashboardData();
    } catch (err) {
      console.error("Reject error:", err);
      toast.error("Failed to reject property");
    }
  };

  const handleBanUser = async (userId: number, userName: string) => {
    try {
      await api.banUser(userId, "Violates terms of service");
      setUsers(users.map((u) => (u.userId === userId ? { ...u, isActive: false } : u)));
      toast.success(`User ${userName} has been banned`);
    } catch (err) {
      toast.error("Failed to ban user");
    }
  };

  const handleUnbanUser = async (userId: number, userName: string) => {
    try {
      await api.unbanUser(userId);
      setUsers(users.map((u) => (u.userId === userId ? { ...u, isActive: true } : u)));
      toast.success(`User ${userName} has been unbanned`);
    } catch (err) {
      toast.error("Failed to unban user");
    }
  };

  const getStatusColor = (status: string | boolean) => {
    if (typeof status === "boolean") {
      return status ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700";
    }
    switch (status.toLowerCase()) {
      case "active":
      case "approved":
      case "resolved":
        return "bg-green-100 text-green-700";
      case "suspended":
      case "banned":
      case "rejected":
        return "bg-red-100 text-red-700";
      case "pending":
      case "pending_approval":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-EG", {
      style: "currency",
      currency: "EGP",
      minimumFractionDigits: 0,
    }).format(amount);
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
          <h2 className="text-xl font-semibold text-[#2B2B2B] mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={loadDashboardData} className="bg-[#00BFA6] hover:bg-[#00A896]">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F6F1]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-semibold text-[#2B2B2B]">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">Manage your platform</p>
          </div>
          <Button variant="outline" onClick={() => onNavigate("home")}>
            Back to Home
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-7 mb-8">
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
                <Badge className="ml-1 bg-red-500">{pendingListings.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="reviews" className="gap-2">
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">Reviews</span>
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

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Grid - Clean & Modern */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Total Users Card */}
              <Card className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-white border-l-4 border-blue-500">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300">
                      Active
                    </Badge>
                  </div>
                  <h3 className="text-sm font-medium text-gray-600 mb-2">Total Users</h3>
                  <p className="text-4xl font-bold text-[#2B2B2B] mb-1">
                    {stats?.totalUsers?.toLocaleString() || 0}
                  </p>
                  <p className="text-sm text-gray-500">Registered users</p>
                </div>
              </Card>

              {/* Total Properties Card */}
              <Card className="relative overflow-hidden bg-gradient-to-br from-green-50 to-white border-l-4 border-green-500">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center">
                      <Home className="w-6 h-6 text-white" />
                    </div>
                    <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                      {stats?.activeProperties || 0} Active
                    </Badge>
                  </div>
                  <h3 className="text-sm font-medium text-gray-600 mb-2">Total Properties</h3>
                  <p className="text-4xl font-bold text-[#2B2B2B] mb-1">
                    {stats?.totalProperties || 0}
                  </p>
                  <p className="text-sm text-gray-500">Listed properties</p>
                </div>
              </Card>

              {/* Pending Approvals Card - HIGHLIGHTED */}
              <Card className="relative overflow-hidden bg-gradient-to-br from-orange-50 to-white border-l-4 border-orange-500 shadow-lg">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center animate-pulse">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                    <Badge className="bg-orange-500 text-white">
                      ⚠️ Action Needed
                    </Badge>
                  </div>
                  <h3 className="text-sm font-medium text-gray-600 mb-2">Pending Approvals</h3>
                  <p className="text-4xl font-bold text-orange-600 mb-1">
                    {stats?.pendingApprovalsCount || 0}
                  </p>
                  <p className="text-sm text-orange-600 font-medium">Awaiting review</p>
                </div>
              </Card>

              {/* Total Bookings Card */}
              <Card className="relative overflow-hidden bg-gradient-to-br from-purple-50 to-white border-l-4 border-purple-500">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-500 flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-white" />
                    </div>
                    <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-300">
                      All Time
                    </Badge>
                  </div>
                  <h3 className="text-sm font-medium text-gray-600 mb-2">Total Bookings</h3>
                  <p className="text-4xl font-bold text-[#2B2B2B] mb-1">
                    {stats?.totalBookings || 0}
                  </p>
                  <p className="text-sm text-gray-500">Completed bookings</p>
                </div>
              </Card>

              {/* Total Revenue Card */}
              <Card className="relative overflow-hidden bg-gradient-to-br from-emerald-50 to-white border-l-4 border-emerald-500">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-white" />
                    </div>
                    <Badge variant="outline" className="bg-emerald-100 text-emerald-700 border-emerald-300">
                      Revenue
                    </Badge>
                  </div>
                  <h3 className="text-sm font-medium text-gray-600 mb-2">Total Revenue</h3>
                  <p className="text-4xl font-bold text-emerald-600 mb-1">
                    {formatCurrency(stats?.totalRevenue || 0)}
                  </p>
                  <p className="text-sm text-gray-500">Platform earnings</p>
                </div>
              </Card>

              {/* Banned Users Card */}
              <Card className="relative overflow-hidden bg-gradient-to-br from-red-50 to-white border-l-4 border-red-500">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-red-500 flex items-center justify-center">
                      <UserX className="w-6 h-6 text-white" />
                    </div>
                    <Badge variant="outline" className="bg-red-100 text-red-700 border-red-300">
                      Banned
                    </Badge>
                  </div>
                  <h3 className="text-sm font-medium text-gray-600 mb-2">Banned Users</h3>
                  <p className="text-4xl font-bold text-red-600 mb-1">
                    {stats?.bannedUsersCount || 0}
                  </p>
                  <p className="text-sm text-gray-500">Suspended accounts</p>
                </div>
              </Card>
            </div>

            {/* Recent Activity & Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="font-semibold text-[#2B2B2B] mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#00BFA6]" />
                  Recent Activity
                </h3>
                <div className="space-y-4">
                  {stats?.recentActivity && (
                    <>
                      <div className="flex items-start gap-3 pb-3 border-b">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                          <UserCheck className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-[#2B2B2B]">
                            {stats.recentActivity.recentRegistrations} new users registered
                          </p>
                          <p className="text-xs text-gray-500">Recent period</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 pb-3 border-b">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <Home className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-[#2B2B2B]">
                            {stats.recentActivity.recentPropertyListings} new properties listed
                          </p>
                          <p className="text-xs text-gray-500">Recent period</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                          <Calendar className="w-5 h-5 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-[#2B2B2B]">
                            {stats.recentActivity.recentBookings} bookings completed
                          </p>
                          <p className="text-xs text-gray-500">Recent period</p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="font-semibold text-[#2B2B2B] mb-4 flex items-center gap-2">
                  <LayoutDashboard className="w-5 h-5 text-[#00BFA6]" />
                  Quick Actions
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    className="h-24 flex-col gap-2 hover:bg-[#00BFA6] hover:text-white transition-colors"
                    onClick={() => setActiveTab("approvals")}
                  >
                    <CheckCircle className="w-6 h-6" />
                    <span className="text-sm font-medium">Approve Listings</span>
                    {pendingListings.length > 0 && (
                      <Badge className="bg-red-500 text-white">{pendingListings.length}</Badge>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    className="h-24 flex-col gap-2 hover:bg-[#00BFA6] hover:text-white transition-colors"
                    onClick={() => setActiveTab("users")}
                  >
                    <Users className="w-6 h-6" />
                    <span className="text-sm font-medium">Manage Users</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-24 flex-col gap-2 hover:bg-[#00BFA6] hover:text-white transition-colors"
                    onClick={() => setActiveTab("reviews")}
                  >
                    <MessageSquare className="w-6 h-6" />
                    <span className="text-sm font-medium">Review Management</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-24 flex-col gap-2 hover:bg-[#00BFA6] hover:text-white transition-colors"
                    onClick={() => setActiveTab("analytics")}
                  >
                    <TrendingUp className="w-6 h-6" />
                    <span className="text-sm font-medium">Analytics</span>
                  </Button>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-[#2B2B2B]">
                Manage Users ({users.length})
              </h2>
              <div className="flex gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
              </div>
            </div>

            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Verified</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users
                    .filter(
                      (user) =>
                        user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        user.email.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((user) => (
                      <TableRow key={user.userId}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={user.profilePhoto} />
                              <AvatarFallback className="bg-[#00BFA6] text-white">
                                {user.firstName[0]}{user.lastName[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{user.firstName} {user.lastName}</p>
                              <p className="text-sm text-gray-600">{user.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{user.userType}</Badge>
                        </TableCell>
                        <TableCell>{formatDate(user.createdAt)}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(user.isActive ? "active" : "suspended")}>
                            {user.isActive ? "Active" : "Banned"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            {user.emailVerified && (
                              <Badge className="bg-blue-100 text-blue-700">Email ✓</Badge>
                            )}
                            {user.phoneVerified && (
                              <Badge className="bg-green-100 text-green-700">Phone ✓</Badge>
                            )}
                            {user.nationalIdVerified && (
                              <Badge className="bg-purple-100 text-purple-700">ID ✓</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              {user.isActive ? (
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleBanUser(user.userId, `${user.firstName} ${user.lastName}`)
                                  }
                                >
                                  <UserX className="w-4 h-4 mr-2" />
                                  Ban User
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleUnbanUser(user.userId, `${user.firstName} ${user.lastName}`)
                                  }
                                >
                                  <UserCheck className="w-4 h-4 mr-2" />
                                  Unban User
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* Properties Tab */}
          <TabsContent value="properties" className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-[#2B2B2B]">
                Manage Properties ({properties.length})
              </h2>
              <div className="flex gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input placeholder="Search properties..." className="pl-10 w-64" />
                </div>
              </div>
            </div>

            {properties.length === 0 ? (
              <Card className="p-12 text-center">
                <Home className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-[#2B2B2B] mb-2">No Properties Found</h3>
                <p className="text-gray-600">No properties available in the system</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map((property) => (
                  <Card key={property.propertyId} className="overflow-hidden">
                    <div className="relative h-48">
                      <ImageWithFallback
                        src={property.coverImage || ""}
                        alt={property.titleEn || property.titleAr || "Property"}
                        className="w-full h-full object-cover"
                      />
                      <Badge className={`absolute top-3 right-3 ${getStatusColor(property.status || "active")}`}>
                        {property.status || "Active"}
                      </Badge>
                    </div>
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="font-semibold text-[#2B2B2B] mb-1 line-clamp-1">
                            {property.titleEn || property.titleAr || "Untitled Property"}
                          </h3>
                          <p className="text-sm text-gray-600 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {property.city || "N/A"}, {property.governorate || "N/A"}
                          </p>
                        </div>
                        {property.averageRating > 0 && (
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-medium">{property.averageRating.toFixed(1)}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-3 text-sm text-gray-600 mb-3">
                        <span>{property.bedrooms || 0} beds</span>
                        <span>{property.bathrooms || 0} baths</span>
                        <span>{property.propertyType || "N/A"}</span>
                      </div>

                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <span className="text-lg font-semibold text-[#2B2B2B]">
                            {formatCurrency(property.pricePerNight || property.pricePerMonth || 0)}
                          </span>
                          <span className="text-sm text-gray-600">/{property.pricePerNight ? "night" : "month"}</span>
                        </div>
                        {property.isFeatured && (
                          <Badge className="bg-purple-100 text-purple-700">Featured</Badge>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                        <span>{property.totalReviews || 0} reviews</span>
                        <span>ID: {property.propertyId}</span>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(`/properties/${property.propertyId}`, "_blank");
                          }}
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          View
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() =>
                                handleDelete("Property", property.propertyId, property.titleEn || property.titleAr || "Property")
                              }
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Approvals Tab */}
          <TabsContent value="approvals" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-[#2B2B2B]">
                Pending Approvals ({pendingListings.length})
              </h2>
              <Button variant="outline" size="sm" onClick={loadDashboardData}>
                Refresh
              </Button>
            </div>

            {pendingListings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {pendingListings.map((listing) => (
                  <Card key={listing.propertyId} className="overflow-hidden">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-[#2B2B2B] mb-1">{listing.titleEn}</h3>
                          <p className="text-sm text-gray-600">
                            by {listing.ownerName} ({listing.ownerEmail})
                          </p>
                        </div>
                        <Badge variant="outline" className="bg-yellow-50">Pending</Badge>
                      </div>
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {listing.city}, {listing.governorate}
                          </span>
                          <span className="font-semibold">{formatCurrency(listing.pricePerNight)}/night</span>
                        </div>
                        <div className="flex gap-3 text-sm text-gray-600">
                          <span>{listing.bedrooms} beds</span>
                          <span>{listing.bathrooms} baths</span>
                          <span>{listing.propertyType}</span>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2">{listing.descriptionEn}</p>
                      </div>
                      <p className="text-xs text-gray-500 mb-4">Submitted {formatDate(listing.createdAt)}</p>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="flex-1 bg-green-600 hover:bg-green-700"
                          onClick={() => handleApprove(listing.propertyId, listing.titleEn)}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 border-red-500 text-red-600 hover:bg-red-50"
                          onClick={() => handleReject(listing.propertyId, listing.titleEn)}
                        >
                          Reject
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-[#2B2B2B] mb-2">All caught up!</h3>
                <p className="text-gray-600">No pending listings to review</p>
              </Card>
            )}
          </TabsContent>

          {/* Reviews Tab - ✅ هنا الحل */}
          <TabsContent value="reviews">
            <AdminReviewsManagement />
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <h2 className="text-2xl font-semibold text-[#2B2B2B]">
              Reports & Suspicious Activity ({reports.length})
            </h2>

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
                        <Badge className={getStatusColor(report.status)}>{report.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="w-3 h-3 mr-1" />
                            Review
                          </Button>
                          {report.status !== "resolved" && (
                            <Button size="sm" className="bg-green-600 hover:bg-green-700">
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
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <h2 className="text-2xl font-semibold text-[#2B2B2B]">Analytics & Insights</h2>

            {analytics && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card className="p-4">
                    <h4 className="text-sm text-gray-600 mb-1">New Users</h4>
                    <p className="text-2xl font-semibold">{analytics.overview.newUsersInPeriod}</p>
                    <p className="text-xs text-gray-500">Total: {analytics.overview.totalUsers}</p>
                  </Card>
                  <Card className="p-4">
                    <h4 className="text-sm text-gray-600 mb-1">New Properties</h4>
                    <p className="text-2xl font-semibold">{analytics.overview.newPropertiesInPeriod}</p>
                    <p className="text-xs text-gray-500">Total: {analytics.overview.totalProperties}</p>
                  </Card>
                  <Card className="p-4">
                    <h4 className="text-sm text-gray-600 mb-1">New Bookings</h4>
                    <p className="text-2xl font-semibold">{analytics.overview.newBookingsInPeriod}</p>
                    <p className="text-xs text-gray-500">Total: {analytics.overview.totalBookings}</p>
                  </Card>
                  <Card className="p-4">
                    <h4 className="text-sm text-gray-600 mb-1">Revenue</h4>
                    <p className="text-2xl font-semibold">{formatCurrency(analytics.overview.revenueInPeriod)}</p>
                    <p className="text-xs text-gray-500">Total: {formatCurrency(analytics.overview.totalRevenue)}</p>
                  </Card>
                </div>

                <Card className="p-6">
                  <h3 className="font-semibold text-[#2B2B2B] mb-4">Top Performing Locations</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Location</TableHead>
                        <TableHead>Properties</TableHead>
                        <TableHead>Bookings</TableHead>
                        <TableHead>Revenue</TableHead>
                        <TableHead>Avg Price</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {analytics.topLocations.map((location, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-gray-400" />
                              <span className="font-medium">{location.city}, {location.governorate}</span>
                            </div>
                          </TableCell>
                          <TableCell>{location.propertyCount}</TableCell>
                          <TableCell>{location.bookingCount}</TableCell>
                          <TableCell className="font-semibold">{formatCurrency(location.totalRevenue)}</TableCell>
                          <TableCell>{formatCurrency(location.averagePrice)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>

                <Card className="p-6">
                  <h3 className="font-semibold text-[#2B2B2B] mb-4">Platform Performance</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <h4 className="text-sm text-gray-600 mb-2">Active Properties</h4>
                      <p className="text-2xl font-semibold">{analytics.overview.activeProperties}</p>
                      <p className="text-xs text-gray-500">
                        {((analytics.overview.activeProperties / analytics.overview.totalProperties) * 100).toFixed(1)}% of total
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm text-gray-600 mb-2">Avg Rating</h4>
                      <div className="flex items-center gap-2">
                        <p className="text-2xl font-semibold">{analytics.overview.averagePlatformRating.toFixed(1)}</p>
                        <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      </div>
                      <p className="text-xs text-gray-500">{analytics.overview.totalReviews} reviews</p>
                    </div>
                    <div>
                      <h4 className="text-sm text-gray-600 mb-2">Period</h4>
                      <p className="text-sm">{formatDate(analytics.startDate)} - {formatDate(analytics.endDate)}</p>
                    </div>
                  </div>
                </Card>
              </>
            )}

            {!analytics && (
              <Card className="p-12 text-center">
                <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-[#2B2B2B] mb-2">No Analytics Data</h3>
                <p className="text-gray-600">Analytics data is not available</p>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleteDialog.type}</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteDialog.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}