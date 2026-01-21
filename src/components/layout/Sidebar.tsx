import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Upload,
  TrendingUp,
  Building2,
  FileBarChart,
  Settings,
  ChevronDown,
  Plane,
  Ship,
  Truck,
  BarChart3,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Treasury Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Business Units', href: '/business-units', icon: Building2 },
  { name: 'Forecast Accuracy', href: '/accuracy', icon: FileBarChart },
];

const uploadItems = [
  { name: 'AR Aging', href: '/upload/ar-aging', icon: TrendingUp },
  { name: 'AP Aging', href: '/upload/ap-aging', icon: TrendingUp },
  { name: 'Contract Terms', href: '/upload/contracts', icon: FileBarChart },
  { name: 'Historical Patterns', href: '/upload/patterns', icon: BarChart3 },
];

const businessUnits = [
  { name: 'Aviation', icon: Plane, color: 'text-aviation' },
  { name: 'Marine', icon: Ship, color: 'text-marine' },
  { name: 'Land', icon: Truck, color: 'text-land' },
  { name: 'Trading', icon: BarChart3, color: 'text-trading' },
];

export function Sidebar() {
  const location = useLocation();
  const [uploadExpanded, setUploadExpanded] = useState(true);

  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col h-screen fixed left-0 top-0">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-aviation flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-semibold text-foreground">WKC Treasury</h1>
            <p className="text-xs text-muted-foreground">Cash Flow Forecasting</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {/* Main Nav */}
        <div className="space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn('nav-link', isActive && 'active')}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>

        {/* Upload Section */}
        <div className="pt-6">
          <button
            onClick={() => setUploadExpanded(!uploadExpanded)}
            className="flex items-center justify-between w-full px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <span className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Data Uploads
            </span>
            <ChevronDown
              className={cn(
                'w-4 h-4 transition-transform',
                uploadExpanded && 'rotate-180'
              )}
            />
          </button>
          {uploadExpanded && (
            <div className="mt-1 space-y-1 pl-2">
              {uploadItems.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn('nav-link text-sm', isActive && 'active')}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Business Units Quick Access */}
        <div className="pt-6">
          <p className="px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Business Units
          </p>
          <div className="mt-1 space-y-1">
            {businessUnits.map((bu) => (
              <div
                key={bu.name}
                className="flex items-center gap-3 px-4 py-2 text-sm text-muted-foreground"
              >
                <bu.icon className={cn('w-4 h-4', bu.color)} />
                <span>{bu.name}</span>
              </div>
            ))}
          </div>
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
        <Link to="/settings" className="nav-link">
          <Settings className="w-5 h-5" />
          <span>Settings</span>
        </Link>
        <div className="mt-4 px-4 py-3 rounded-lg bg-accent/50">
          <p className="text-xs text-muted-foreground">Logged in as</p>
          <p className="text-sm font-medium text-foreground">Treasury Admin</p>
        </div>
      </div>
    </aside>
  );
}
