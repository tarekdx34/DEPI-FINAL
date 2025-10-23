import { useState } from "react";
import { 
  LayoutDashboard, 
  Users, 
  Home, 
  CheckCircle, 
  Flag, 
  TrendingUp,
  Search,
  MoreVertical,
  UserCheck,
  UserX,
  Eye,
  Trash2,
  AlertTriangle,
  MapPin,
  Star,
  DollarSign,
  Calendar
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { toast } from "sonner@2.0.3";

interface AdminDashboardProps {
  onNavigate: (page: string) => void;
}

export function AdminDashboard({ onNavigate }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; type: string; id: string; name: string }>({
    open: false,
    type: "",
    id: "",
    name: "",
  });

  // Mock data
  const stats = {
    totalUsers: 1248,
    totalProperties: 342,
    pendingApprovals: 12,
    totalBookings: 856,
    totalRevenue: 2458000,
    activeListings: 298,
  };

  const users = [
    { id: "1", name: "Ahmed Hassan", email: "ahmed@example.com", role: "Renter", joined: "Oct 15, 2025", bookings: 5, status: "Active" },
    { id: "2", name: "Sarah Mohamed", email: "sarah@example.com", role: "Owner", joined: "Sep 22, 2025", properties: 3, status: "Active" },
    { id: "3", name: "Mohamed Ali", email: "mohamed@example.com", role: "Renter", joined: "Nov 01, 2025", bookings: 2, status: "Suspended" },
    { id: "4", name: "Fatima Ibrahim", email: "fatima@example.com", role: "Owner", joined: "Aug 10, 2025", properties: 7, status: "Active" },
  ];

  const properties = [
    { 
      id: "1", 
      title: "Luxury Beachfront Villa", 
      owner: "Sarah Mohamed", 
      location: "North Coast", 
      price: 3500, 
      status: "Active", 
      bookings: 24,
      image: "https://images.unsplash.com/photo-1729720281771-b790dfb6ec7f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBiZWFjaCUyMHZpbGxhfGVufDF8fHx8MTc2MTA5ODc1Nnww&ixlib=rb-4.1.0&q=80&w=1080"
    },
    { 
      id: "2", 
      title: "Cozy Beach Apartment", 
      owner: "Fatima Ibrahim", 
      location: "Alexandria", 
      price: 1800, 
      status: "Active", 
      bookings: 18,
      image: "https://images.unsplash.com/photo-1635690280190-0eec6bc587fd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWFjaCUyMGhvdXNlJTIwaW50ZXJpb3J8ZW58MXx8fHwxNzYxMTYxMzgwfDA&ixlib=rb-4.1.0&q=80&w=1080"
    },
  ];

  const pendingListings = [
    { 
      id: "1", 
      title: "Seaside Villa with Pool", 
      owner: "Youssef Ahmed", 
      location: "Matrouh", 
      price: 2500, 
      submitted: "2 days ago",
      image: "https://images.unsplash.com/photo-1598635031829-4bfae29d33eb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZWRpdGVycmFuZWFuJTIwdmlsbGF8ZW58MXx8fHwxNzYxMTI5ODA1fDA&ixlib=rb-4.1.0&q=80&w=1080"
    },
    { 
      id: "2", 
      title: "Modern Chalet", 
      owner: "Layla Hassan", 
      location: "North Coast", 
      price: 3200, 
      submitted: "5 hours ago",
      image: "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBob3VzZXxlbnwxfHx8fDE3NjExNjEzODB8MA&ixlib=rb-4.1.0&q=80&w=1080"
    },
  ];

  const reports = [
    { id: "1", type: "Spam", property: "Fake Listing", reporter: "Ahmed Hassan", date: "Oct 20, 2025", status: "Pending" },
    { id: "2", type: "Fraud", property: "Luxury Beach Villa", reporter: "Mohamed Ali", date: "Oct 18, 2025", status: "Investigating" },
    { id: "3", type: "Inappropriate", property: "Beach House", reporter: "Sarah Mohamed", date: "Oct 15, 2025", status: "Resolved" },
  ];

  const topListings = [
    { property: "Luxury Beachfront Villa", bookings: 45, revenue: 157500, rating: 4.9, location: "North Coast" },
    { property: "Cozy Beach Apartment", bookings: 38, revenue: 68400, rating: 4.8, location: "Alexandria" },
    { property: "Seaside Chalet", bookings: 32, revenue: 70400, rating: 4.7, location: "Matrouh" },
    { property: "Modern Beach House", bookings: 28, revenue: 98000, rating: 4.9, location: "North Coast" },
    { property: "Coastal Villa", bookings: 25, revenue: 87500, rating: 4.6, location: "Alexandria" },
  ];

  const citiesData = [
    { city: "North Coast", bookings: 342, revenue: 1205000, properties: 128 },
    { city: "Alexandria", bookings: 298, revenue: 846000, properties: 142 },
    { city: "Matrouh", bookings: 216, revenue: 607000, properties: 72 },
  ];

  const handleDelete = (type: string, id: string, name: string) => {
    setDeleteDialog({ open: true, type, id, name });
  };

  const confirmDelete = () => {
    toast.success(`${deleteDialog.type} deleted successfully`);
    setDeleteDialog({ open: false, type: "", id: "", name: "" });
  };

  const handleApprove = (id: string, title: string) => {
    toast.success(`Property "${title}" has been approved`);
  };

  const handleReject = (id: string, title: string) => {
    toast.error(`Property "${title}" has been rejected`);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-700";
      case "suspended":
        return "bg-red-100 text-red-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "investigating":
        return "bg-orange-100 text-orange-700";
      case "resolved":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F6F1]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-semibold text-[#2B2B2B]">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">Manage your platform</p>
          </div>
          <Button variant="outline" onClick={() => onNavigate("home")}>
            Back to Home
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6 mb-8">
            <TabsTrigger value="overview" className="gap-2">
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Users</span>
            </TabsTrigger>
            <TabsTrigger value="properties" className="gap-2">
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Properties</span>
            </TabsTrigger>
            <TabsTrigger value="approvals" className="gap-2">
              <CheckCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Approvals</span>
              {pendingListings.length > 0 && (
                <Badge className="ml-1 bg-red-500">{pendingListings.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="reports" className="gap-2">
              <Flag className="w-4 h-4" />
              <span className="hidden sm:inline">Reports</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm text-gray-600">Total Users</h3>
                  <Users className="w-5 h-5 text-[#00BFA6]" />
                </div>
                <p className="text-3xl font-semibold text-[#2B2B2B]">{stats.totalUsers.toLocaleString()}</p>
                <p className="text-sm text-green-600 mt-1">+12% from last month</p>
              </Card>
              <Card className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm text-gray-600">Total Properties</h3>
                  <Home className="w-5 h-5 text-[#00BFA6]" />
                </div>
                <p className="text-3xl font-semibold text-[#2B2B2B]">{stats.totalProperties}</p>
                <p className="text-sm text-gray-600 mt-1">{stats.activeListings} active</p>
              </Card>
              <Card className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm text-gray-600">Pending Approvals</h3>
                  <CheckCircle className="w-5 h-5 text-yellow-500" />
                </div>
                <p className="text-3xl font-semibold text-[#2B2B2B]">{stats.pendingApprovals}</p>
                <p className="text-sm text-yellow-600 mt-1">Needs attention</p>
              </Card>
              <Card className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm text-gray-600">Total Bookings</h3>
                  <Calendar className="w-5 h-5 text-[#00BFA6]" />
                </div>
                <p className="text-3xl font-semibold text-[#2B2B2B]">{stats.totalBookings}</p>
                <p className="text-sm text-green-600 mt-1">+8% from last month</p>
              </Card>
              <Card className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm text-gray-600">Total Revenue</h3>
                  <DollarSign className="w-5 h-5 text-[#00BFA6]" />
                </div>
                <p className="text-3xl font-semibold text-[#2B2B2B]">{stats.totalRevenue.toLocaleString()} EGP</p>
                <p className="text-sm text-green-600 mt-1">+15% from last month</p>
              </Card>
              <Card className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm text-gray-600">Active Listings</h3>
                  <Home className="w-5 h-5 text-green-500" />
                </div>
                <p className="text-3xl font-semibold text-[#2B2B2B]">{stats.activeListings}</p>
                <p className="text-sm text-gray-600 mt-1">87% occupancy rate</p>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="font-semibold text-[#2B2B2B] mb-4">Recent Activity</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3 pb-3 border-b">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <UserCheck className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">New user registered: Ahmed Hassan</p>
                      <p className="text-xs text-gray-500">2 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 pb-3 border-b">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <Home className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">New property listed in North Coast</p>
                      <p className="text-xs text-gray-500">15 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 pb-3 border-b">
                    <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                      <Flag className="w-4 h-4 text-yellow-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">New report submitted for review</p>
                      <p className="text-xs text-gray-500">1 hour ago</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-4 h-4 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">Booking completed successfully</p>
                      <p className="text-xs text-gray-500">3 hours ago</p>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="font-semibold text-[#2B2B2B] mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => setActiveTab("approvals")}>
                    <CheckCircle className="w-5 h-5" />
                    <span className="text-sm">Approve Listings</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => setActiveTab("users")}>
                    <Users className="w-5 h-5" />
                    <span className="text-sm">Manage Users</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => setActiveTab("reports")}>
                    <Flag className="w-5 h-5" />
                    <span className="text-sm">View Reports</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => setActiveTab("analytics")}>
                    <TrendingUp className="w-5 h-5" />
                    <span className="text-sm">Analytics</span>
                  </Button>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-[#2B2B2B]">Manage Users</h2>
              <div className="flex gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Select defaultValue="all">
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="renter">Renters</SelectItem>
                    <SelectItem value="owner">Owners</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Activity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src="" />
                            <AvatarFallback className="bg-[#00BFA6] text-white">
                              {user.name.split(" ").map(n => n[0]).join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-gray-600">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{user.role}</Badge>
                      </TableCell>
                      <TableCell>{user.joined}</TableCell>
                      <TableCell>
                        {user.bookings && <span>{user.bookings} bookings</span>}
                        {user.properties && <span>{user.properties} properties</span>}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(user.status)}>{user.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              {user.status === "Active" ? (
                                <>
                                  <UserX className="w-4 h-4 mr-2" />
                                  Suspend User
                                </>
                              ) : (
                                <>
                                  <UserCheck className="w-4 h-4 mr-2" />
                                  Activate User
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => handleDelete("User", user.id, user.name)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* Properties Tab */}
          <TabsContent value="properties" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-[#2B2B2B]">Manage Properties</h2>
              <div className="flex gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search properties..."
                    className="pl-10 w-64"
                  />
                </div>
                <Select defaultValue="all">
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property) => (
                <Card key={property.id} className="overflow-hidden">
                  <div className="aspect-[4/3] overflow-hidden relative">
                    <ImageWithFallback
                      src={property.image}
                      alt={property.title}
                      className="w-full h-full object-cover"
                    />
                    <Badge className="absolute top-2 right-2 bg-green-500">
                      {property.status}
                    </Badge>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-[#2B2B2B] mb-1">{property.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">by {property.owner}</p>
                    <div className="flex items-center justify-between text-sm mb-3">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {property.location}
                      </span>
                      <span className="font-semibold">{property.price} EGP/night</span>
                    </div>
                    <div className="text-sm text-gray-600 mb-4">
                      {property.bookings} total bookings
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="w-3 h-3 mr-1" />
                        View
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-600"
                        onClick={() => handleDelete("Property", property.id, property.title)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Approvals Tab */}
          <TabsContent value="approvals" className="space-y-6">
            <h2 className="text-2xl font-semibold text-[#2B2B2B]">Pending Approvals</h2>
            
            {pendingListings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {pendingListings.map((listing) => (
                  <Card key={listing.id} className="overflow-hidden">
                    <div className="aspect-[16/9] overflow-hidden">
                      <ImageWithFallback
                        src={listing.image}
                        alt={listing.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-[#2B2B2B] mb-1">{listing.title}</h3>
                          <p className="text-sm text-gray-600">by {listing.owner}</p>
                        </div>
                        <Badge variant="outline" className="bg-yellow-50">
                          Pending
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {listing.location}
                        </span>
                        <span className="font-semibold">{listing.price} EGP/night</span>
                      </div>
                      <p className="text-xs text-gray-500 mb-4">Submitted {listing.submitted}</p>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          className="flex-1 bg-green-600 hover:bg-green-700"
                          onClick={() => handleApprove(listing.id, listing.title)}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1 border-red-500 text-red-600 hover:bg-red-50"
                          onClick={() => handleReject(listing.id, listing.title)}
                        >
                          Reject
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-[#2B2B2B] mb-2">All caught up!</h3>
                <p className="text-gray-600">No pending listings to review</p>
              </Card>
            )}
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <h2 className="text-2xl font-semibold text-[#2B2B2B]">Reports & Suspicious Activity</h2>
            
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Property</TableHead>
                    <TableHead>Reporter</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-red-500" />
                          <span className="font-medium">{report.type}</span>
                        </div>
                      </TableCell>
                      <TableCell>{report.property}</TableCell>
                      <TableCell>{report.reporter}</TableCell>
                      <TableCell>{report.date}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(report.status)}>{report.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="w-3 h-3 mr-1" />
                            Review
                          </Button>
                          {report.status !== "Resolved" && (
                            <Button size="sm" className="bg-green-600 hover:bg-green-700">
                              Resolve
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <h2 className="text-2xl font-semibold text-[#2B2B2B]">Analytics & Insights</h2>
            
            {/* Top Listings */}
            <Card className="p-6">
              <h3 className="font-semibold text-[#2B2B2B] mb-4">Top Performing Listings</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Property</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Bookings</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Rating</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topListings.map((listing, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{listing.property}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-gray-400" />
                          {listing.location}
                        </div>
                      </TableCell>
                      <TableCell>{listing.bookings}</TableCell>
                      <TableCell className="font-semibold">{listing.revenue.toLocaleString()} EGP</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          {listing.rating}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>

            {/* Cities Performance */}
            <Card className="p-6">
              <h3 className="font-semibold text-[#2B2B2B] mb-4">Most Booked Cities</h3>
              <div className="space-y-4">
                {citiesData.map((city, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-[#00BFA6]" />
                        <span className="font-medium">{city.city}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span>{city.bookings} bookings</span>
                        <span className="font-semibold">{city.revenue.toLocaleString()} EGP</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-[#00BFA6] h-2 rounded-full"
                          style={{ width: `${(city.bookings / citiesData[0].bookings) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-600 w-20 text-right">{city.properties} properties</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleteDialog.type}</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteDialog.name}"? This action cannot be undone.
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
