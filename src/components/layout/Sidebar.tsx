import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Building,
  Users,
  Calendar,
  Ticket,
  DollarSign,
  Settings,
  ChevronLeft,
  ChevronRight,
  UserCog
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Contratos', href: '/contratos', icon: FileText },
  { name: 'Unidades', href: '/unidades', icon: Building },
  { name: 'Entidades', href: '/entidades', icon: Users },
  { name: 'Projetos', href: '/projetos', icon: Calendar },
  { name: 'Bilheteria', href: '/bilheteria', icon: Ticket },
  { name: 'Financeiro', href: '/financeiro', icon: DollarSign },
  { name: 'Usuários', href: '/usuarios', icon: UserCog },
  { name: 'Configurações', href: '/configuracoes', icon: Settings },
];

interface SidebarProps {
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
}

export function Sidebar({ collapsed, onCollapsedChange }: SidebarProps) {
  const location = useLocation();

  return (
    <div className={cn(
      "fixed inset-y-0 left-0 z-50 bg-white shadow-lg transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-4 border-b">
          {!collapsed && (
            <div className="flex items-center">
              <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">GC</span>
              </div>
              <span className="ml-2 text-lg font-semibold text-gray-900">
                Gestão Chevals
              </span>
            </div>
          )}
          <button
            onClick={() => onCollapsedChange(!collapsed)}
            className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors",
                  isActive
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
                title={collapsed ? item.name : undefined}
              >
                <item.icon
                  className={cn(
                    "flex-shrink-0 h-5 w-5",
                    isActive ? "text-blue-500" : "text-gray-400 group-hover:text-gray-500",
                    collapsed ? "mx-auto" : "mr-3"
                  )}
                />
                {!collapsed && item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}