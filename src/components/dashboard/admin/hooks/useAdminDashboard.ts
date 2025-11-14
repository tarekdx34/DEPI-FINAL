// src/components/dashboard/admin/hooks/useAdminDashboard.ts
import { useState, useEffect } from "react";
import { toast } from "sonner";
import api from "../../../../../api";
import type {
  DashboardStatsResponse,
  UserProfile,
  PropertyResponse,
  PendingPropertyResponse,
  ReportResponse,
  PlatformAnalyticsResponse,
} from "../../../../../api";

export function useAdminDashboard() {
  const [stats, setStats] = useState<DashboardStatsResponse | null>(null);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [properties, setProperties] = useState<PropertyResponse[]>([]);
  const [pendingListings, setPendingListings] = useState<
    PendingPropertyResponse[]
  >([]);
  const [reports, setReports] = useState<ReportResponse[]>([]);
  const [analytics, setAnalytics] = useState<PlatformAnalyticsResponse | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAuthAndLoadData();
  }, []);

  const checkAuthAndLoadData = async () => {
    try {
      const profile = await api.getProfile();
      if (profile.userType !== "admin") {
        setError("Access Denied: Admin privileges required");
        setLoading(false);
        toast.error("You must be logged in as an admin to access this page");
        return;
      }
      loadDashboardData();
    } catch (err) {
      setError("Authentication failed. Please login as admin.");
      setLoading(false);
      toast.error("Please login as admin");
    }
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load all data in parallel
      const [
        statsData,
        usersData,
        propertiesData,
        pendingData,
        reportsData,
        analyticsData,
      ] = await Promise.allSettled([
        api.getDashboardStats(),
        api.getAllUsers({ page: 0, size: 20 }),
        api.getProperties({ page: 0, size: 20 }),
        api.getPendingProperties({ page: 0, size: 20 }),
        api.getAllReports({ page: 0, size: 20 }),
        api.getPlatformAnalytics(),
      ]);

      if (statsData.status === "fulfilled") setStats(statsData.value);
      if (usersData.status === "fulfilled")
        setUsers(usersData.value.content || []);
      if (propertiesData.status === "fulfilled") {
        const data = propertiesData.value;
        setProperties(Array.isArray(data) ? data : data.content || []);
      }
      if (pendingData.status === "fulfilled") {
        const actuallyPending = (pendingData.value.content || []).filter(
          (p: PendingPropertyResponse) =>
            p.status?.toLowerCase() === "pending" ||
            p.status?.toLowerCase() === "pending_approval" ||
            p.status?.toLowerCase() === "pending approval"
        );
        setPendingListings(actuallyPending);
      }
      if (reportsData.status === "fulfilled")
        setReports(reportsData.value.content || []);
      if (analyticsData.status === "fulfilled")
        setAnalytics(analyticsData.value);
    } catch (err) {
      setError("Failed to load some dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  const handleBanUser = async (userId: number, userName: string) => {
    try {
      await api.banUser(userId, "Violates terms of service");
      setUsers(
        users.map((u) => (u.userId === userId ? { ...u, isActive: false } : u))
      );
      toast.success(`User ${userName} has been banned`);
    } catch (err) {
      toast.error("Failed to ban user");
    }
  };

  const handleUnbanUser = async (userId: number, userName: string) => {
    try {
      await api.unbanUser(userId);
      setUsers(
        users.map((u) => (u.userId === userId ? { ...u, isActive: true } : u))
      );
      toast.success(`User ${userName} has been unbanned`);
    } catch (err) {
      toast.error("Failed to unban user");
    }
  };

  const handleDeleteProperty = async (id: number) => {
    try {
      await api.deleteProperty(id);
      setProperties(properties.filter((p) => p.propertyId !== id));
      toast.success("Property deleted successfully");
    } catch (err) {
      toast.error("Failed to delete property");
    }
  };

  const handleApprove = async (id: number, title: string) => {
    try {
      await api.approveProperty(id);
      setPendingListings(pendingListings.filter((p) => p.propertyId !== id));
      toast.success(`Property "${title}" has been approved`);
      await loadDashboardData();
    } catch (err) {
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
      toast.error("Failed to reject property");
    }
  };

  return {
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
  };
}
