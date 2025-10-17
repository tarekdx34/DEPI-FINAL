import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Users,
  DollarSign,
  Home,
  Bell,
  Search,
  MoreVertical,
  ArrowUpRight,
  Phone,
} from "lucide-react";
import { Input } from "@/components/ui/input";

const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const stats = [
    {
      title: "Total Properties",
      value: "24",
      change: "+3 this month",
      trend: "up",
      subtitle: "Active listings",
      icon: Home,
    },
    {
      title: "Active Bookings",
      value: "127",
      change: "+8.2%",
      trend: "up",
      subtitle: "vs last month",
      icon: Calendar,
    },
    {
      title: "Total Revenue",
      value: "45,231 EGP",
      change: "+12.5%",
      trend: "up",
      subtitle: "This month",
      icon: DollarSign,
    },
    {
      title: "Total Guests",
      value: "1,429",
      change: "+15%",
      trend: "up",
      subtitle: "All time",
      icon: Users,
    },
  ];

  const recentBookings = [
    { name: "Ahmed Hassan", property: "Sea View Apartment", amount: "3,200 EGP", date: "Jan 15-20", status: "Confirmed", avatar: "/placeholder.svg" },
    { name: "Sara Mohamed", property: "Beach Chalet", amount: "5,800 EGP", date: "Jan 22-28", status: "Pending", avatar: "/placeholder.svg" },
    { name: "Omar Ali", property: "Luxury Villa", amount: "8,500 EGP", date: "Feb 1-7", status: "Confirmed", avatar: "/placeholder.svg" },
    { name: "Layla Ibrahim", property: "Coastal Studio", amount: "2,400 EGP", date: "Feb 10-13", status: "Confirmed", avatar: "/placeholder.svg" },
  ];

  const activities = [
    { text: "New booking from Ahmed Hassan for Sea View Apartment", time: "2 hours ago", type: "booking" },
    { text: "Property 'Luxury Villa' listing approved", time: "4 hours ago", type: "property" },
    { text: "5-star review received from Sara Mohamed", time: "6 hours ago", type: "review" },
    { text: "Payment of 8,500 EGP processed successfully", time: "8 hours ago", type: "payment" },
    { text: "New inquiry for Beach Chalet", time: "1 day ago", type: "inquiry" },
  ];

  const propertyManagers = [
    { name: "Hassan Adel", status: "online", role: "Property Manager", avatar: "/placeholder.svg" },
    { name: "Layla Youssef", status: "offline", role: "Guest Relations", avatar: "/placeholder.svg" },
    { name: "Amira Khalil", status: "online", role: "Maintenance", avatar: "/placeholder.svg" },
  ];

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gradient-to-br from-background via-background to-primary/5">
        <DashboardSidebar />

        <div className="flex flex-1 flex-col">
          {/* Header */}
          <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6">
            <SidebarTrigger />
            <div className="flex flex-1 items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-accent"></span>
              </Button>
              <Avatar className="h-9 w-9">
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback>AJ</AvatarFallback>
              </Avatar>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Overview</h1>
                <p className="text-muted-foreground">Welcome back to your dashboard</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Calendar className="mr-2 h-4 w-4" />
                  Today
                </Button>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat, index) => {
                const IconComponent = stat.icon;
                return (
                  <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        {stat.title}
                      </CardTitle>
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <IconComponent className="h-5 w-5 text-primary" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{stat.value}</div>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-sm font-medium text-green-500">{stat.change}</span>
                        <span className="text-sm text-muted-foreground">{stat.subtitle}</span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              {/* Left Column - Charts & Tables */}
              <div className="lg:col-span-2 space-y-6">
                {/* Booking Overview Chart */}
                <Card className="border-0 shadow-lg">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Booking Overview</CardTitle>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-center h-64">
                      <div className="relative">
                        <svg className="h-48 w-48" viewBox="0 0 100 100">
                          <circle
                            cx="50"
                            cy="50"
                            r="40"
                            fill="none"
                            stroke="hsl(var(--muted))"
                            strokeWidth="12"
                          />
                          <circle
                            cx="50"
                            cy="50"
                            r="40"
                            fill="none"
                            stroke="hsl(var(--primary))"
                            strokeWidth="12"
                            strokeDasharray="251.2"
                            strokeDashoffset="62.8"
                            strokeLinecap="round"
                            transform="rotate(-90 50 50)"
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <div className="text-4xl font-bold">847</div>
                          <div className="text-sm text-muted-foreground">Weekly Bookings</div>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-6">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-primary"></div>
                        <div>
                          <p className="text-sm font-medium">Alexandria</p>
                          <p className="text-2xl font-bold">458</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-accent"></div>
                        <div>
                          <p className="text-sm font-medium">Matrouh</p>
                          <p className="text-2xl font-bold">389</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Bookings Table */}
                <Card className="border-0 shadow-lg">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Recent Bookings</CardTitle>
                    <Button variant="ghost" size="sm">
                      View All
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {recentBookings.map((booking, index) => (
                        <div key={index} className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                          <div className="flex items-center gap-3 flex-1">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={booking.avatar} />
                              <AvatarFallback>{booking.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <p className="font-medium">{booking.name}</p>
                              <p className="text-sm text-muted-foreground">{booking.property}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-sm text-muted-foreground">{booking.date}</p>
                              <Badge variant={booking.status === "Confirmed" ? "default" : "secondary"} className="mt-1">
                                {booking.status}
                              </Badge>
                            </div>
                            <p className="font-semibold min-w-[100px] text-right">{booking.amount}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Notifications & Activities */}
              <div className="space-y-6">
                {/* Upgrade Card */}
                <Card className="border-0 shadow-lg bg-gradient-to-br from-primary to-primary-dark text-primary-foreground">
                  <CardContent className="p-6">
                    <Badge className="mb-3 bg-accent text-accent-foreground">Premium Plan</Badge>
                    <h3 className="text-2xl font-bold mb-2">35 EGP / Per Month</h3>
                    <p className="text-sm mb-4 text-primary-foreground/90">
                      Boost your visibility. List unlimited properties and get priority support.
                    </p>
                    <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                      Get Started
                      <ArrowUpRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>

                {/* Activities */}
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-lg">Recent Activities</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {activities.map((activity, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="h-2 w-2 rounded-full bg-primary mt-2"></div>
                        <div>
                          <p className="text-sm font-medium">{activity.text}</p>
                          <p className="text-xs text-muted-foreground">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Property Management Team */}
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-lg">Property Team</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {propertyManagers.map((manager, index) => (
                      <div key={index} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={manager.avatar} />
                              <AvatarFallback>{manager.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                            </Avatar>
                            <span
                              className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background ${
                                manager.status === "online" ? "bg-green-500" : "bg-gray-400"
                              }`}
                            ></span>
                          </div>
                          <div>
                            <p className="text-sm font-medium">{manager.name}</p>
                            <p className="text-xs text-muted-foreground">{manager.role}</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Phone className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
