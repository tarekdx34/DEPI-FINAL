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
  name: string;
  email: string;
  role: "renter" | "owner";
  avatar?: string;
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("home");
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | undefined>();
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
    const [pageName, queryString] = page.split('?');
    const params = new URLSearchParams(queryString || '');
    
    // Check if registering as host
    if (pageName === 'register' && params.get('role') === 'owner') {
      setRegisterAsHost(true);
    } else if (pageName === 'register') {
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

  const handleLogin = (email: string, password: string) => {
    // Mock login - in a real app, this would validate credentials
    const mockUser: User = {
      name: email.split("@")[0],
      email: email,
      role: "renter",
    };
    setUser(mockUser);
    handleNavigate("user-dashboard");
  };

  const handleRegister = (name: string, email: string, password: string, role: "renter" | "owner") => {
    // Mock registration
    const newUser: User = {
      name: name,
      email: email,
      role: role,
    };
    setUser(newUser);
    
    if (role === "owner") {
      handleHostRegistration();
    } else {
      handleNavigate("home");
    }
  };

  const handleLogout = () => {
    setUser(null);
    setFavourites([]);
    handleNavigate("home");
  };

  const renderPage = () => {
    switch (currentPage) {
      case "home":
        return <HomePage onNavigate={handleNavigate} toggleFavourite={toggleFavourite} isFavourite={isFavourite} language={language} />;
      case "login":
        return <LoginPage onNavigate={handleNavigate} onLogin={handleLogin} language={language} onLanguageChange={setLanguage} />;
      case "register":
        return <RegisterPage onNavigate={handleNavigate} initialRole={registerAsHost ? "owner" : "renter"} onRegister={handleRegister} language={language} onLanguageChange={setLanguage} />;
      case "forgot-password":
        return <ForgotPasswordPage onNavigate={handleNavigate} language={language} onLanguageChange={setLanguage} />;
      case "properties":
        return <PropertiesPage onNavigate={handleNavigate} toggleFavourite={toggleFavourite} isFavourite={isFavourite} language={language} />;
      case "property-details":
        return (
          <PropertyDetailsPage
            propertyId={selectedPropertyId}
            onNavigate={handleNavigate}
            language={language}
          />
        );
      case "booking-confirmation":
        return <BookingConfirmationPage onNavigate={handleNavigate} language={language} />;
      case "user-dashboard":
        return <UserDashboard onNavigate={handleNavigate} language={language} />;
      case "host-dashboard":
        return <HostDashboard onNavigate={handleNavigate} showAddPropertyOnMount={isNewHost} language={language} />;
      case "admin-dashboard":
        return <AdminDashboard onNavigate={handleNavigate} language={language} />;
      case "about":
        return <AboutUsPage onNavigate={handleNavigate} language={language} />;
      case "contact":
        return <ContactPage onNavigate={handleNavigate} language={language} />;
      case "faq":
        return <FAQPage onNavigate={handleNavigate} language={language} />;
      case "support":
        return <SupportPage onNavigate={handleNavigate} language={language} />;
      case "privacy-policy":
        return <PrivacyPolicyPage onNavigate={handleNavigate} language={language} />;
      case "terms":
        return <TermsConditionsPage onNavigate={handleNavigate} language={language} />;
      default:
        return <HomePage onNavigate={handleNavigate} toggleFavourite={toggleFavourite} isFavourite={isFavourite} language={language} />;
    }
  };

  const showNavbar = !["login", "register", "booking-confirmation", "forgot-password"].includes(currentPage);
  const showFooter = !["login", "register", "booking-confirmation", "forgot-password"].includes(currentPage);

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