import { FileText } from "lucide-react";
import { Link, useLocation } from "wouter";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const navigation = [
  { name: "Dashboard", path: "/" },
  { name: "Fetch CVs", path: "/fetch-cvs" },
  { name: "Rank Resumes", path: "/rank-resumes" },
  { name: "Results", path: "/results" },
];

export function Header() {
  const [location] = useLocation();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 hover-elevate active-elevate-2 rounded-md px-2 py-1 -ml-2" data-testid="link-home">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
              <FileText className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold">ResumeRank</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navigation.map((item) => (
              <Link key={item.path} href={item.path}>
                <Button
                  variant={location === item.path ? "secondary" : "ghost"}
                  className="text-sm font-medium"
                  data-testid={`link-nav-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  {item.name}
                </Button>
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Avatar className="h-8 w-8" data-testid="avatar-user">
            <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
              D
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
