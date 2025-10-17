import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Home as HomeIcon,
  Calendar,
  Users,
  MessageSquare,
  Star,
  Settings,
  HelpCircle,
  BarChart3,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const mainItems = [
  { title: "Overview", url: "/dashboard", icon: LayoutDashboard },
  { title: "Properties", url: "/dashboard/properties", icon: HomeIcon },
  { title: "Bookings", url: "/dashboard/bookings", icon: Calendar },
  { title: "Analytics", url: "/dashboard/analytics", icon: BarChart3 },
];

const supportItems = [
  { title: "Customers", url: "/dashboard/customers", icon: Users },
  { title: "Messages", url: "/dashboard/messages", icon: MessageSquare },
  { title: "Reviews", url: "/dashboard/reviews", icon: Star },
  { title: "Settings", url: "/dashboard/settings", icon: Settings },
  { title: "Help Center", url: "/dashboard/help", icon: HelpCircle },
];

export function DashboardSidebar() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar className={isCollapsed ? "w-16" : "w-64"} collapsible="icon">
      <SidebarContent className="bg-card/50 backdrop-blur-sm">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase text-muted-foreground">
            Dashboard
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className={({ isActive }) =>
                        `flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
                          isActive
                            ? "bg-primary text-primary-foreground font-medium"
                            : "hover:bg-accent"
                        }`
                      }
                    >
                      <item.icon className="h-5 w-5" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase text-muted-foreground">
            Support
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {supportItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={({ isActive }) =>
                        `flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
                          isActive
                            ? "bg-primary text-primary-foreground font-medium"
                            : "hover:bg-accent"
                        }`
                      }
                    >
                      <item.icon className="h-5 w-5" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
