import { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { HomePage } from "./components/pages/HomePage";
import { LoginPage } from "./components/pages/LoginPage";
import { RegisterPage } from "./components/pages/RegisterPage";
import { PropertiesPage } from "./components/pages/PropertiesPage";
import { PropertyDetailsPage } from "./components/pages/PropertyDetailsPage";
import { BookingConfirmationPage } from "./components/pages/BookingConfirmationPage";
import { UserDashboard } from "./components/pages/UserDashboard";
import { HostDashboard } from "./components/pages/HostDashboard";
import { ForgotPasswordPage } from "./components/pages/ForgotPasswordPage";
import { AdminDashboard } from "./components/pages/AdminDashboard";
import { AboutUsPage } from "./components/pages/AboutUsPage";
import { ContactPage } from "./components/pages/ContactPage";
import { FAQPage } from "./components/pages/FAQPage";
import { SupportPage } from "./components/pages/SupportPage";
import { PrivacyPolicyPage } from "./components/pages/PrivacyPolicyPage";
import { TermsConditionsPage } from "./components/pages/TermsConditionsPage";
import { Toaster } from "./components/ui/sonner";
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
  | "admin-dashboard"
  | "about"
  | "contact"
  | "faq"
  | "support"
  | "privacy-policy"
  | "terms";

export interface Property {
  id: string;
  image: string;
  title: string;
  location: string;
  rating: number;
  reviews: number;
  price: number;
}

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
  const [favourites, setFavourites] = useState<Property[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [language, setLanguage] = useState<Language>("en");

  // Apply RTL direction when language changes
  useEffect(() => {
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = language;
  }, [language]);

  const handleNavigate = (page: string, propertyId?: string) => {
    // Parse query parameters from page string
    const [pageName, queryString] = page.split("?");
    const params = new URLSearchParams(queryString || "");

    // Check if registering as host
    if (pageName === "register" && params.get("role") === "owner") {
      setRegisterAsHost(true);
    } else if (pageName === "register") {
      setRegisterAsHost(false);
    }

    setCurrentPage(pageName as Page);
    if (propertyId) {
      setSelectedPropertyId(propertyId);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleHostRegistration = () => {
    setIsNewHost(true);
    handleNavigate("host-dashboard");
  };

  const toggleFavourite = (property: Property) => {
    setFavourites((prev) => {
      const exists = prev.find((fav) => fav.id === property.id);
      if (exists) {
        return prev.filter((fav) => fav.id !== property.id);
      } else {
        return [...prev, property];
      }
    });
  };

  const isFavourite = (propertyId: string) => {
    return favourites.some((fav) => fav.id === propertyId);
  };

  const removeFavourite = (propertyId: string) => {
    setFavourites((prev) => prev.filter((fav) => fav.id !== propertyId));
  };

  const handleLogin = async (email: string, password: string) => {
    try {
      const response = await api.login(email, password);
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
      toast.success("Login successful!");

      // Navigate based on user type
      if (userProfile.userType === "admin") {
        handleNavigate("admin-dashboard");
      } else if (userProfile.userType === "landlord") {
        handleNavigate("host-dashboard");
      } else {
        handleNavigate("user-dashboard");
      }
    } catch (error) {
      toast.error("Login failed. Please check your credentials.");
      console.error("Login error:", error);
      throw error; // Re-throw to let LoginPage handle the error display
    }
  };

  const handleRegister = async (
    name: string,
    email: string,
    password: string,
    role: "renter" | "owner"
  ) => {
    try {
      const [firstName, lastName] = name.split(" ");
      const response = await api.register({
        email,
        password,
        phoneNumber: "",
        firstName: firstName || name,
        lastName: lastName || "",
        userType: role === "owner" ? "landlord" : "renter",
      });

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
      toast.success("Registration successful!");

      if (role === "owner") {
        handleHostRegistration();
      } else {
        handleNavigate("home");
      }
    } catch (error) {
      toast.error("Registration failed. Please try again.");
      console.error("Registration error:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await api.logout();
      setUser(null);
      setFavourites([]);
      toast.success("Logged out successfully!");
      handleNavigate("home");
    } catch (error) {
      // Even if logout fails, clear local state
      setUser(null);
      setFavourites([]);
      handleNavigate("home");
      console.error("Logout error:", error);
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case "home":
        return (
          <HomePage
            onNavigate={handleNavigate}
            toggleFavourite={toggleFavourite}
            isFavourite={isFavourite}
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
          <PropertiesPage
            onNavigate={handleNavigate}
            toggleFavourite={toggleFavourite}
            isFavourite={isFavourite}
            language={language}
          />
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
        return (
          <UserDashboard onNavigate={handleNavigate} language={language} />
        );
      case "host-dashboard":
        return (
          <HostDashboard
            onNavigate={handleNavigate}
            showAddPropertyOnMount={isNewHost}
            language={language}
          />
        );
      case "admin-dashboard":
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
        return (
          <HomePage
            onNavigate={handleNavigate}
            toggleFavourite={toggleFavourite}
            isFavourite={isFavourite}
            language={language}
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
    <div className="min-h-screen flex flex-col bg-white">
      {showNavbar && (
        <Navbar
          onNavigate={handleNavigate}
          currentPage={currentPage}
          favourites={favourites}
          onRemoveFavourite={removeFavourite}
          onSelectFavourite={handleNavigate}
          user={user}
          onLogout={handleLogout}
          language={language}
          onLanguageChange={setLanguage}
        />
      )}
      <main className="flex-1">{renderPage()}</main>
      {showFooter && <Footer onNavigate={handleNavigate} language={language} />}
      <Toaster />
    </div>
  );
}
