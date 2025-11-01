import { useState } from "react";
import {
  Menu,
  X,
  Globe,
  Heart,
  Star,
  Trash2,
  User,
  LogOut,
  LayoutDashboard,
} from "lucide-react";
import { Button } from "./ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetDescription,
} from "./ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";
import { Badge } from "./ui/badge";
import { Property, User as UserType } from "../App";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Avatar, AvatarFallback } from "./ui/avatar";

interface NavbarProps {
  onNavigate?: (page: string) => void;
  currentPage?: string;
  favourites?: Property[];
  onRemoveFavourite?: (propertyId: string) => void;
  onSelectFavourite?: (page: string, propertyId?: string) => void;
  user?: UserType | null;
  onLogout?: () => void;
  language?: "en" | "ar";
  onLanguageChange?: (language: "en" | "ar") => void;
}

export function Navbar({
  onNavigate,
  currentPage = "home",
  favourites = [],
  onRemoveFavourite,
  onSelectFavourite,
  user = null,
  onLogout,
  language = "en",
  onLanguageChange,
}: NavbarProps) {
  const [localLanguage, setLocalLanguage] = useState<"en" | "ar">(language);

  const toggleLanguage = () => {
    const newLang = localLanguage === "en" ? "ar" : "en";
    setLocalLanguage(newLang);
    if (onLanguageChange) {
      onLanguageChange(newLang);
    }
  };

  const handleNavigation = (page: string) => {
    if (onNavigate) {
      console.log('🔄 Navbar navigation to:', page);
      onNavigate(page);
    }
  };

  // ✅ CRITICAL FIX: Get correct dashboard based on user type
  const getDashboardPage = () => {
    if (!user) return "user-dashboard";
    
    console.log('🎯 Getting dashboard for user:', user.userType, user.role);
    
    // Check userType first (from backend)
    if (user.userType === "landlord") {
      return "owner-dashboard";
    }
    if (user.userType === "admin") {
      return "admin-dashboard";
    }
    
    // Fallback to role
    if (user.role === "owner") {
      return "owner-dashboard";
    }
    if (user.role === "admin") {
      return "admin-dashboard";
    }
    
    return "user-dashboard";
  };

  const isArabic = localLanguage === "ar";

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <button
            onClick={() => handleNavigation("home")}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="w-10 h-10 bg-[#00BFA6] rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xl">A</span>
            </div>
            <span className="font-bold text-2xl text-[#2B2B2B]">Ajarly</span>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <button
              onClick={() => handleNavigation("properties")}
              className="text-[#2B2B2B] hover:text-[#00BFA6] transition-colors"
            >
              {isArabic ? "استكشف" : "Explore"}
            </button>
            <button
              onClick={() => handleNavigation("register?role=owner")}
              className="text-[#2B2B2B] hover:text-[#00BFA6] transition-colors"
            >
              {isArabic ? "كن مضيفاً" : "Become a Host"}
            </button>

            {/* Favourites */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Heart className="w-5 h-5" />
                  {favourites.length > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-[#FF6B6B] hover:bg-[#FF6B6B]">
                      {favourites.length}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent className="w-full sm:max-w-md">
                <SheetTitle className="text-2xl font-semibold text-[#2B2B2B] mb-6">
                  {isArabic ? "المفضلة" : "Favourites"}
                </SheetTitle>
                <SheetDescription className="sr-only">
                  {isArabic
                    ? "قائمة العقارات المفضلة لديك"
                    : "Your saved favourite properties"}
                </SheetDescription>
                <div className="flex flex-col h-full">
                  {favourites.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
                      <Heart className="w-16 h-16 text-gray-300 mb-4" />
                      <h3 className="text-xl font-semibold text-[#2B2B2B] mb-2">
                        {isArabic ? "لا توجد مفضلات بعد" : "No favourites yet"}
                      </h3>
                      <p className="text-gray-600 mb-6">
                        {isArabic
                          ? "ابدأ بإضافة عقارات إلى قائمة المفضلة الخاصة بك"
                          : "Start adding properties to your favourites list"}
                      </p>
                      <Button
                        onClick={() => {
                          handleNavigation("properties");
                        }}
                        className="bg-[#00BFA6] hover:bg-[#00A890]"
                      >
                        {isArabic ? "استكشف العقارات" : "Explore Properties"}
                      </Button>
                    </div>
                  ) : (
                    <div className="flex-1 overflow-y-auto space-y-4">
                      {favourites.map((property) => (
                        <div
                          key={property.id}
                          className="group flex gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div
                            className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer"
                            onClick={() => {
                              if (onSelectFavourite) {
                                onSelectFavourite(
                                  "property-details",
                                  property.id
                                );
                              }
                            }}
                          >
                            <ImageWithFallback
                              src={property.image}
                              alt={property.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3
                              className="font-semibold text-[#2B2B2B] line-clamp-1 cursor-pointer hover:text-[#00BFA6]"
                              onClick={() => {
                                if (onSelectFavourite) {
                                  onSelectFavourite(
                                    "property-details",
                                    property.id
                                  );
                                }
                              }}
                            >
                              {property.title}
                            </h3>
                            <p className="text-sm text-gray-600 line-clamp-1">
                              {property.location}
                            </p>
                            <div className="flex items-center gap-1 mt-1">
                              <Star className="w-3 h-3 fill-[#2B2B2B] text-[#2B2B2B]" />
                              <span className="text-sm">{property.rating}</span>
                            </div>
                            <p className="text-sm font-semibold text-[#2B2B2B] mt-1">
                              {property.price} EGP /{" "}
                              {isArabic ? "ليلة" : "night"}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => {
                              if (onRemoveFavourite) {
                                onRemoveFavourite(property.id);
                              }
                            }}
                          >
                            <Trash2 className="w-4 h-4 text-[#FF6B6B]" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>

            {/* Language Toggle */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <Globe className="w-4 h-4" />
                  <span>{localLanguage.toUpperCase()}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => {
                    setLocalLanguage("en");
                    if (onLanguageChange) onLanguageChange("en");
                  }}
                >
                  English
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setLocalLanguage("ar");
                    if (onLanguageChange) onLanguageChange("ar");
                  }}
                >
                  العربية
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Menu or Auth Buttons */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-[#00BFA6] text-white">
                        {user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden lg:inline">{user.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-semibold text-[#2B2B2B]">
                      {user.name}
                    </p>
                    <p className="text-xs text-gray-600">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  
                  {/* ✅ CRITICAL FIX: Dashboard navigation */}
                  <DropdownMenuItem
                    onClick={() => {
                      const dashboardPage = getDashboardPage();
                      console.log('🏠 Navigating to dashboard:', dashboardPage);
                      handleNavigation(dashboardPage);
                    }}
                    className="cursor-pointer"
                  >
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    {isArabic ? "لوحة التحكم" : "Dashboard"}
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem 
                    onClick={() => {
                      console.log('👋 Logging out...');
                      if (onLogout) {
                        onLogout();
                      }
                    }}
                    className="text-red-600 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    {isArabic ? "تسجيل الخروج" : "Log out"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => handleNavigation("login")}
                  className="border-[#00BFA6] text-[#00BFA6] hover:bg-[#00BFA6] hover:text-white"
                >
                  {isArabic ? "تسجيل الدخول" : "Log in"}
                </Button>
                <Button
                  onClick={() => handleNavigation("register")}
                  className="bg-[#FF6B6B] text-white hover:bg-[#FF5252]"
                >
                  {isArabic ? "إنشاء حساب" : "Sign up"}
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetTitle className="text-2xl font-semibold text-[#2B2B2B] mb-6">
                {isArabic ? "القائمة" : "Menu"}
              </SheetTitle>
              <SheetDescription className="sr-only">
                {isArabic ? "قائمة التنقل الرئيسية" : "Main navigation menu"}
              </SheetDescription>
              <div className="flex flex-col gap-6 mt-8">
                {user ? (
                  <>
                    {/* User Info */}
                    <div className="pb-4 border-b">
                      <p className="text-sm font-semibold text-[#2B2B2B]">
                        {user.name}
                      </p>
                      <p className="text-xs text-gray-600">{user.email}</p>
                    </div>
                    
                    {/* ✅ Dashboard Button for Mobile */}
                    <Button
                      variant="outline"
                      onClick={() => {
                        const dashboardPage = getDashboardPage();
                        console.log('📱 Mobile dashboard navigation:', dashboardPage);
                        handleNavigation(dashboardPage);
                      }}
                      className="justify-start gap-2 border-[#00BFA6] text-[#00BFA6]"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      {isArabic ? "لوحة التحكم" : "Dashboard"}
                    </Button>
                    
                    <button
                      onClick={() => handleNavigation("properties")}
                      className="text-left text-lg text-[#2B2B2B] hover:text-[#00BFA6] transition-colors"
                    >
                      {isArabic ? "استكشف" : "Explore"}
                    </button>
                    
                    {/* Logout Button */}
                    <Button
                      variant="outline"
                      onClick={() => {
                        console.log('👋 Mobile logout');
                        if (onLogout) {
                          onLogout();
                        }
                      }}
                      className="justify-start gap-2 border-red-600 text-red-600"
                    >
                      <LogOut className="w-4 h-4" />
                      {isArabic ? "تسجيل الخروج" : "Log out"}
                    </Button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => handleNavigation("properties")}
                      className="text-left text-lg text-[#2B2B2B] hover:text-[#00BFA6] transition-colors"
                    >
                      {isArabic ? "استكشف" : "Explore"}
                    </button>
                    <button
                      onClick={() => handleNavigation("register?role=owner")}
                      className="text-left text-lg text-[#2B2B2B] hover:text-[#00BFA6] transition-colors"
                    >
                      {isArabic ? "كن مضيفاً" : "Become a Host"}
                    </button>
                    <Button
                      variant="outline"
                      onClick={() => handleNavigation("login")}
                      className="justify-start border-[#00BFA6] text-[#00BFA6]"
                    >
                      {isArabic ? "تسجيل الدخول" : "Log in"}
                    </Button>
                    <Button
                      onClick={() => handleNavigation("register")}
                      className="justify-start bg-[#FF6B6B] text-white"
                    >
                      {isArabic ? "إنشاء حساب" : "Sign up"}
                    </Button>
                  </>
                )}
                
                <Button
                  variant="ghost"
                  onClick={toggleLanguage}
                  className="justify-start gap-2"
                >
                  <Globe className="w-4 h-4" />
                  <span>{localLanguage === "en" ? "العربية" : "English"}</span>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}