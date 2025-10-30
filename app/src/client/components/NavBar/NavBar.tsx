// src/client/components/NavBar/NavBar.tsx
// Updated to include CRM features

import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth, logout } from 'wasp/client/auth';
import { useState } from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  ShoppingCart, 
  CheckCircle, 
  Settings,
  LogOut,
  User,
  Building2,
  Users,
  UserPlus,
  Wrench,
  MessageSquare,
  Menu,
  X,
  DollarSign,
  ChevronDown,
} from 'lucide-react';

export default function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [crmDropdownOpen, setCrmDropdownOpen] = useState(false);
  const [financeDropdownOpen, setFinanceDropdownOpen] = useState(false);
  const [adminDropdownOpen, setAdminDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (!user) {
    return null;
  }

  const isAdmin = user.isAdmin || user.role === 'ADMIN';

  const crmItems = [
    { name: 'Residents', path: '/crm/residents', icon: Users },
    { name: 'Leads', path: '/crm/leads', icon: UserPlus },
    { name: 'Maintenance', path: '/crm/maintenance', icon: Wrench },
    { name: 'Campaigns', path: '/crm/campaigns', icon: MessageSquare },
  ];

  const financeItems = [
    { name: 'Invoices', path: '/invoices', icon: FileText },
    { name: 'Purchase Orders', path: '/purchase-orders', icon: ShoppingCart },
    { name: 'Approvals', path: '/approvals', icon: CheckCircle },
  ];

  const adminItems = [
    { name: 'Users', path: '/admin/users', icon: Users },
    { name: 'Configuration', path: '/admin/configuration', icon: Settings },
  ];

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard' || location.pathname === '/admin';
    }
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const isParentActive = (items: any[]) => {
    return items.some(item => isActive(item.path));
  };

  const closeAllDropdowns = () => {
    setCrmDropdownOpen(false);
    setFinanceDropdownOpen(false);
    setAdminDropdownOpen(false);
    setUserDropdownOpen(false);
  };

  return (
    <nav className="border-b bg-white sticky top-0 z-50 shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div 
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate('/dashboard')}
          >
            <Building2 className="h-7 w-7 text-blue-600" />
            <h1 className="text-lg font-bold hidden sm:block">
              <span className="text-blue-600">Property</span>
              <span className="text-gray-900">Hub</span>
            </h1>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            {/* Dashboard */}
            <button
              onClick={() => navigate('/dashboard')}
              className={`
                flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors
                ${isActive('/dashboard')
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-700 hover:bg-gray-100'
                }
              `}
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </button>

            {/* CRM Dropdown */}
            <div className="relative">
              <button 
                onClick={() => {
                  setCrmDropdownOpen(!crmDropdownOpen);
                  setFinanceDropdownOpen(false);
                  setAdminDropdownOpen(false);
                  setUserDropdownOpen(false);
                }}
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors
                  ${isParentActive(crmItems)
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-700 hover:bg-gray-100'
                  }
                `}
              >
                <Users className="h-4 w-4" />
                CRM
                <ChevronDown className="h-3 w-3" />
              </button>
              {crmDropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setCrmDropdownOpen(false)}
                  ></div>
                  <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg border z-20">
                    {crmItems.map(item => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.path}
                          onClick={() => {
                            navigate(item.path);
                            setCrmDropdownOpen(false);
                          }}
                          className={`
                            w-full flex items-center gap-2 px-4 py-2 text-sm transition-colors
                            ${isActive(item.path)
                              ? 'bg-blue-50 text-blue-600 font-medium'
                              : 'text-gray-700 hover:bg-gray-100'
                            }
                          `}
                        >
                          <Icon className="h-4 w-4" />
                          {item.name}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {/* Finance Dropdown */}
            <div className="relative">
              <button 
                onClick={() => {
                  setFinanceDropdownOpen(!financeDropdownOpen);
                  setCrmDropdownOpen(false);
                  setAdminDropdownOpen(false);
                  setUserDropdownOpen(false);
                }}
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors
                  ${isParentActive(financeItems)
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-700 hover:bg-gray-100'
                  }
                `}
              >
                <FileText className="h-4 w-4" />
                Finance
                <ChevronDown className="h-3 w-3" />
              </button>
              {financeDropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setFinanceDropdownOpen(false)}
                  ></div>
                  <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg border z-20">
                    {financeItems.map(item => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.path}
                          onClick={() => {
                            navigate(item.path);
                            setFinanceDropdownOpen(false);
                          }}
                          className={`
                            w-full flex items-center gap-2 px-4 py-2 text-sm transition-colors
                            ${isActive(item.path)
                              ? 'bg-blue-50 text-blue-600 font-medium'
                              : 'text-gray-700 hover:bg-gray-100'
                            }
                          `}
                        >
                          <Icon className="h-4 w-4" />
                          {item.name}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {/* Admin Dropdown */}
            {isAdmin && (
              <div className="relative">
                <button 
                  onClick={() => {
                    setAdminDropdownOpen(!adminDropdownOpen);
                    setCrmDropdownOpen(false);
                    setFinanceDropdownOpen(false);
                    setUserDropdownOpen(false);
                  }}
                  className={`
                    flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors
                    ${isParentActive(adminItems)
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                >
                  <Settings className="h-4 w-4" />
                  Admin
                  <ChevronDown className="h-3 w-3" />
                </button>
                {adminDropdownOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setAdminDropdownOpen(false)}
                    ></div>
                    <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg border z-20">
                      {adminItems.map(item => {
                        const Icon = item.icon;
                        return (
                          <button
                            key={item.path}
                            onClick={() => {
                              navigate(item.path);
                              setAdminDropdownOpen(false);
                            }}
                            className={`
                              w-full flex items-center gap-2 px-4 py-2 text-sm transition-colors
                              ${isActive(item.path)
                                ? 'bg-blue-50 text-blue-600 font-medium'
                                : 'text-gray-700 hover:bg-gray-100'
                              }
                            `}
                          >
                            <Icon className="h-4 w-4" />
                            {item.name}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-2">
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>

            {/* Desktop User Dropdown */}
            <div className="hidden md:block relative">
              <button 
                onClick={() => {
                  setUserDropdownOpen(!userDropdownOpen);
                  /*closeAllDropdowns();*/
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                <User className="h-4 w-4" />
                <span className="hidden lg:inline max-w-[150px] truncate">
                  {user.username || user.email}
                </span>
                <ChevronDown className="h-3 w-3" />
              </button>
              {userDropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setUserDropdownOpen(false)}
                  ></div>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border z-20">
                    <button
                      onClick={() => {
                        navigate('/account');
                        setUserDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <User className="h-4 w-4" />
                      Account Settings
                    </button>
                    <button
                      onClick={() => {
                        navigate('/pricing');
                        setUserDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <DollarSign className="h-4 w-4" />
                      Pricing
                    </button>
                    <div className="border-t"></div>
                    <button
                      onClick={() => {
                        handleLogout();
                        setUserDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-white">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {/* Dashboard */}
            <button
              onClick={() => {
                navigate('/dashboard');
                setMobileMenuOpen(false);
              }}
              className={`
                w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium
                ${isActive('/dashboard')
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-700 hover:bg-gray-100'
                }
              `}
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </button>

            {/* CRM Section */}
            <div className="border-t my-2"></div>
            <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase flex items-center gap-2">
              <Users className="h-4 w-4" />
              CRM
            </div>
            {crmItems.map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setMobileMenuOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium pl-8
                    ${isActive(item.path)
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </button>
              );
            })}

            {/* Finance Section */}
            <div className="border-t my-2"></div>
            <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Finance
            </div>
            {financeItems.map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setMobileMenuOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium pl-8
                    ${isActive(item.path)
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </button>
              );
            })}

            {/* Admin Section */}
            {isAdmin && (
              <>
                <div className="border-t my-2"></div>
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Admin
                </div>
                {adminItems.map(item => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.path}
                      onClick={() => {
                        navigate(item.path);
                        setMobileMenuOpen(false);
                      }}
                      className={`
                        w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium pl-8
                        ${isActive(item.path)
                          ? 'bg-blue-600 text-white' 
                          : 'text-gray-700 hover:bg-gray-100'
                        }
                      `}
                    >
                      <Icon className="h-4 w-4" />
                      {item.name}
                    </button>
                  );
                })}
              </>
            )}

            {/* User Section */}
            <div className="border-t my-2"></div>
            <button
              onClick={() => {
                navigate('/account');
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              <User className="h-4 w-4" />
              Account Settings
            </button>
            <button
              onClick={() => {
                navigate('/pricing');
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              <DollarSign className="h-4 w-4" />
              Pricing
            </button>
            <button
              onClick={() => {
                handleLogout();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-gray-100"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

// Export type for compatibility
export type NavigationItem = {
  name: string;
  to: string;
};
