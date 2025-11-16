// src/components/dashboard/renter/RenterDashboard.tsx
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { Language, translations } from "../../../lib/translations";
import { OverviewTab } from "./overview/OverviewTab";
import { ProfileTab } from "../../profile/ProfileTab";
import { TripsTab } from "./trips/TripsTab";
import { FavoritesTab } from "./favorites/FavoritesTab";
import { ReviewsTab } from "./reviews/ReviewsTab";
import { PaymentsTab } from "./payments/PaymentsTab";
import {
  Calendar,
  Heart,
  MessageSquare,
  Receipt,
  User,
  LayoutDashboard,
} from "lucide-react";

interface RenterDashboardProps {
  onNavigate: (page: string, id?: string) => void;
  currentUser?: any;
  onUserUpdate?: (user: any) => void;
  language: Language;
}

export function RenterDashboard({
  onNavigate,
  currentUser,
  onUserUpdate,
  language,
}: RenterDashboardProps) {
  const t = translations[language];
  const [activeTab, setActiveTab] = useState(() => {
    // ✅ Check URL for tab parameter
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const tabParam = urlParams.get("tab");
      const validTabs = [
        "overview",
        "trips",
        "favorites",
        "reviews",
        "payments",
        "profile",
      ];
      if (tabParam && validTabs.includes(tabParam)) {
        return tabParam;
      }
    }
    return "overview";
  });

  return (
    <div
      className="min-h-screen bg-[#F9F6F1]"
      dir={language === "ar" ? "rtl" : "ltr"}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1
          className={`text-3xl font-semibold text-[#2B2B2B] mb-8 ${
            language === "ar" ? "text-right" : "text-left"
          }`}
        >
          {t.userDashboard.myDashboard}
        </h1>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList
            className="grid w-full max-w-4xl grid-cols-6 mb-8"
            style={{
              direction: language === "ar" ? "rtl" : "ltr",
            }}
          >
            <TabsTrigger
              value="overview"
              className={`gap-2 ${language === "ar" ? "flex-row-reverse" : ""}`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden sm:inline">
                {t.userDashboard.overview}
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="trips"
              className={`gap-2 ${language === "ar" ? "flex-row-reverse" : ""}`}
            >
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">
                {t.userDashboard.myBookings}
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="favorites"
              className={`gap-2 ${language === "ar" ? "flex-row-reverse" : ""}`}
            >
              <Heart className="w-4 h-4" />
              <span className="hidden sm:inline">
                {t.userDashboard.favourites}
              </span>
            </TabsTrigger>

            <TabsTrigger
              value="reviews"
              className={`gap-2 ${language === "ar" ? "flex-row-reverse" : ""}`}
            >
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">{t.nav.favourites}</span>
            </TabsTrigger>
            <TabsTrigger
              value="payments"
              className={`gap-2 ${language === "ar" ? "flex-row-reverse" : ""}`}
            >
              <Receipt className="w-4 h-4" />
              <span className="hidden sm:inline">
                {t.userDashboard.payments}
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="profile"
              className={`gap-2 ${language === "ar" ? "flex-row-reverse" : ""}`}
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">
                {t.userDashboard.profile}
              </span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <OverviewTab onNavigate={onNavigate} language={language} />
          </TabsContent>

          {/* Trips Tab */}
          <TabsContent value="trips">
            <TripsTab onNavigate={onNavigate} language={language} />
          </TabsContent>

          {/* Favorites Tab */}
          <TabsContent value="favorites">
            <FavoritesTab onNavigate={onNavigate} language={language} />
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews">
            <ReviewsTab onNavigate={onNavigate} language={language} />
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments">
            <PaymentsTab onNavigate={onNavigate} language={language} />
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <ProfileTab
              currentUser={currentUser}
              onUserUpdate={onUserUpdate}
              language={language}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
