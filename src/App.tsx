// src/App.tsx - Enhanced Version with Fixed Navbar Props
import { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { HomePage } from "./components/pages/HomePage";
import { LoginPage } from "./components/pages/LoginPage";
import { RegisterPage } from "./components/pages/RegisterPage";
import { PropertiesPage } from "./components/pages/PropertiesPage";
import { PropertyDetailsPage } from "./components/pages/PropertyDetailsPage";
import { BookingConfirmationPage } from "./components/pages/BookingConfirmationPage";
import { RenterDashboard } from "./components/dashboard/renter/RenterDashboard";
import { OwnerDashboard } from "./components/dashboard/owner/OwnerDashboard";
import { ForgotPasswordPage } from "./components/pages/ForgotPasswordPage";
import { AdminDashboard } from "./components/dashboard/admin/AdminDashboard";
import { AboutUsPage } from "./components/pages/AboutUsPage";
import { ContactPage } from "./components/pages/ContactPage";
import { FAQPage } from "./components/pages/FAQPage";
import { SupportPage } from "./components/pages/SupportPage";
import { PrivacyPolicyPage } from "./components/pages/PrivacyPolicyPage";
import { TermsConditionsPage } from "./components/pages/TermsConditionsPage";
import { Toaster } from "./components/ui/sonner";
import { FavoritesProvider } from "./contexts/FavoritesContext";
import { Language } from "./lib/translations";
import api from "../api";
import { toast } from "sonner";

type Page =
  | "home"
  | "login"
  | "register"
  | "forgot-password"
  | "properties"
  | "property-details"
  | "booking-confirmation"
  | "user-dashboard"
  | "host-dashboard"
  | "owner-dashboard"
  | "admin-dashboard"
  | "about"
  | "contact"
  | "faq"
  | "support"
  | "privacy-policy"
  | "terms";

export interface User {
  userId: number;
  name: string;
  email: string;
  role: "renter" | "owner" | "admin";
  avatar?: string;
  phoneNumber?: string;
  isActive?: boolean;
  userType?: string;
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("home");
  const [selectedPropertyId, setSelectedPropertyId] = useState<
    string | undefined
  >();
  const [registerAsHost, setRegisterAsHost] = useState(false);
  const [isNewHost, setIsNewHost] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [language, setLanguage] = useState<Language>("en");
  const [isNavigating, setIsNavigating] = useState(false);

  // ✅ Check for existing auth on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("authToken");
      if (token) {
        try {
          const userProfile = await api.getProfile();
          const user: User = {
            userId: userProfile.userId,
            name: userProfile.firstName + " " + userProfile.lastName,
            email: userProfile.email,
            role:
              userProfile.userType === "landlord"
                ? "owner"
                : userProfile.userType === "admin"
                ? "admin"
                : "renter",
            avatar: userProfile.profilePhoto,
            phoneNumber: userProfile.phoneNumber,
            isActive: userProfile.isActive,
            userType: userProfile.userType,
          };
          setUser(user);
          console.log("✅ Auth restored for:", user.email);
        } catch (error) {
          console.error("❌ Auth check failed:", error);
          localStorage.removeItem("authToken");
        }
      }
    };

    checkAuth();
  }, []);

  // ✅ Apply RTL direction when language changes
  useEffect(() => {
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = language;
  }, [language]);

  // ✅ Navigation handler
  const handleNavigate = (page: string, propertyId?: string) => {
    console.log(
      "🔄 Navigation requested to:",
      page,
      propertyId ? `Property: ${propertyId}` : ""
    );

    setIsNavigating(true);

    const [pageName, queryString] = page.split("?");
    const params = new URLSearchParams(queryString || "");

    if (pageName === "register" && params.get("role") === "owner") {
      setRegisterAsHost(true);
    } else if (pageName === "register") {
      setRegisterAsHost(false);
    }

    setCurrentPage(pageName as Page);

    if (propertyId) {
      setSelectedPropertyId(propertyId);
    }

    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
      setIsNavigating(false);
    });

    console.log("✅ Navigation complete. Current page:", pageName);
  };

  const handleHostRegistration = () => {
    console.log("🏠 New host registration");
    setIsNewHost(true);
    handleNavigate("owner-dashboard");
  };

  // ✅ Login handler
  const handleLogin = async (email: string, password: string) => {
    try {
      console.log("1️⃣ Starting login for:", email);

      const response = await api.login(email, password);
      console.log("2️⃣ Login response received:", response);

      const userProfile = await api.getProfile();
      console.log("3️⃣ User profile loaded:", userProfile);

      const user: User = {
        userId: userProfile.userId,
        name: userProfile.firstName + " " + userProfile.lastName,
        email: userProfile.email,
        role:
          userProfile.userType === "landlord"
            ? "owner"
            : userProfile.userType === "admin"
            ? "admin"
            : "renter",
        avatar: userProfile.profilePhoto,
        phoneNumber: userProfile.phoneNumber,
        isActive: userProfile.isActive,
        userType: userProfile.userType,
      };

      setUser(user);
      console.log("4️⃣ User state updated:", user);

      toast.success(`Welcome back, ${user.name}!`);

      let targetPage: Page;

      if (userProfile.userType === "admin") {
        targetPage = "admin-dashboard";
      } else if (userProfile.userType === "landlord") {
        targetPage = "owner-dashboard";
      } else {
        targetPage = "user-dashboard";
      }

      console.log("5️⃣ Navigating to:", targetPage);

      setTimeout(() => {
        handleNavigate(targetPage);
      }, 100);
    } catch (error: any) {
      console.error("❌ Login error:", error);

      const errorMessage =
        error?.message ||
        error?.data?.message ||
        "Login failed. Please check your credentials.";
      toast.error(errorMessage);

      throw error;
    }
  };

  // ✅ Register handler
  const handleRegister = async (
    name: string,
    email: string,
    password: string,
    role: "renter" | "owner"
  ) => {
    try {
      console.log("📝 Starting registration:", { email, role });

      const [firstName, lastName] = name.split(" ");
      const response = await api.register({
        email,
        password,
        phoneNumber: "",
        firstName: firstName || name,
        lastName: lastName || "",
        userType: role === "owner" ? "landlord" : "renter",
      });

      console.log("✅ Registration successful:", response);

      const userProfile = await api.getProfile();

      const user: User = {
        userId: userProfile.userId,
        name: userProfile.firstName + " " + userProfile.lastName,
        email: userProfile.email,
        role:
          userProfile.userType === "landlord"
            ? "owner"
            : userProfile.userType === "admin"
            ? "admin"
            : "renter",
        avatar: userProfile.profilePhoto,
        phoneNumber: userProfile.phoneNumber,
        isActive: userProfile.isActive,
        userType: userProfile.userType,
      };

      setUser(user);
      toast.success(`Welcome to Ajarly, ${user.name}!`);

      setTimeout(() => {
        if (role === "owner") {
          handleHostRegistration();
        } else {
          handleNavigate("home");
        }
      }, 100);
    } catch (error: any) {
      console.error("❌ Registration error:", error);

      const errorMessage =
        error?.message ||
        error?.data?.message ||
        "Registration failed. Please try again.";
      toast.error(errorMessage);
    }
  };

  // ✅ Logout handler
  const handleLogout = async () => {
    try {
      console.log("👋 Logging out user:", user?.email);

      await api.logout();
      setUser(null);

      toast.success("Logged out successfully!");

      setTimeout(() => {
        handleNavigate("home");
      }, 100);
    } catch (error) {
      console.error("❌ Logout error:", error);

      setUser(null);
      handleNavigate("home");
    }
  };

  // ✅ Render page
  const renderPage = () => {
    console.log(
      "🎯 Rendering page:",
      currentPage,
      "User:",
      user?.userType || "Not logged in"
    );

    if (isNavigating) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#F9F6F1]">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-[#00BFA6] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      );
    }

    switch (currentPage) {
      case "home":
        return (
          <HomePage
            onNavigate={handleNavigate}
            language={language}
            user={user}
          />
        );

      case "login":
        return (
          <LoginPage
            onNavigate={handleNavigate}
            onLogin={handleLogin}
            language={language}
            onLanguageChange={setLanguage}
          />
        );

      case "register":
        return (
          <RegisterPage
            onNavigate={handleNavigate}
            initialRole={registerAsHost ? "owner" : "renter"}
            onRegister={handleRegister}
            language={language}
            onLanguageChange={setLanguage}
          />
        );

      case "forgot-password":
        return (
          <ForgotPasswordPage
            onNavigate={handleNavigate}
            language={language}
            onLanguageChange={setLanguage}
          />
        );

      case "properties":
        return (
          <PropertiesPage onNavigate={handleNavigate} language={language} />
        );

      case "property-details":
        return (
          <PropertyDetailsPage
            propertyId={selectedPropertyId}
            onNavigate={handleNavigate}
            language={language}
          />
        );

      case "booking-confirmation":
        return (
          <BookingConfirmationPage
            onNavigate={handleNavigate}
            language={language}
          />
        );

      case "user-dashboard":
        console.log("🏠 Rendering RenterDashboard");
        return (
          <RenterDashboard
            onNavigate={handleNavigate}
            currentUser={user}
            onUserUpdate={setUser}
          />
        );

      case "owner-dashboard":
        console.log("🏠 Rendering OwnerDashboard for:", user?.name);
        return (
          <OwnerDashboard
            onNavigate={handleNavigate}
            showAddPropertyOnMount={isNewHost}
          />
        );

      case "admin-dashboard":
        console.log("👑 Rendering AdminDashboard");
        return (
          <AdminDashboard onNavigate={handleNavigate} language={language} />
        );

      case "about":
        return <AboutUsPage onNavigate={handleNavigate} language={language} />;

      case "contact":
        return <ContactPage onNavigate={handleNavigate} language={language} />;

      case "faq":
        return <FAQPage onNavigate={handleNavigate} language={language} />;

      case "support":
        return <SupportPage onNavigate={handleNavigate} language={language} />;

      case "privacy-policy":
        return (
          <PrivacyPolicyPage onNavigate={handleNavigate} language={language} />
        );

      case "terms":
        return (
          <TermsConditionsPage
            onNavigate={handleNavigate}
            language={language}
          />
        );

      default:
        console.warn("⚠️ Unknown page:", currentPage, "Redirecting to home");
        setTimeout(() => handleNavigate("home"), 0);
        return (
          <HomePage
            onNavigate={handleNavigate}
            language={language}
            user={user}
          />
        );
    }
  };

  const showNavbar = ![
    "login",
    "register",
    "booking-confirmation",
    "forgot-password",
  ].includes(currentPage);

  const showFooter = ![
    "login",
    "register",
    "booking-confirmation",
    "forgot-password",
  ].includes(currentPage);

  return (
    <FavoritesProvider>
      <div className="min-h-screen flex flex-col bg-white">
        {showNavbar && (
          <Navbar
            onNavigate={handleNavigate}
            currentPage={currentPage}
            user={user}
            onLogout={handleLogout}
            language={language}
            onLanguageChange={setLanguage}
          />
        )}

        <main className="flex-1">{renderPage()}</main>

        {showFooter && (
          <Footer onNavigate={handleNavigate} language={language} />
        )}

        <Toaster position="top-right" richColors closeButton duration={4000} />
      </div>
    </FavoritesProvider>
  );
}
