// src/components/dashboard/owner/OwnerDashboard.tsx - COMPLETE FIX
import { useState, useEffect, useCallback } from "react";
import { AddPropertyForm } from "./AddPropertyForm";
import { Language, translations } from "../../../lib/translations";

import {
  Plus,
  Home,
  Calendar,
  TrendingUp,
  Settings,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import api from "../../../../api";
import { useProfile } from "../../../hooks/useProfile";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { Card } from "../../ui/card";
import { Button } from "../../ui/button";
import { OwnerOverview } from "./OwnerOverview";
import { OwnerProperties } from "./OwnerProperties";
import { OwnerBookings } from "./OwnerBookings";
import { OwnerAnalytics } from "./OwnerAnalytics";
import { OwnerSettings } from "./OwnerSettings";

interface OwnerDashboardProps {
  onNavigate?: (page: string, propertyId?: string) => void;
  showAddPropertyOnMount?: boolean;
  language: Language;
}

export function OwnerDashboard({
  onNavigate,
  showAddPropertyOnMount = false,
  language,
}: OwnerDashboardProps) {
  const t = translations[language];
  const { profile, loading: profileLoading } = useProfile();
  const [activeTab, setActiveTab] = useState("overview");
  const [showAddProperty, setShowAddProperty] = useState(
    showAddPropertyOnMount
  );

  const [dashboard, setDashboard] = useState<any>(null);
  const [properties, setProperties] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadKey, setLoadKey] = useState(0);

  const loadDashboardData = useCallback(async (forceReload = false) => {
    try {
      setLoading(true);
      console.log(`🔄 Loading dashboard data... (Force: ${forceReload})`);

      const timestamp = Date.now();
      const token = localStorage.getItem("authToken");

      const propertiesResponse = await fetch(
        `http://localhost:8081/api/v1/properties/my-properties?page=0&size=100&_t=${timestamp}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
          },
          cache: "no-store",
        }
      );

      if (!propertiesResponse.ok) {
        throw new Error(`HTTP ${propertiesResponse.status}`);
      }

      const propertiesData = await propertiesResponse.json();
      console.log("📦 Raw API Response:", propertiesData);

      let propertiesList: any[] = [];
      if (propertiesData.data) {
        if (Array.isArray(propertiesData.data)) {
          propertiesList = propertiesData.data;
        } else if (
          propertiesData.data.content &&
          Array.isArray(propertiesData.data.content)
        ) {
          propertiesList = propertiesData.data.content;
        }
      } else if (Array.isArray(propertiesData)) {
        propertiesList = propertiesData;
      }

      const activeProperties = propertiesList.filter((p) => {
        const status = (p.status || "").toLowerCase();
        const isDeleted = status === "deleted";
        if (isDeleted) {
          console.log("🗑️ Filtering deleted:", p.propertyId, p.titleEn);
        }
        return !isDeleted;
      });

      console.log(
        `✅ Total: ${propertiesList.length}, Active: ${activeProperties.length}`
      );

      const [dashboardData, bookingsData] = await Promise.all([
        api.getOwnerDashboard().catch(() => null),
        api.getOwnerBookings().catch(() => []),
      ]);

      setDashboard(dashboardData);
      setProperties(activeProperties);
      setBookings(Array.isArray(bookingsData) ? bookingsData : []);
    } catch (error: any) {
      console.error("❌ Failed to load dashboard:", error);
      toast.error("Failed to load dashboard");
      setProperties([]);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (profile?.userType === "landlord") {
      loadDashboardData();
    }
  }, [profile, loadKey]);

  const handlePropertyCreated = useCallback(() => {
    console.log("🎉 Property created! Switching to properties tab...");
    setShowAddProperty(false);
    setActiveTab("properties");
    setTimeout(() => {
      setLoadKey((prev) => prev + 1);
    }, 500);
  }, []);

  const handlePropertyDeleted = useCallback(() => {
    console.log("🗑️ Property deleted! Force reloading...");
    setLoadKey((prev) => prev + 1);
    toast.success("Reloading properties...");
  }, []);

  const handleBookingUpdated = useCallback(() => {
    console.log("📅 Booking updated!");
    setLoadKey((prev) => prev + 1);
  }, []);

  if (profileLoading || loading) {
    return (
      <div className="min-h-screen bg-[#F9F6F1] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#00BFA6] mx-auto mb-2" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (profile?.userType !== "landlord") {
    return (
      <div className="min-h-screen bg-[#F9F6F1] flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-gray-600">
            Only property owners can access this dashboard
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-[#F9F6F1]"
      dir={language === "ar" ? "rtl" : "ltr"}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div
          className={`flex items-center justify-between mb-8 ${
            language === "ar" ? "flex-row-reverse" : ""
          }`}
        >
          <div className={language === "ar" ? "text-right" : "text-left"}>
            <h1 className="text-3xl font-semibold text-[#2B2B2B]">
              {t.hostDashboard.title}
            </h1>
            <p className="text-gray-600 mt-1">
              {t.hostDashboard.welcome.replace("ðŸŽ‰", "")} {profile?.firstName}
              !
            </p>
          </div>
          {!showAddProperty && (
            <Button
              onClick={() => setShowAddProperty(true)}
              className={`gap-2 ${language === "ar" ? "flex-row-reverse" : ""}`}
            >
              <Plus className="w-5 h-5" />
              {t.hostDashboard.addProperty}
            </Button>
          )}
        </div>

        {showAddProperty ? (
          <AddPropertyForm
            onSuccess={handlePropertyCreated}
            onCancel={() => setShowAddProperty(false)}
          />
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList
              className={`grid w-full max-w-3xl grid-cols-5 mb-8 ${
                language === "ar" ? "flex-row-reverse" : ""
              }`}
            >
              <TabsTrigger
                value="overview"
                className={`gap-2 ${
                  language === "ar" ? "flex-row-reverse" : ""
                }`}
              >
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline">
                  {t.hostDashboard.overview}
                </span>
              </TabsTrigger>
              <TabsTrigger value="properties" className="gap-2">
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline">
                  {t.hostDashboard.myProperties}
                </span>
              </TabsTrigger>
              <TabsTrigger value="bookings" className="gap-2">
                <Calendar className="w-4 h-4" />
                <span className="hidden sm:inline">
                  {t.hostDashboard.bookings}
                </span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="gap-2">
                <TrendingUp className="w-4 h-4" />
                <span className="hidden sm:inline">
                  {t.hostDashboard.analytics}
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="settings"
                className={`gap-2 ${
                  language === "ar" ? "flex-row-reverse" : ""
                }`}
              >
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">
                  {t.hostDashboard.settings}
                </span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <OwnerOverview
                dashboard={dashboard}
                properties={properties}
                language={language}
              />
            </TabsContent>

            <TabsContent value="properties">
              <OwnerProperties
                properties={properties}
                onPropertyDeleted={handlePropertyDeleted}
                onNavigate={onNavigate}
                language={language}
              />
            </TabsContent>

            <TabsContent value="bookings">
              <OwnerBookings
                bookings={bookings}
                onBookingUpdated={handleBookingUpdated}
                language={language}
              />
            </TabsContent>

            <TabsContent value="analytics">
              <OwnerAnalytics dashboard={dashboard} language={language} />
            </TabsContent>

            <TabsContent value="settings">
              <OwnerSettings profile={profile} language={language} />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
