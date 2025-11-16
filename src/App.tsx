// src/App.tsx - Fixed registration state update
import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
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

export interface User {
  userId: number;
  name: string;
  email: string;
  role: "renter" | "owner" | "admin";
  avatar?: string;
  phoneNumber?: string;
  isActive?: boolean;
  userType?: string;
  profilePhoto?: string;
}

// Protected Route Component
function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles?: ("renter" | "owner" | "admin")[];
}) {
  const token = localStorage.getItem("authToken");
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role checking would require user state - handled in parent
  return <>{children}</>;
}

// Main App Layout Component
function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [language, setLanguage] = useState<Language>("en");
  const [isNewHost, setIsNewHost] = useState(false);

  // Check auth on mount
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
            profilePhoto: userProfile.profilePhoto,
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

  // Apply RTL direction
  useEffect(() => {
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = language;
  }, [language]);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  // Navigation handler (converts old string-based navigation to router navigation)
  const handleNavigate = (
    page: string,
    propertyId?: string,
    searchParams?: URLSearchParams
  ) => {
    console.log("🔄 Navigation requested to:", page, propertyId);

    const [pageName, queryString] = page.split("?");
    const params = new URLSearchParams(queryString || "");

    // Map old page names to routes
    const routeMap: Record<string, string> = {
      home: "/",
      login: "/login",
      register:
        params.get("role") === "owner" ? "/register?role=owner" : "/register",
      "forgot-password": "/forgot-password",
      properties: "/properties",
      "property-details": propertyId
        ? `/properties/${propertyId}`
        : "/properties",
      "booking-confirmation": "/booking/confirmation",
      "user-dashboard": "/dashboard/renter",
      "owner-dashboard": "/dashboard/owner",
      "admin-dashboard": "/dashboard/admin",
      about: "/about",
      contact: "/contact",
      faq: "/faq",
      support: "/support",
      "privacy-policy": "/privacy",
      terms: "/terms",
    };

    let route = routeMap[pageName] || "/";
    if (searchParams && searchParams.toString()) {
      route += `?${searchParams.toString()}`;
      console.log("✅ Final route with params:", route);
    }
    navigate(route);
  };

  const handleHostRegistration = () => {
    console.log("🏠 New host registration");
    setIsNewHost(true);
    navigate("/dashboard/owner");
  };

  // Login handler
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
        profilePhoto: userProfile.profilePhoto,
        phoneNumber: userProfile.phoneNumber,
        isActive: userProfile.isActive,
        userType: userProfile.userType,
      };

      setUser(user);
      console.log("4️⃣ User state updated:", user);

      toast.success(`Welcome back, ${user.name}!`);

      let targetRoute: string;

      if (userProfile.userType === "admin") {
        targetRoute = "/dashboard/admin";
      } else if (userProfile.userType === "landlord") {
        targetRoute = "/dashboard/owner";
      } else {
        targetRoute = "/dashboard/renter";
      }

      console.log("5️⃣ Navigating to:", targetRoute);

      setTimeout(() => {
        navigate(targetRoute);
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

  // Register handler - FIXED VERSION
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

      console.log("✅ Registration response:", response);

      // Immediately fetch the user profile
      const userProfile = await api.getProfile();
      console.log("✅ Profile fetched:", userProfile);

      // Create the user object
      const newUser: User = {
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
        profilePhoto: userProfile.profilePhoto,
        phoneNumber: userProfile.phoneNumber,
        isActive: userProfile.isActive,
        userType: userProfile.userType,
      };

      // CRITICAL: Set user state BEFORE navigation
      console.log("✅ Setting user state:", newUser);
      setUser(newUser);

      // Show success message
      toast.success(`Welcome to Ajarly, ${newUser.name}!`);

      // Wait a bit to ensure state updates propagate
      await new Promise((resolve) => setTimeout(resolve, 150));

      // Navigate to the appropriate dashboard
      console.log("✅ Navigating to dashboard for role:", role);
      if (role === "owner") {
        setIsNewHost(true);
        navigate("/dashboard/owner");
      } else {
        navigate("/dashboard/renter");
      }
    } catch (error: any) {
      console.error("❌ Registration error:", error);

      const errorMessage =
        error?.message ||
        error?.data?.message ||
        "Registration failed. Please try again.";
      toast.error(errorMessage);

      throw error; // Re-throw so the RegisterPage can handle it
    }
  };

  // Logout handler
  const handleLogout = async () => {
    try {
      console.log("👋 Logging out user:", user?.email);

      await api.logout();
      setUser(null);

      toast.success("Logged out successfully!");

      setTimeout(() => {
        navigate("/");
      }, 100);
    } catch (error) {
      console.error("❌ Logout error:", error);

      setUser(null);
      navigate("/");
    }
  };

  const hideNavFooter = [
    "/login",
    "/register",
    "/booking/confirmation",
    "/forgot-password",
  ];
  const showNavbar = !hideNavFooter.some((path) =>
    location.pathname.startsWith(path)
  );
  const showFooter = showNavbar;

  console.log("🔍 Current user state in App:", user);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {showNavbar && (
        <Navbar
          onNavigate={handleNavigate}
          currentPage={location.pathname}
          user={user}
          onLogout={handleLogout}
          language={language}
          onLanguageChange={setLanguage}
        />
      )}

      <main className="flex-1">
        <Routes>
          {/* Public Routes */}
          <Route
            path="/"
            element={
              <HomePage
                onNavigate={handleNavigate}
                language={language}
                user={user}
              />
            }
          />

          <Route
            path="/properties"
            element={
              <PropertiesPage onNavigate={handleNavigate} language={language} />
            }
          />

          <Route
            path="/properties/:id"
            element={
              <PropertyDetailsPage
                onNavigate={handleNavigate}
                language={language}
              />
            }
          />

          <Route
            path="/about"
            element={
              <AboutUsPage onNavigate={handleNavigate} language={language} />
            }
          />

          <Route
            path="/contact"
            element={
              <ContactPage onNavigate={handleNavigate} language={language} />
            }
          />

          <Route
            path="/faq"
            element={
              <FAQPage onNavigate={handleNavigate} language={language} />
            }
          />

          <Route
            path="/support"
            element={
              <SupportPage onNavigate={handleNavigate} language={language} />
            }
          />

          <Route
            path="/privacy"
            element={
              <PrivacyPolicyPage
                onNavigate={handleNavigate}
                language={language}
              />
            }
          />

          <Route
            path="/terms"
            element={
              <TermsConditionsPage
                onNavigate={handleNavigate}
                language={language}
              />
            }
          />

          {/* Auth Routes */}
          <Route
            path="/login"
            element={
              <LoginPage
                onNavigate={handleNavigate}
                onLogin={handleLogin}
                language={language}
                onLanguageChange={setLanguage}
              />
            }
          />

          <Route
            path="/register"
            element={
              <RegisterPage
                onNavigate={handleNavigate}
                initialRole={
                  new URLSearchParams(location.search).get("role") === "owner"
                    ? "owner"
                    : "renter"
                }
                onRegister={handleRegister}
                language={language}
                onLanguageChange={setLanguage}
              />
            }
          />

          <Route
            path="/forgot-password"
            element={
              <ForgotPasswordPage
                onNavigate={handleNavigate}
                language={language}
                onLanguageChange={setLanguage}
              />
            }
          />

          {/* Booking Route */}
          <Route
            path="/booking/confirmation"
            element={
              <BookingConfirmationPage
                onNavigate={handleNavigate}
                language={language}
              />
            }
          />

          {/* Protected Dashboard Routes */}
          <Route
            path="/dashboard/renter/*"
            element={
              <ProtectedRoute allowedRoles={["renter"]}>
                <RenterDashboard
                  onNavigate={handleNavigate}
                  currentUser={user}
                  onUserUpdate={setUser}
                />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/owner/*"
            element={
              <ProtectedRoute allowedRoles={["owner"]}>
                <OwnerDashboard
                  onNavigate={handleNavigate}
                  showAddPropertyOnMount={isNewHost}
                />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/admin/*"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard
                  onNavigate={handleNavigate}
                  language={language}
                />
              </ProtectedRoute>
            }
          />

          {/* Catch all - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {showFooter && <Footer onNavigate={handleNavigate} language={language} />}

      <Toaster position="top-right" richColors closeButton duration={4000} />
    </div>
  );
}

export default function App() {
  return (
    <FavoritesProvider>
      <Router>
        <AppLayout />
      </Router>
    </FavoritesProvider>
  );
}
