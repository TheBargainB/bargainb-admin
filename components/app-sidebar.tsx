"use client"

import { BarChart3, MessageSquare, Package, Users, Settings, Home, Activity, Bug, Bot } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarRail,
} from "@/components/ui/sidebar"

const menuItems = [
  {
    title: "Dashboard",
    url: "/admin",
    icon: Home,
    description: "Platform overview & KPIs",
  },
  {
    title: "Users",
    url: "/admin/users",
    icon: Users,
    description: "CRM & access management",
  },
  {
    title: "Products",
    url: "/admin/products",
    icon: Package,
    description: "Product catalog management",
  },
  {
    title: "Chat",
    url: "/admin/chat",
    icon: MessageSquare,
    description: "Customer conversations",
  },
  {
    title: "Analytics",
    url: "/admin/analytics",
    icon: BarChart3,
    description: "Business insights & reports",
  },
  {
    title: "AI Management",
    url: "/admin/ai-management",
    icon: Bot,
    description: "AI assistants & automation",
  },
  {
    title: "Settings",
    url: "/admin/settings",
    icon: Settings,
    description: "System configuration",
  },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar collapsible="icon" className="transition-all duration-300 ease-in-out">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/admin" className="flex items-center gap-3">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Package className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">BargainB</span>
                  <span className="truncate text-xs">Admin Panel</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Platform Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={pathname === item.url} 
                    tooltip={item.description}
                    className="transition-colors duration-200"
                  >
                    <Link href={item.url} className="flex items-center gap-3 w-full">
                      <item.icon className="size-4 flex-shrink-0" />
                      <span className="truncate flex-1">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="transition-colors duration-200">
              <Activity className="size-4 flex-shrink-0" />
              <div className="flex flex-col gap-0.5 flex-1">
                <span className="text-xs font-medium truncate">System Status</span>
                <div className="flex items-center gap-1">
                  <div className="size-2 rounded-full bg-green-500 flex-shrink-0" />
                  <span className="text-xs text-muted-foreground truncate">Online</span>
                </div>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
