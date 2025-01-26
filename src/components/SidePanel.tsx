import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LogOut, Settings, Users, Home, FileText, GitBranch } from "lucide-react";
import { useLocation, Link } from "react-router-dom";
import { useAuthLogout } from '@/hooks/useAuthLogout';

interface SidePanelProps {
  userRole: string | null;
}

const SidePanel = ({ userRole }: SidePanelProps) => {
  const { handleLogout } = useAuthLogout();
  const location = useLocation();

  const links = [
    {
      title: "Dashboard",
      label: "",
      icon: <Home className="w-4 h-4" />,
      variant: "ghost",
      href: "/dashboard",
    },
    {
      title: "Members",
      label: "",
      icon: <Users className="w-4 h-4" />,
      variant: "ghost",
      href: "/users",
    },
    {
      title: "Audit",
      label: "",
      icon: <FileText className="w-4 h-4" />,
      variant: "ghost",
      href: "/audit",
    },
    {
      title: "System",
      label: "",
      icon: <Settings className="w-4 h-4" />,
      variant: "ghost",
      href: "/system",
    },
    {
      title: "Git",
      label: "",
      icon: <GitBranch className="w-4 h-4" />,
      variant: "ghost",
      href: "/git",
    },
  ];

  const filteredLinks = links.filter(link => {
    if (userRole === 'admin') return true;
    if (userRole === 'collector') {
      return ['Dashboard', 'Members'].includes(link.title);
    }
    if (userRole === 'member') {
      return ['Dashboard'].includes(link.title);
    }
    return false;
  });

  return (
    <div className="flex h-screen">
      <div className="relative border-r border-dashboard-cardBorder bg-dashboard-card px-3 py-8 h-full">
        <div className="flex flex-col h-full">
          <div className="space-y-4 py-4">
            <div className="px-3 py-2">
              <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight text-dashboard-accent1">
                Overview
              </h2>
              <div className="space-y-1">
                {filteredLinks.map((link, index) => (
                  <Link
                    key={index}
                    to={link.href}
                    className={cn(
                      "flex items-center justify-start w-full p-2 text-sm font-medium rounded-md text-dashboard-text hover:text-white hover:bg-dashboard-cardHover",
                      location.pathname === link.href && "bg-dashboard-cardHover text-white"
                    )}
                  >
                    {link.icon}
                    <span className="ml-2">{link.title}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleLogout}
          className="absolute bottom-4 left-4"
        >
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default SidePanel;