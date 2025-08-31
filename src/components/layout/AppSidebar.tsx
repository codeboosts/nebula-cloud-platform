import { useState } from "react";
import { 
  Server, 
  Database, 
  Shield, 
  CreditCard, 
  Users, 
  HardDrive, 
  GitBranch, 
  Bell,
  LayoutDashboard,
  Settings,
  LogOut
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

const mainItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "VPS Instances", url: "/dashboard/vps", icon: Server },
  { title: "Databases", url: "/dashboard/databases", icon: Database },
  { title: "Security Groups", url: "/dashboard/security", icon: Shield },
  { title: "Credits & Billing", url: "/dashboard/credits", icon: CreditCard },
  { title: "IAM Management", url: "/dashboard/iam", icon: Users },
  { title: "File Storage", url: "/dashboard/storage", icon: HardDrive },
  { title: "CI/CD Pipelines", url: "/dashboard/pipelines", icon: GitBranch },
  { title: "Notifications", url: "/dashboard/notifications", icon: Bell },
];

const settingsItems = [
  { title: "Settings", url: "/dashboard/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { signOut } = useAuth();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";

  const isActive = (path: string) => currentPath === path;
  const isExpanded = mainItems.some((i) => isActive(i.url)) || settingsItems.some((i) => isActive(i.url));
  
  const getNavCls = (isActive: boolean) =>
    isActive 
      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium border-r-2 border-primary" 
      : "hover:bg-sidebar-accent/50 text-sidebar-foreground";

  return (
    <Sidebar
      className={`${collapsed ? "w-16" : "w-64"} transition-all duration-300 border-r border-sidebar-border bg-sidebar`}
      collapsible="icon"
    >
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center flex-shrink-0">
            <Server className="w-5 h-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div>
              <h2 className="text-lg font-bold text-sidebar-foreground">Nebula Cloud</h2>
              <p className="text-xs text-sidebar-foreground/60">Cloud Platform</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/60 text-xs font-medium px-2 mb-2">
            {!collapsed && "MAIN SERVICES"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild
                    className={`${getNavCls(isActive(item.url))} transition-colors duration-200`}
                  >
                    <NavLink to={item.url} end className="flex items-center space-x-3 px-3 py-2 rounded-lg">
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      {!collapsed && <span className="truncate">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/60 text-xs font-medium px-2 mb-2">
            {!collapsed && "ACCOUNT"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild
                    className={`${getNavCls(isActive(item.url))} transition-colors duration-200`}
                  >
                    <NavLink to={item.url} className="flex items-center space-x-3 px-3 py-2 rounded-lg">
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      {!collapsed && <span className="truncate">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              onClick={signOut}
              className="hover:bg-destructive/10 text-destructive hover:text-destructive transition-colors duration-200"
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span>Sign Out</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}