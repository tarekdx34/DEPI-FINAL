import { Plus, Home, Calendar, TrendingUp, Settings, Upload, Edit2, Trash2, Eye, Star, MessageSquare, DollarSign } from "lucide-react";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Checkbox } from "../ui/checkbox";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { Badge } from "../ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Progress } from "../ui/progress";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";

interface HostDashboardProps {
  onNavigate: (page: string) => void;
  showAddPropertyOnMount?: boolean;
}

export function HostDashboard({ onNavigate, showAddPropertyOnMount = false }: HostDashboardProps) {
  const [activeTab, setActiveTab] = useState("listings");
  const [showAddProperty, setShowAddProperty] = useState(showAddPropertyOnMount);
  const [addPropertyStep, setAddPropertyStep] = useState(1);
  const [deletePropertyId, setDeletePropertyId] = useState<string | null>(null);

  const listings = [
    {
      id: "1",
      title: "Luxury Beachfront Villa",
      location: "North Coast",
      price: 3500,
      status: "Active",
      views: 1248,
      bookings: 12,
      image: "https://images.unsplash.com/photo-1729720281771-b790dfb6ec7f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBiZWFjaCUyMHZpbGxhfGVufDF8fHx8MTc2MTA5ODc1Nnww&ixlib=rb-4.1.0&q=80&w=1080",
      bedrooms: 5,
      bathrooms: 4,
      guests: 10,
    },
    {
      id: "2",
      title: "Cozy Mediterranean Apartment",
      location: "Alexandria",
      price: 1800,
      status: "Active",
      views: 842,
      bookings: 8,
      image: "https://images.unsplash.com/photo-1635690280190-0eec6bc587fd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWFjaCUyMGhvdXNlJTIwaW50ZXJpb3J8ZW58MXx8fHwxNzYxMTYxMzgwfDA&ixlib=rb-4.1.0&q=80&w=1080",
      bedrooms: 2,
      bathrooms: 2,
      guests: 4,
    },
    {
      id: "3",
      title: "Seaside Chalet",
      location: "Matrouh",
      price: 2200,
      status: "Inactive",
      views: 523,
      bookings: 5,
      image: "https://images.unsplash.com/photo-1598635031829-4bfae29d33eb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZWRpdGVycmFuZWFuJTIwdmlsbGF8ZW58MXx8fHwxNzYxMTI5ODA1fDA&ixlib=rb-4.1.0&q=80&w=1080",
      bedrooms: 3,
      bathrooms: 2,
      guests: 6,
    },
  ];

  const bookings = [
    {
      id: "1",
      property: "Luxury Beachfront Villa",
      guest: "Sarah Ahmed",
      checkIn: "Dec 24, 2025",
      checkOut: "Dec 28, 2025",
      status: "Confirmed",
      amount: 14000,
      code: "AJR-2025-8472",
    },
    {
      id: "2",
      property: "Cozy Mediterranean Apartment",
      guest: "Mohamed Ali",
      checkIn: "Dec 20, 2025",
      checkOut: "Dec 23, 2025",
      status: "Pending",
      amount: 5400,
      code: "AJR-2025-8391",
    },
    {
      id: "3",
      property: "Luxury Beachfront Villa",
      guest: "Fatima Hassan",
      checkIn: "Nov 15, 2025",
      checkOut: "Nov 18, 2025",
      status: "Completed",
      amount: 10500,
      code: "AJR-2025-7826",
    },
    {
      id: "4",
      property: "Seaside Chalet",
      guest: "Ahmed Youssef",
      checkIn: "Oct 10, 2025",
      checkOut: "Oct 12, 2025",
      status: "Cancelled",
      amount: 4400,
      code: "AJR-2025-7142",
    },
  ];

  const reviews = [
    {
      id: "1",
      property: "Luxury Beachfront Villa",
      guest: "Sarah Ahmed",
      rating: 5,
      comment: "Absolutely stunning property! The villa exceeded all expectations. The host was incredibly responsive and helpful. Will definitely book again!",
      date: "Nov 20, 2025",
    },
    {
      id: "2",
      property: "Cozy Mediterranean Apartment",
      guest: "Mohamed Ali",
      rating: 4,
      comment: "Great location and clean apartment. The view was amazing. Only minor issue was the WiFi speed, but everything else was perfect.",
      date: "Nov 10, 2025",
    },
    {
      id: "3",
      property: "Luxury Beachfront Villa",
      guest: "Fatima Hassan",
      rating: 5,
      comment: "Perfect family vacation! The kids loved the pool and the beach access. Host provided excellent local recommendations.",
      date: "Oct 25, 2025",
    },
  ];

  const monthlyEarnings = [
    { month: "Jun", earnings: 15000 },
    { month: "Jul", earnings: 28000 },
    { month: "Aug", earnings: 42000 },
    { month: "Sep", earnings: 35000 },
    { month: "Oct", earnings: 38000 },
    { month: "Nov", earnings: 45000 },
  ];

  const maxEarnings = Math.max(...monthlyEarnings.map(m => m.earnings));
  const totalEarnings = monthlyEarnings.reduce((sum, m) => sum + m.earnings, 0);

  const nextStep = () => {
    if (addPropertyStep < 4) {
      setAddPropertyStep(addPropertyStep + 1);
    }
  };

  const prevStep = () => {
    if (addPropertyStep > 1) {
      setAddPropertyStep(addPropertyStep - 1);
    }
  };

  const handleDeleteProperty = (id: string) => {
    setDeletePropertyId(id);
  };

  const confirmDelete = () => {
    // Handle delete logic here
    setDeletePropertyId(null);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed":
        return "bg-green-100 text-green-700 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "completed":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "cancelled":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F6F1]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-semibold text-[#2B2B2B]">Host Dashboard</h1>
          {!showAddProperty && (
            <Button
              onClick={() => {
                setShowAddProperty(true);
                setAddPropertyStep(1);
              }}
              className="bg-[#FF6B6B] hover:bg-[#FF5252] text-white gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Property
            </Button>
          )}
        </div>

        {showAddProperty ? (
          <Card className="p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-[#2B2B2B]">Add New Property</h2>
              <Button variant="ghost" onClick={() => setShowAddProperty(false)}>
                Cancel
              </Button>
            </div>

            {/* Multi-step Progress */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Step {addPropertyStep} of 4</span>
                <span className="text-sm text-gray-600">{(addPropertyStep / 4) * 100}% Complete</span>
              </div>
              <Progress value={(addPropertyStep / 4) * 100} className="h-2" />
              <div className="grid grid-cols-4 gap-2 mt-4">
                <div className={`text-center text-xs ${addPropertyStep >= 1 ? 'text-[#00BFA6]' : 'text-gray-400'}`}>
                  Basic Info
                </div>
                <div className={`text-center text-xs ${addPropertyStep >= 2 ? 'text-[#00BFA6]' : 'text-gray-400'}`}>
                  Location
                </div>
                <div className={`text-center text-xs ${addPropertyStep >= 3 ? 'text-[#00BFA6]' : 'text-gray-400'}`}>
                  Details & Pricing
                </div>
                <div className={`text-center text-xs ${addPropertyStep >= 4 ? 'text-[#00BFA6]' : 'text-gray-400'}`}>
                  Photos
                </div>
              </div>
            </div>

            <form className="space-y-6">
              {/* Step 1: Basic Information */}
              {addPropertyStep === 1 && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-[#2B2B2B]">Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="propertyTitle">Property Title</Label>
                      <Input id="propertyTitle" placeholder="e.g., Luxury Beach Villa" className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="propertyType">Property Type</Label>
                      <Select>
                        <SelectTrigger id="propertyType" className="mt-1">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="villa">Villa</SelectItem>
                          <SelectItem value="apartment">Apartment</SelectItem>
                          <SelectItem value="chalet">Chalet</SelectItem>
                          <SelectItem value="house">House</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe your property..."
                      rows={4}
                      className="mt-1"
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Location */}
              {addPropertyStep === 2 && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-[#2B2B2B]">Location</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="location">City</Label>
                      <Select>
                        <SelectTrigger id="location" className="mt-1">
                          <SelectValue placeholder="Select location" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="alexandria">Alexandria</SelectItem>
                          <SelectItem value="matrouh">Matrouh</SelectItem>
                          <SelectItem value="north-coast">North Coast</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="address">Street Address</Label>
                      <Input id="address" placeholder="Street address" className="mt-1" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="district">District/Area</Label>
                      <Input id="district" placeholder="e.g., Marina, Sidi Abdel Rahman" className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="zipcode">Postal Code (Optional)</Label>
                      <Input id="zipcode" placeholder="12345" className="mt-1" />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Property Details & Pricing */}
              {addPropertyStep === 3 && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-[#2B2B2B]">Property Details</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <Label htmlFor="bedrooms">Bedrooms</Label>
                        <Input id="bedrooms" type="number" min="1" defaultValue="1" className="mt-1" />
                      </div>
                      <div>
                        <Label htmlFor="bathrooms">Bathrooms</Label>
                        <Input id="bathrooms" type="number" min="1" defaultValue="1" className="mt-1" />
                      </div>
                      <div>
                        <Label htmlFor="guests">Max Guests</Label>
                        <Input id="guests" type="number" min="1" defaultValue="2" className="mt-1" />
                      </div>
                      <div>
                        <Label htmlFor="area">Area (m²)</Label>
                        <Input id="area" type="number" min="0" placeholder="120" className="mt-1" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-[#2B2B2B]">Pricing</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="price">Price per Night (EGP)</Label>
                        <Input id="price" type="number" min="0" placeholder="2000" className="mt-1" />
                      </div>
                      <div>
                        <Label htmlFor="cleaningFee">Cleaning Fee (EGP)</Label>
                        <Input id="cleaningFee" type="number" min="0" placeholder="200" className="mt-1" />
                      </div>
                    </div>
                  </div>

                  {/* Amenities */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-[#2B2B2B]">Amenities</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {["WiFi", "Air Conditioning", "Pool", "Parking", "Kitchen", "TV", "Beachfront", "BBQ", "Balcony"].map(
                        (amenity) => (
                          <div key={amenity} className="flex items-center space-x-2">
                            <Checkbox id={amenity} />
                            <label htmlFor={amenity} className="text-sm cursor-pointer">
                              {amenity}
                            </label>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Photos */}
              {addPropertyStep === 4 && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-[#2B2B2B]">Photos</h3>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-[#00BFA6] transition-colors cursor-pointer">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">Drag & drop photos here, or click to select</p>
                    <p className="text-sm text-gray-500">Upload at least 5 high-quality photos (JPG, PNG)</p>
                    <p className="text-xs text-gray-400 mt-2">Max file size: 10MB per photo</p>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                    <h4 className="font-medium text-blue-900 mb-2">Photo Tips:</h4>
                    <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                      <li>Use natural lighting for best results</li>
                      <li>Include photos of all rooms and outdoor spaces</li>
                      <li>Highlight unique features and amenities</li>
                      <li>First photo will be the cover image</li>
                    </ul>
                  </div>
                </div>
              )}

              <div className="flex gap-4 pt-4">
                {addPropertyStep > 1 && (
                  <Button type="button" variant="outline" onClick={prevStep}>
                    Previous
                  </Button>
                )}
                {addPropertyStep < 4 ? (
                  <Button type="button" onClick={nextStep} className="bg-[#00BFA6] hover:bg-[#00A890]">
                    Next
                  </Button>
                ) : (
                  <>
                    <Button type="submit" className="bg-[#00BFA6] hover:bg-[#00A890]">
                      Publish Property
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setShowAddProperty(false)}>
                      Save as Draft
                    </Button>
                  </>
                )}
              </div>
            </form>
          </Card>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full max-w-3xl grid-cols-5 mb-8">
              <TabsTrigger value="listings" className="gap-2">
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline">Properties</span>
              </TabsTrigger>
              <TabsTrigger value="bookings" className="gap-2">
                <Calendar className="w-4 h-4" />
                <span className="hidden sm:inline">Bookings</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="gap-2">
                <TrendingUp className="w-4 h-4" />
                <span className="hidden sm:inline">Earnings</span>
              </TabsTrigger>
              <TabsTrigger value="reviews" className="gap-2">
                <MessageSquare className="w-4 h-4" />
                <span className="hidden sm:inline">Reviews</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="gap-2">
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Settings</span>
              </TabsTrigger>
            </TabsList>

            {/* Listings Tab */}
            <TabsContent value="listings">
              <h2 className="text-2xl font-semibold text-[#2B2B2B] mb-4">My Properties</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {listings.map((listing) => (
                  <Card key={listing.id} className="overflow-hidden">
                    <div className="aspect-[4/3] overflow-hidden relative">
                      <ImageWithFallback
                        src={listing.image}
                        alt={listing.title}
                        className="w-full h-full object-cover"
                      />
                      <Badge 
                        className={`absolute top-2 right-2 ${
                          listing.status === "Active" 
                            ? "bg-green-500 hover:bg-green-600" 
                            : "bg-gray-500 hover:bg-gray-600"
                        }`}
                      >
                        {listing.status}
                      </Badge>
                    </div>
                    <div className="p-4">
                      <div className="mb-2">
                        <h3 className="font-semibold text-[#2B2B2B]">{listing.title}</h3>
                        <p className="text-sm text-gray-600">{listing.location}</p>
                      </div>
                      <div className="text-sm text-gray-600 mb-3">
                        {listing.bedrooms} beds • {listing.bathrooms} baths • {listing.guests} guests
                      </div>
                      <div className="flex items-center justify-between text-sm mb-3">
                        <span className="font-semibold">{listing.price} EGP / night</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-4 pb-4 border-b">
                        <div className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {listing.views} views
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {listing.bookings} bookings
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1 gap-1">
                          <Edit2 className="w-3 h-3" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1 gap-1">
                          <Eye className="w-3 h-3" />
                          Preview
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDeleteProperty(listing.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Bookings Tab */}
            <TabsContent value="bookings">
              <h2 className="text-2xl font-semibold text-[#2B2B2B] mb-4">Bookings Management</h2>
              {bookings.length > 0 ? (
                <Card>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Property</TableHead>
                        <TableHead>Guest</TableHead>
                        <TableHead>Check-in</TableHead>
                        <TableHead>Check-out</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bookings.map((booking) => (
                        <TableRow key={booking.id}>
                          <TableCell className="font-medium">{booking.property}</TableCell>
                          <TableCell>{booking.guest}</TableCell>
                          <TableCell>{booking.checkIn}</TableCell>
                          <TableCell>{booking.checkOut}</TableCell>
                          <TableCell className="font-semibold">{booking.amount} EGP</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={getStatusColor(booking.status)}>
                              {booking.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="sm">
                                View
                              </Button>
                              {booking.status === "Pending" && (
                                <Button variant="ghost" size="sm" className="text-green-600">
                                  Accept
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              ) : (
                <Card className="p-8 text-center">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-[#2B2B2B] mb-2">No bookings</h3>
                  <p className="text-gray-600">Your confirmed bookings will appear here</p>
                </Card>
              )}
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics">
              <h2 className="text-2xl font-semibold text-[#2B2B2B] mb-6">Earnings & Revenue Analytics</h2>
              
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm text-gray-600">Total Earnings</h3>
                    <DollarSign className="w-5 h-5 text-[#00BFA6]" />
                  </div>
                  <p className="text-3xl font-semibold text-[#2B2B2B]">{totalEarnings.toLocaleString()} EGP</p>
                  <p className="text-sm text-green-600 mt-1">Last 6 months</p>
                </Card>
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm text-gray-600">This Month</h3>
                    <TrendingUp className="w-5 h-5 text-[#00BFA6]" />
                  </div>
                  <p className="text-3xl font-semibold text-[#2B2B2B]">45,000 EGP</p>
                  <p className="text-sm text-green-600 mt-1">+18% from last month</p>
                </Card>
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm text-gray-600">Total Bookings</h3>
                    <Calendar className="w-5 h-5 text-[#00BFA6]" />
                  </div>
                  <p className="text-3xl font-semibold text-[#2B2B2B]">25</p>
                  <p className="text-sm text-green-600 mt-1">+5 from last month</p>
                </Card>
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm text-gray-600">Avg. Rating</h3>
                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  </div>
                  <p className="text-3xl font-semibold text-[#2B2B2B]">4.8</p>
                  <p className="text-sm text-gray-600 mt-1">From 18 reviews</p>
                </Card>
              </div>

              {/* Monthly Earnings Chart */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-[#2B2B2B] mb-6">Monthly Income</h3>
                <div className="space-y-4">
                  {monthlyEarnings.map((month) => (
                    <div key={month.month} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-gray-700">{month.month}</span>
                        <span className="font-semibold text-[#2B2B2B]">{month.earnings.toLocaleString()} EGP</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-[#00BFA6] h-2 rounded-full transition-all"
                          style={{ width: `${(month.earnings / maxEarnings) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>

            {/* Reviews Tab */}
            <TabsContent value="reviews">
              <h2 className="text-2xl font-semibold text-[#2B2B2B] mb-4">Reviews Received</h2>
              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <Card key={review.id} className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-[#2B2B2B]">{review.property}</h3>
                          <p className="text-sm text-gray-600">by {review.guest}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "fill-gray-200 text-gray-200"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{review.comment}</p>
                      <p className="text-xs text-gray-500">{review.date}</p>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="p-12 text-center">
                  <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-[#2B2B2B] mb-2">No reviews yet</h3>
                  <p className="text-gray-600">Guest reviews will appear here after their stay</p>
                </Card>
              )}
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings">
              <Card className="p-6 max-w-2xl">
                <h2 className="text-2xl font-semibold text-[#2B2B2B] mb-6">Account Settings</h2>
                <form className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-[#2B2B2B]">Business Information</h3>
                    <div>
                      <Label htmlFor="hostName">Host Name / Business Name</Label>
                      <Input id="hostName" defaultValue="Ahmed Hassan" className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="businessType">Business Type</Label>
                      <Select>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="individual">Individual Host</SelectItem>
                          <SelectItem value="company">Property Management Company</SelectItem>
                          <SelectItem value="agency">Real Estate Agency</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-[#2B2B2B]">Contact Information</h3>
                    <div>
                      <Label htmlFor="hostEmail">Contact Email</Label>
                      <Input id="hostEmail" type="email" defaultValue="host@ajarly.com" className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="hostPhone">Phone Number</Label>
                      <Input id="hostPhone" defaultValue="+20 123 456 7890" className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="whatsapp">WhatsApp Number (Optional)</Label>
                      <Input id="whatsapp" placeholder="+20 123 456 7890" className="mt-1" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-[#2B2B2B]">Security</h3>
                    <div>
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input id="currentPassword" type="password" className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input id="newPassword" type="password" className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input id="confirmPassword" type="password" className="mt-1" />
                    </div>
                  </div>

                  <Button className="bg-[#00BFA6] hover:bg-[#00A890]">Save Changes</Button>
                </form>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletePropertyId} onOpenChange={() => setDeletePropertyId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Property</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this property? This action cannot be undone. All associated bookings and data will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
