// src/components/pages/HomePage.tsx - Updated with 3D Waves
import {
  Search,
  Shield,
  Users,
  Clock,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { Button } from "../ui/button";
import { PropertyCard } from "../PropertyCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar } from "../ui/calendar";
import { format } from "date-fns";
import { useState, useEffect, useRef } from "react";
import { Language, translations } from "../../lib/translations";
import api, { PropertyResponse, PopularLocation } from "../../../api";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import logo from "../../../assets/Logo.svg";
interface HomePageProps {
  onNavigate: (page: string, propertyId?: string) => void;
  language?: Language;
  user?: any | null;
}

// 3D Ocean Waves Component
function OceanWaves() {
  const meshRef = useRef<THREE.Mesh>(null);

  useEffect(() => {
    if (meshRef.current) {
      const geometry = meshRef.current.geometry as THREE.PlaneGeometry;
      const positionAttribute = geometry.attributes.position;

      // Store original positions
      const originalPositions: { x: number; y: number; z: number }[] = [];
      for (let i = 0; i < positionAttribute.count; i++) {
        originalPositions.push({
          x: positionAttribute.getX(i),
          y: positionAttribute.getY(i),
          z: positionAttribute.getZ(i),
        });
      }
      (meshRef.current as any).userData.originalPositions = originalPositions;
    }
  }, []);

  useFrame((state) => {
    if (
      meshRef.current &&
      (meshRef.current as any).userData.originalPositions
    ) {
      const time = state.clock.getElapsedTime();
      const geometry = meshRef.current.geometry as THREE.PlaneGeometry;
      const positionAttribute = geometry.attributes.position;
      const originalPositions = (meshRef.current as any).userData
        .originalPositions;

      for (let i = 0; i < positionAttribute.count; i++) {
        const x = originalPositions[i].x;
        const y = originalPositions[i].y;

        // Create wave effect
        const waveX = Math.sin(x * 0.5 + time * 0.8) * 0.3;
        const waveY = Math.sin(y * 0.5 + time * 0.6) * 0.3;
        const waveXY = Math.sin((x + y) * 0.3 + time) * 0.2;

        positionAttribute.setZ(i, waveX + waveY + waveXY);
      }

      positionAttribute.needsUpdate = true;
      geometry.computeVertexNormals();
    }
  });

  return (
    <mesh
      ref={meshRef}
      rotation={[-Math.PI / 2.5, 0, 0]}
      position={[0, -2, -5]}
    >
      <planeGeometry args={[20, 20, 64, 64]} />
      <meshStandardMaterial
        color="#06b6d4"
        transparent
        opacity={0.6}
        side={THREE.DoubleSide}
        wireframe={false}
        metalness={0.3}
        roughness={0.4}
      />
    </mesh>
  );
}

// Island Component
function Island() {
  const meshRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y =
        Math.sin(state.clock.getElapsedTime() * 0.3) * 0.1;
    }
  });

  return (
    <group ref={meshRef} position={[3, -1, -3]}>
      {/* Island base */}
      <mesh position={[0, 0, 0]}>
        <coneGeometry args={[1.5, 2, 8]} />
        <meshStandardMaterial color="#8b7355" />
      </mesh>
      {/* Palm tree trunk */}
      <mesh position={[0, 1.5, 0]}>
        <cylinderGeometry args={[0.1, 0.15, 1.5, 8]} />
        <meshStandardMaterial color="#6b4423" />
      </mesh>
      {/* Palm leaves */}
      {[0, 1, 2, 3].map((i) => (
        <mesh
          key={i}
          position={[
            Math.cos((i * Math.PI) / 2) * 0.3,
            2.3,
            Math.sin((i * Math.PI) / 2) * 0.3,
          ]}
          rotation={[0, (i * Math.PI) / 2, Math.PI / 4]}
        >
          <boxGeometry args={[0.8, 0.1, 0.2]} />
          <meshStandardMaterial color="#2d5016" />
        </mesh>
      ))}
    </group>
  );
}

// 3D Scene Component
function Scene3D() {
  return (
    <Canvas
      camera={{ position: [0, 2, 8], fov: 60 }}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
      }}
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <pointLight position={[-5, 5, 5]} intensity={0.5} color="#ffd700" />

      <OceanWaves />
      <Island />

      {/* Sky gradient background */}
      <mesh position={[0, 0, -10]}>
        <planeGeometry args={[50, 50]} />
        <meshBasicMaterial color="#87ceeb" />
      </mesh>
    </Canvas>
  );
}

export function HomePage({ onNavigate, language = "en", user }: HomePageProps) {
  const t = translations[language]?.home || translations.en.home;
  const [location, setLocation] = useState("");
  const [checkIn, setCheckIn] = useState<Date | undefined>();
  const [checkOut, setCheckOut] = useState<Date | undefined>();
  const [guests, setGuests] = useState("");
  const [scrollY, setScrollY] = useState(0);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const [featuredProperties, setFeaturedProperties] = useState<
    PropertyResponse[]
  >([]);
  const [popularLocations, setPopularLocations] = useState<PopularLocation[]>(
    []
  );
  const [governorates, setGovernorates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadHomeData();

    const handleFocus = () => {
      if (!loading) {
        handleRefresh();
      }
    };

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("focus", handleFocus);
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const loadHomeData = async () => {
    try {
      setLoading(true);
      setError(null);

      const propertiesResponse = await api.getProperties({
        page: 0,
        size: 8,
        sortBy: "averageRating",
        sortDirection: "DESC",
      });
      if (propertiesResponse?.content) {
        setFeaturedProperties(propertiesResponse.content);
      }

      const locationsResponse = await api.getPopularLocations(3);
      if (locationsResponse) {
        setPopularLocations(locationsResponse);
      }

      const governoratesResponse = await api.getGovernorates();
      if (governoratesResponse) {
        setGovernorates(governoratesResponse);
      }
    } catch (err: any) {
      console.error("Error loading home data:", err);
      setError(
        err?.message || "Failed to load properties. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      const propertiesResponse = await api.getProperties({
        page: 0,
        size: 8,
        sortBy: "createdAt",
        sortDirection: "DESC",
      });
      if (propertiesResponse?.content) {
        setFeaturedProperties(propertiesResponse.content);
      }
    } catch (err) {
      console.error("Error refreshing:", err);
    } finally {
      setRefreshing(false);
    }
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (location) params.set("governorate", location);
    if (checkIn) params.set("checkInDate", checkIn.toISOString().split("T")[0]);
    if (checkOut)
      params.set("checkOutDate", checkOut.toISOString().split("T")[0]);
    if (guests) params.set("minGuests", guests);

    onNavigate("properties");
  };

  const categories = [
    {
      title: "Beachfront",
      image:
        "https://images.unsplash.com/photo-1678788762802-0c6c6cdd89fe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWFjaGZyb250JTIwcHJvcGVydHl8ZW58MXx8fHwxNzYxMTYxMzg0fDA&ixlib=rb-4.1.0&q=80&w=1080",
    },
    {
      title: "Family Homes",
      image:
        "https://images.unsplash.com/photo-1629359080404-2dafcfd9f159?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYW1pbHklMjB2YWNhdGlvbiUyMGhvbWV8ZW58MXx8fHwxNzYxMTYxMzgzfDA&ixlib=rb-4.1.0&q=80&w=1080",
    },
    {
      title: "Chalets",
      image:
        "https://images.unsplash.com/photo-1638310081327-5b4b5da6d155?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWFjaCUyMGNoYWxldCUyMHBvb2x8ZW58MXx8fHwxNzYxMTYxMzgzfDA&ixlib=rb-4.1.0&q=80&w=1080",
    },
    {
      title: "City Apartments",
      image:
        "https://images.unsplash.com/photo-1700126689261-1f5bdfe5adcc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBhcGFydG1lbnQlMjBjaXR5fGVufDF8fHx8MTc2MTEwNjkyM3ww&ixlib=rb-4.1.0&q=80&w=1080",
    },
  ];

  const parallaxOffset = scrollY * 0.5;

  return (
    <div className="min-h-screen">
      {/* Hero Section with 3D Waves */}
      <div className="relative h-[600px] flex items-center justify-center overflow-hidden">
        {/* 3D Background with Parallax */}
        <div
          className="absolute inset-0 transition-transform duration-100 ease-out"
          style={{ transform: `translateY(${parallaxOffset}px)` }}
        >
          <Scene3D />
        </div>

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/20 pointer-events-none" />

        <div className="relative z-10 text-center px-4 w-full max-w-4xl mx-auto">
          {/* Hero Text with Fade on Scroll */}
          <div
            style={{
              opacity: Math.max(0, 1 - scrollY / 300),
              transform: `translateY(${-scrollY * 0.3}px)`,
              transition: "opacity 0.1s, transform 0.1s",
            }}
          >
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg animate-fadeIn">
              {t?.heroTitle || "Find Your Perfect"}{" "}
              <span className="text-[#00BFA6] drop-shadow-lg">
                {t?.heroTitleHighlight || "Rental in Egypt"}
              </span>
            </h1>
            <p className="text-xl text-white/90 mb-8 drop-shadow-md animate-fadeIn delay-200">
              {t?.heroSubtitle || "Discover amazing properties across Egypt"}
            </p>
          </div>

          {/* Search Bar with Focus Animation */}
          <div
            className={`transition-all duration-500 ease-out ${
              isSearchFocused ? "scale-105" : "scale-100"
            }`}
            style={{
              opacity: Math.max(0, 1 - scrollY / 400),
              transform: `translateY(${Math.min(scrollY * 0.2, 100)}px)`,
            }}
          >
            <div className="bg-white/95 backdrop-blur-md rounded-full shadow-2xl p-2 flex flex-col md:flex-row items-stretch md:items-center gap-2 hover:shadow-3xl transition-all duration-300">
              <div className="flex-1 px-4 py-3 border-b md:border-b-0 md:border-r border-gray-200">
                <Select value={location} onValueChange={setLocation}>
                  <SelectTrigger
                    className="border-0 bg-transparent h-auto p-0 focus:ring-0 focus:ring-offset-0"
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                  >
                    <SelectValue
                      placeholder={
                        t?.searchPlaceholder || "Where are you going?"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {governorates.map((gov) => (
                      <SelectItem key={gov} value={gov}>
                        {gov}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Popover>
                <PopoverTrigger asChild>
                  <button
                    className="flex-1 px-4 py-3 text-left border-b md:border-b-0 md:border-r border-gray-200 hover:bg-gray-50 rounded-lg transition-colors"
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                  >
                    <span className="text-sm text-gray-500 block">
                      {t?.checkIn || "Check in"}
                    </span>
                    <span className="font-medium">
                      {checkIn
                        ? format(checkIn, "MMM dd")
                        : t?.selectDates || "Select dates"}
                    </span>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={checkIn}
                    onSelect={setCheckIn}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <button
                    className="flex-1 px-4 py-3 text-left border-b md:border-b-0 md:border-r border-gray-200 hover:bg-gray-50 rounded-lg transition-colors"
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                  >
                    <span className="text-sm text-gray-500 block">
                      {t?.checkOut || "Check out"}
                    </span>
                    <span className="font-medium">
                      {checkOut
                        ? format(checkOut, "MMM dd")
                        : t?.selectDates || "Select dates"}
                    </span>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={checkOut}
                    onSelect={setCheckOut}
                    initialFocus
                    disabled={(date: Date) =>
                      checkIn ? date < checkIn : false
                    }
                  />
                </PopoverContent>
              </Popover>

              <div className="flex-1 px-4 py-3 border-b md:border-b-0 md:border-r border-gray-200">
                <Select value={guests} onValueChange={setGuests}>
                  <SelectTrigger
                    className="border-0 bg-transparent h-auto p-0 focus:ring-0 focus:ring-offset-0"
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                  >
                    <SelectValue placeholder={t?.guests || "Guests"} />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6].map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {language === "ar"
                          ? `${num} ضيوف`
                          : `${num} Guest${num > 1 ? "s" : ""}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleSearch}
                size="lg"
                className="bg-[#FF6B6B] hover:bg-[#FF5252] text-white rounded-full px-8 transition-all duration-300 hover:scale-110 active:scale-95"
              >
                <Search
                  className={`w-5 h-5 ${language === "ar" ? "ml-2" : "mr-2"}`}
                />
              </Button>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 animate-bounce"
          style={{ opacity: Math.max(0, 1 - scrollY / 200) }}
        >
          <svg
            className="w-8 h-8 text-white drop-shadow-lg"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Popular Locations */}
        <section className="mb-16">
          <h2 className="text-3xl font-semibold text-[#2B2B2B] mb-8">
            {t?.popularDestinations || "Popular Destinations"}
          </h2>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-64 bg-gray-200 animate-pulse rounded-2xl"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {popularLocations.map((location) => (
                <button
                  key={`${location.governorate}-${location.city}`}
                  onClick={() => onNavigate("properties")}
                  className="group relative overflow-hidden rounded-2xl h-64 hover:shadow-xl transition-shadow"
                >
                  <ImageWithFallback
                    src="https://images.unsplash.com/photo-1593663094448-9ea85c6e8456?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
                    alt={location.city}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div
                    className={`absolute bottom-6 ${
                      language === "ar" ? "right-6" : "left-6"
                    } text-white`}
                  >
                    <h3 className="text-2xl font-semibold mb-1">
                      {location.city}
                    </h3>
                    <p className="text-sm text-white/90">
                      {location.propertyCount}{" "}
                      {language === "ar" ? "عقار" : "properties"}
                    </p>
                    <p className="text-xs text-white/80 mt-1">
                      {language === "ar" ? "من" : "From"} {location.minPrice}{" "}
                      EGP
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Categories */}
        <section className="mb-16">
          <h2 className="text-3xl font-semibold text-[#2B2B2B] mb-8">
            {language === "ar" ? "عش في أي مكان" : "Live Anywhere"}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((category) => (
              <button
                key={category.title}
                onClick={() => onNavigate("properties")}
                className="group text-left"
              >
                <div className="relative overflow-hidden rounded-xl aspect-square mb-3">
                  <ImageWithFallback
                    src={category.image}
                    alt={category.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
                <h3 className="font-semibold text-[#2B2B2B]">
                  {category.title}
                </h3>
              </button>
            ))}
          </div>
        </section>

        {/* Featured Properties */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-semibold text-[#2B2B2B]">
              {t?.featuredProperties || "Featured Properties"}
            </h2>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
                className="text-gray-600"
              >
                <RefreshCw
                  className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
              <Button
                variant="ghost"
                onClick={() => onNavigate("properties")}
                className="text-[#00BFA6] hover:text-[#00A890] gap-1"
              >
                {language === "ar" ? "عرض الكل" : "View all"}
                <ChevronRight
                  className={`w-4 h-4 ${language === "ar" ? "rotate-180" : ""}`}
                />
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-3">
                  <div className="h-48 bg-gray-200 animate-pulse rounded-2xl" />
                  <div className="h-4 bg-gray-200 animate-pulse rounded" />
                  <div className="h-4 bg-gray-200 animate-pulse rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProperties.map((property) => (
                <PropertyCard
                  key={property.propertyId}
                  property={property}
                  onNavigate={onNavigate}
                  language={language}
                  showFavorite={!!user}
                />
              ))}
            </div>
          )}
        </section>

        {/* Why Ajarly */}
        <section className="mb-16">
          <h2 className="text-3xl font-semibold text-[#2B2B2B] mb-8 text-center">
            {t?.whyChooseAjarly || "Why Choose Ajarly"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#00BFA6] rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-[#2B2B2B] mb-2">
                {t?.trustedPlatform || "Trusted Platform"}
              </h3>
              <p className="text-gray-600">
                {t?.trustedDesc || "Verified properties and secure bookings"}
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-[#00BFA6] rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-[#2B2B2B] mb-2">
                {t?.localExpertise || "Local Expertise"}
              </h3>
              <p className="text-gray-600">
                {t?.localExpertiseDesc ||
                  "Deep knowledge of Egyptian properties"}
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-[#00BFA6] rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-[#2B2B2B] mb-2">
                {t?.support247 || "24/7 Support"}
              </h3>
              <p className="text-gray-600">
                {t?.supportDesc || "Always here to help you"}
              </p>
            </div>
          </div>
        </section>

        {/* Become a Host CTA */}
        <section className="bg-gradient-to-r from-[#00BFA6] to-[#00A890] rounded-3xl p-12 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-semibold mb-4">
            {language === "ar" ? "كن مضيفاً اليوم" : "Become a Host Today"}
          </h2>
          <p className="text-xl mb-8 text-white/90">
            {language === "ar"
              ? "شارك مساحتك واكسب دخلاً إضافياً مع أجارلي"
              : "Share your space and earn extra income with Ajarly"}
          </p>
          <Button
            onClick={() => onNavigate("host-dashboard")}
            size="lg"
            className="bg-white text-[#00BFA6] hover:bg-gray-100"
          >
            {language === "ar" ? "ابدأ الآن" : "Get Started"}
          </Button>
        </section>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 1s ease-out forwards;
        }
        
        .delay-200 {
          animation-delay: 0.2s;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}
