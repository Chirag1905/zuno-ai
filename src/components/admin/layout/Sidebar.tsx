"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSidebar } from "@/context/SidebarContext";
import { ChevronDownIcon, FlipVertical2, LayoutDashboard, Store, Users, UserPlus, UserCog, CreditCard, BarChart3, TableOfContents, ScanSearch, LogOut } from "lucide-react";
import { SidebarBrand } from "@/components/ui/SidebarBrand";
import ZunoLogo from "@/components/ui/ZunoLogo";
import SidebarWidget from "@/components/admin/layout/SidebarWidget";
import Button from "@/components/ui/Button";
import { authService } from "@/services/auth.api";

type SubItem = {
  name: string;
  path: string;
  icon: React.ReactNode;
  iconKey: keyof typeof ICONS;
  pro?: boolean;
  new?: boolean;
};

type NavItem = {
  name: string;
  icon: React.ReactNode;
  iconKey: keyof typeof ICONS;
  path?: string;
  subItems?: SubItem[];
};

type PinnedItem = {
  name: string;
  path: string;
  iconKey: keyof typeof ICONS;
};

const ICONS = {
  dashboard: <LayoutDashboard />,
  tableOfContents: <TableOfContents />,
  analytics: <BarChart3 />,
  users: <Users />,
  addUser: <UserPlus />,
  roles: <UserCog />,
  subscriptions: <Store />,
  plans: <CreditCard />,
} as const;

// Menu for Admin
const NavItems: NavItem[] = [
  {
    name: "Dashboard",
    icon: <LayoutDashboard />,
    iconKey: "dashboard",
    path: "/admin"
    // subItems: [
    //   {
    //     name: "Overview",
    //     path: "/admin",
    //     icon: <TableOfContents size={16} />,
    //     iconKey: "tableOfContents",
    //   },
    //   {
    //     name: "Analytics",
    //     path: "/admin/analytics",
    //     icon: <BarChart3 size={16} />,
    //     iconKey: "analytics",
    //   },
    // ],
  },
  {
    name: "Users",
    icon: <Users />,
    iconKey: "users",
    subItems: [
      {
        name: "All Users",
        path: "/admin/users",
        icon: <Users size={16} />,
        iconKey: "users",
      },
      {
        name: "Add User",
        path: "/admin/users/add",
        icon: <UserPlus size={16} />,
        iconKey: "addUser",
      },
      {
        name: "Roles",
        path: "/admin/users/roles",
        icon: <UserCog size={16} />,
        iconKey: "roles",
      },
    ],
  },
];

// const OtherItems: NavItem[] = [
//   { name: "Dashboard", icon: <LayoutDashboard />, path: "/admin" },
//   { name: "Users", icon: <Users />, path: "/admin/users" },
//   { name: "Sub Admin", icon: <UserStar />, path: "/admin/subAdmin" },
//   { name: "Subscriptions", icon: <Store />, path: "/admin/subscriptions" },
// ];

const Sidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();
  const isCollapsed = !isExpanded && !isHovered && !isMobileOpen;
  const router = useRouter();

  // STATE FOR PINNED ITEMS - Use lazy initialization to avoid setState in useEffect
  const [pinnedItems, setPinnedItems] = useState<PinnedItem[]>(() => {
    if (typeof window !== 'undefined') {
      const savedPins = localStorage.getItem("pinnedItems");
      return savedPins ? JSON.parse(savedPins) : [];
    }
    return [];
  });

  // Save pinned items to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("pinnedItems", JSON.stringify(pinnedItems));
  }, [pinnedItems]);

  // FUNCTIONS FOR PIN ACTION

  const togglePin = (item: PinnedItem) => {
    setPinnedItems((prev) => {
      const exists = prev.find((p) => p.path === item.path);
      return exists
        ? prev.filter((p) => p.path !== item.path)
        : [...prev, item];
    });
  };

  const isPinned = (path: string) => pinnedItems.some((item) => item.path === path);

  // HANDLE SUBMENU
  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);

  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>({});
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isActive = useCallback((path: string) => path === pathname, [pathname]);

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (prevOpenSubmenu?.type === menuType && prevOpenSubmenu?.index === index) {
        return null; // Close if same submenu clicked
      }
      return { type: menuType, index };
    });
  };

  //  RENDER MENU ITEMS
  const renderMenuItems = (items: NavItem[], menuType: "main" | "others") => (
    <ul className="flex flex-col gap-4">
      {items.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <div>
              {/* Parent Button */}
              <button
                onClick={(e) => {
                  if (isCollapsed) return;
                  e.preventDefault();
                  e.stopPropagation();
                  handleSubmenuToggle(index, menuType);
                }}
                className={`menu-item group ${openSubmenu?.type === menuType && openSubmenu?.index === index ? "menu-item-active" : "menu-item-inactive"} cursor-pointer ${!isExpanded && !isHovered ? "lg:justify-center" : "lg:justify-start"
                  }`}
              >
                <span className={`${openSubmenu?.type === menuType && openSubmenu?.index === index ? "menu-item-icon-active" : "menu-item-icon-inactive"}`}>
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && <span className="menu-item-text">{nav.name}</span>}
                {(isExpanded || isHovered || isMobileOpen) && (
                  <ChevronDownIcon
                    className={`ml-auto w-5 h-5 transition-transform duration-200 ${openSubmenu?.type === menuType && openSubmenu?.index === index ? "rotate-180 text-brand-500" : ""
                      }`}
                  />
                )}
              </button>

              {/* Submenu */}
              {!isCollapsed && (
                <div
                  ref={(el) => {
                    subMenuRefs.current[`${menuType}-${index}`] = el;
                  }}
                  className="overflow-hidden transition-all duration-300"
                  style={{
                    height: openSubmenu?.type === menuType && openSubmenu?.index === index ? `${subMenuHeight[`${menuType}-${index}`]}px` : "0px",
                  }}
                >
                  <ul className="mt-2 space-y-1 ml-9">
                    {nav.subItems.map((subItem) => (
                      <li key={subItem.name} className="flex items-center justify-between group">
                        <Link
                          href={subItem.path}
                          className={`menu-dropdown-item flex-1 ${isActive(subItem.path) ? "menu-dropdown-item-active" : "menu-dropdown-item-inactive"}`}
                        >
                          <span className="flex items-center gap-3">{subItem.icon}{subItem.name}</span>
                          <Button
                            icon={isPinned(subItem.path) ? "PinOff" : "Pin"}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              togglePin({
                                name: subItem.name,
                                path: subItem.path,
                                iconKey: subItem.iconKey,
                              });
                            }}
                            variant="optional"
                            compact
                            iconClassName={isPinned(subItem.path) ? "text-brand-500" : "text-brand-400"}
                            className="ml-2 text-gray-400 hover:text-brand-500"
                          />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            nav.path && (() => {
              const path = nav.path; // ✅ now TS knows it's string

              return (
                <div className="flex items-center justify-between">
                  <Link
                    href={path}
                    className={`menu-item group
          ${isActive(path) ? "menu-item-active" : "menu-item-inactive"}
          ${isCollapsed ? "justify-center px-0" : "justify-between"}
        `}
                  >
                    <span className="flex items-center gap-3">
                      <span className={isActive(path)
                        ? "menu-item-icon-active"
                        : "menu-item-icon-inactive"}
                      >
                        {nav.icon}
                      </span>

                      {!isCollapsed && (
                        <span className="menu-item-text">{nav.name}</span>
                      )}
                    </span>

                    {!isCollapsed && (
                      <Button
                        icon={isPinned(path) ? "PinOff" : "Pin"}
                        onClick={() =>
                          togglePin({
                            name: nav.name,
                            path,
                            iconKey: nav.iconKey,
                          })
                        }
                        variant="optional"
                        compact
                        iconClassName={isPinned(path) ? "text-brand-500" : "text-brand-400"}
                      />
                    )}
                  </Link>
                </div>
              );
            })()
          )}
        </li>
      ))}
    </ul>
  );

  //  CALCULATE SUBMENU HEIGHT
  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prev) => ({
          ...prev,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  // AUTO OPEN SUBMENU BASED ON URL
  useEffect(() => {
    let newSubmenu: { type: "main" | "others"; index: number } | null = null;

    NavItems.some((nav, index) => {
      const hasMatch = nav.subItems?.some((subItem) => isActive(subItem.path));
      if (hasMatch) {
        newSubmenu = { type: "main", index };
        return true; // break
      }
      return false;
    });

    if (newSubmenu) {
      const targetMenu = newSubmenu as { type: "main" | "others"; index: number };
      setOpenSubmenu((prev) => {
        if (prev?.type === targetMenu.type && prev?.index === targetMenu.index) {
          return prev;
        }
        return targetMenu;
      });
    }
  }, [pathname, isActive]);

  return (
    <aside
      className={`
    fixed top-0 left-0 z-50 h-screen mt-16 lg:mt-0
    bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800
    transition-all duration-300 ease-in-out
    ${isCollapsed ? "w-20 px-3" : "w-72 px-5"}
    ${isMobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0
  `}
      onMouseEnter={() => isCollapsed && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Logo Section */}
      <div className={`py-8 flex ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"}`}>
        <Link href="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <SidebarBrand />
          ) : (
            <div className="flex items-center justify-center">
              <ZunoLogo />
            </div>
          )}
        </Link>
      </div>

      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          {/* Quick Access */}
          {pinnedItems.length > 0 && (
            <div className="mb-6">
              <h2 className={`mb-4 text-xs uppercase flex leading-5 text-gray-400 ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"}`}>
                {isExpanded || isHovered || isMobileOpen ? "Quick Access" : <ScanSearch />}
              </h2>
              <ul className="flex flex-col gap-3">
                {pinnedItems.map((item) => (
                  <li key={item.path}>
                    <Link
                      href={item.path}
                      className={`menu-item group ${isActive(item.path) ? "menu-item-active" : "menu-item-inactive"}`}
                    >
                      <p className="flex items-center gap-3">
                        <span className={isActive(item.path)
                          ? "menu-item-icon-active"
                          : "menu-item-icon-inactive"}
                        >
                          {ICONS[item.iconKey]}
                        </span>
                        {(isExpanded || isHovered || isMobileOpen) && <span className="menu-item-text">{item.name}</span>}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Main Menu */}
          <div>
            <h2 className={`mt-2 mb-4 text-xs uppercase flex leading-5 text-gray-400 ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"}`}>
              {isExpanded || isHovered || isMobileOpen ? "Menu" : <FlipVertical2 />}
            </h2>
            {renderMenuItems(NavItems, "main")}
          </div>

          {/* Others */}
          {/* <div>
            <h2 className={`mt-4 mb-4 text-xs uppercase flex leading-5 text-gray-400 ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"}`}>
              {isExpanded || isHovered || isMobileOpen ? "Others" : <FlipVertical2 />}
            </h2>
            {renderMenuItems(OtherItems, "others")}
          </div> */}
        </nav>

        {/* Logout Section */}
        <div className="mt-auto mb-6">
          <button
            onClick={async () => {
              try {
                await authService.logout();
              } catch (error) {
                console.error("Logout failed", error);
              } finally {
                router.push("/signin");
              }
            }}
            className={`menu-item group menu-item-inactive cursor-pointer w-full ${!isExpanded && !isHovered ? "lg:justify-center" : "lg:justify-start"
              }`}
          >
            <span className="menu-item-icon-inactive">
              <LogOut />
            </span>
            {(isExpanded || isHovered || isMobileOpen) && <span className="menu-item-text">Log Out</span>}
          </button>
        </div>

        {/* Sidebar Widget */}
        {isExpanded || isHovered || isMobileOpen ? <SidebarWidget /> : null}
      </div>
    </aside>
  );
};

export default Sidebar;