import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { MobileBottomNav } from './MobileBottomNav';
import { GlobalSearchModal } from '../common/GlobalSearchModal';
import { NotificationDrawer } from '../common/NotificationDrawer';
import { TenantSwitcherModal } from '../common/TenantSwitcherModal';
import { GlobalChatbotWidget } from '../chat/GlobalChatbotWidget';

interface AppShellProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  onOpenDemo: () => void;
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ currentRoute, onNavigate, onOpenDemo, children }) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [tenantSwitcherOpen, setTenantSwitcherOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8F7F2] text-[#131618] flex flex-col font-sans selection:bg-[#E05A1B]/20">
      {/* Persistent 2D Collapsible Sidebar */}
      <Sidebar
        currentRoute={currentRoute}
        onNavigate={onNavigate}
        isOpenMobile={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* Main Content Area */}
      <div
        className={`transition-all duration-200 ease-in-out ${
          isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        } flex flex-col min-h-screen`}
      >
        {/* Persistent Topbar with Realme Fluid Cloud Island */}
        <Topbar
          currentRoute={currentRoute}
          isSidebarCollapsed={isSidebarCollapsed}
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          onOpenSearch={() => setSearchOpen(true)}
          onOpenNotifications={() => setNotificationsOpen(true)}
          onOpenTenantSwitcher={() => setTenantSwitcherOpen(true)}
          onOpenDemo={onOpenDemo}
        />

        {/* Page Content Container */}
        <main className="flex-1 w-full pt-16 pb-20 lg:pb-6">
          <div className="max-w-[1720px] w-full mx-auto px-2 sm:px-6 lg:px-8 py-3 sm:py-6 space-y-4 sm:space-y-6">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile-First PWA Bottom Floating Bar */}
      <MobileBottomNav
        currentRoute={currentRoute}
        onNavigate={onNavigate}
        onOpenDemo={onOpenDemo}
      />

      {/* Global Modals & Drawers */}
      <GlobalSearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onNavigate={onNavigate}
      />

      <NotificationDrawer
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        onNavigate={onNavigate}
      />

      <TenantSwitcherModal
        isOpen={tenantSwitcherOpen}
        onClose={() => setTenantSwitcherOpen(false)}
      />

      {/* AI Floating Chatbot */}
      <GlobalChatbotWidget onNavigate={onNavigate} />
    </div>
  );
};
