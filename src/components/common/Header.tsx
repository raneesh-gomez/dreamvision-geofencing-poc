import { LogOut, User as Person } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { useAppContext } from "@/hooks/use-app-context";
import type { User } from "@supabase/supabase-js";
import { onLogout } from "@/services/auth.service";

export function Header() {
    const navigate = useNavigate();
    const { user, setIsAuthenticated, setUser } = useAppContext();
    const initials = user ? getInitials(user) : "JD";
    const fullName = user ? getFullName(user) : "John Doe";
    const email = user ? getEmail(user) : "JohnDoe@gmail.com";

    function getInitials(user: User) {
        return `${user.user_metadata?.first_name[0] || 'J'}${user.user_metadata?.last_name[0] || 'D'}`.toUpperCase();
    }

    function getFullName(user: User) {
        return `${user.user_metadata?.first_name || 'John'} ${user.user_metadata?.last_name || 'Doe'}`;
    }

    function getEmail(user: User) {
        return `${user.user_metadata?.email || 'JohnDoe@gmail.com'}`;
    }

    const handleLogout = async () => {
        const error = await onLogout();
        if (error) {
            toast.error('Could not log out due to an error.');
        } else {
            setUser(null);
            setIsAuthenticated(false);
            navigate('/login');
        }
    };

    const handleProfile = () => {
        navigate("/profile");
    };

    return (
        <header className="h-16 bg-dashboard-header border-b border-border px-6 flex items-center justify-between drop-shadow-md">
            <div className="flex items-center cursor-pointer" onClick={() => navigate("/dashboard")}>
                <h1 className="text-xl font-semibold text-dashboard-header-foreground">
                    DreamLink
                </h1>
            </div>

            <div className="flex items-center gap-4">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            className="relative h-10 w-10 rounded-full hover:bg-muted"
                        >
                            <Avatar className="h-10 w-10">
                                <AvatarFallback className="bg-primary text-primary-foreground">
                                    {initials}
                                </AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-56 z-50 bg-popover shadow-[var(--shadow-dropdown)]"
                        align="end"
                        forceMount
                    >
                        <div className="flex items-center justify-start gap-2 p-2">
                            <div className="flex flex-col space-y-1 leading-none">
                                <p className="font-medium text-sm">{fullName}</p>
                                <p className="text-xs text-muted-foreground">
                                    {email}
                                </p>
                            </div>
                        </div>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={handleProfile}
                            className="cursor-pointer"
                        >
                            <Person className="mr-2 h-4 w-4" />
                            Profile
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={handleLogout}
                            className="cursor-pointer text-destructive focus:text-destructive"
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            Logout
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}