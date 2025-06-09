import * as React from "react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

import {
  LayoutDashboard,
  User,
  CalendarDays,
  HeartHandshake,
  HandCoins,
  HandHeart,
  Users,
  BarChart3,
  PlusCircle,
  Globe
} from "lucide-react";
import Link from "next/link";

const iconMap: Record<string, React.ReactNode> = {
  Dashboard: <LayoutDashboard className="size-4" />,
  Profile: <User className="size-4" />,
  Event: <CalendarDays className="size-4" />,
  Service: <HeartHandshake className="size-4" />,
  "My Donations": <HandCoins className="size-4" />,
  Donate: <HandHeart className="size-4" />,
  Participations: <Users className="size-4" />,
  Analytics: <BarChart3 className="size-4" />,
  "Add Event": <PlusCircle className="size-4" />,
  "Add Service": <PlusCircle className="size-4" />,
  "Add Donations": <PlusCircle className="size-4" />,
  "Manage Members": <Users className="size-4" />,
};

type Role = "REGULAR" | "MEMBER" | "TRUSTIE" | "UPPER_TRUSTIE"

// Define the routes per role
const roleRoutes: Record<Role, { title: string; url: string }[]> = {
  REGULAR: [
    { title: "Dashboard", url: "/dashboard" },
    { title: "Profile", url: "/dashboard/profile" },
    { title: "Event", url: "/dashboard/events" },
    { title: "Service", url: "/dashboard/services" },
    { title: "My Donations", url: "/dashboard/my-donations" },
    { title: "Donate", url: "/dashboard/donate" },
  ],
  MEMBER: [
    { title: "Participations", url: "/dashboard/participations" },
  ],
  TRUSTIE: [
    { title: "Analytics", url: "/dashboard/analytics" },
  ],
  UPPER_TRUSTIE: [
    { title: "Add Event", url: "/dashboard/add-event" },
    { title: "Add Service", url: "/dashboard/add-service" },
    { title: "Add Donations", url: '/dashboard/manual-donations' },
    { title: "Manage Members", url: '/dashboard/manage-members' },
  ],
}

// Role hierarchy
const rolesHierarchy: Role[] = ["REGULAR", "MEMBER", "TRUSTIE", "UPPER_TRUSTIE"]

// Function to get all routes for a role including lower roles
function getRoutesForRole(userRole: Role) {
  const userRoleIndex = rolesHierarchy.indexOf(userRole)
  if (userRoleIndex === -1) return []

  // Combine routes from current role and all lower roles
  const allowedRoles = rolesHierarchy.slice(0, userRoleIndex + 1)

  // Flatten routes for all allowed roles
  const combinedRoutes = allowedRoles.flatMap(role => roleRoutes[role])

  return combinedRoutes
}

export function AppSidebar({
  role,
  ...props
}: { role: Role } & React.ComponentProps<typeof Sidebar>) {

  const routes = React.useMemo(() => getRoutesForRole(role), [role])

  return (
    <Sidebar variant="floating" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Globe className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-medium">Hussani Welfare Org</span>
                  <span className="text-xs">Small Contribution towards socity</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu className="gap-2">
            {routes.map(({ title, url }) => (
              <SidebarMenuItem key={title}>
                <SidebarMenuButton asChild>
                  <Link href={url} className={`flex items-center gap-2 font-normal text-sm`}>
                    {iconMap[title]}
                    {title}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
