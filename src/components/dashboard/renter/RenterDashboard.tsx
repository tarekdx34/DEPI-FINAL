// src/components/dashboard/renter/RenterDashboard.tsx
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { DashboardOverview } from "./DashboardOverview";
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
}

export function RenterDashboard({
  onNavigate,
  currentUser,
  onUserUpdate,
}: RenterDashboardProps) {
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
    <div className="min-h-screen bg-[#F9F6F1]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-semibold text-[#2B2B2B] mb-8">
          My Dashboard
        </h1>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full max-w-4xl grid-cols-6 mb-8">
            <TabsTrigger value="overview" className="gap-2">
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="trips" className="gap-2">
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Trips</span>
            </TabsTrigger>
            <TabsTrigger value="favorites" className="gap-2">
              <Heart className="w-4 h-4" />
              <span className="hidden sm:inline">Favorites</span>
            </TabsTrigger>
            <TabsTrigger value="reviews" className="gap-2">
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">Reviews</span>
            </TabsTrigger>
            <TabsTrigger value="payments" className="gap-2">
              <Receipt className="w-4 h-4" />
              <span className="hidden sm:inline">Payments</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="gap-2">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <DashboardOverview onNavigate={onNavigate} />
          </TabsContent>

          {/* Trips Tab */}
          <TabsContent value="trips">
            <TripsTab onNavigate={onNavigate} />
          </TabsContent>

          {/* Favorites Tab */}
          <TabsContent value="favorites">
            <FavoritesTab onNavigate={onNavigate} />
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews">
            <ReviewsTab onNavigate={onNavigate} />
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments">
            <PaymentsTab onNavigate={onNavigate} />
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <ProfileTab currentUser={currentUser} onUserUpdate={onUserUpdate} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
