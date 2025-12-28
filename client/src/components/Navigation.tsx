import {
    Home as HomeIcon,
    Search,
    History,
    Settings,
    Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface NavigationProps {
    location: string;
    setLocation: (path: string) => void;
}

export function Navigation({ location, setLocation }: NavigationProps) {
    const navItems = [
        { icon: HomeIcon, label: "Início", path: "/" },
        { icon: Search, label: "Buscar", path: "/search" },
        { icon: History, label: "Histórico", path: "/history" }, // Placeholder route
        { icon: Settings, label: "Ajustes", path: "/settings" }, // Placeholder route
    ];

    return (
        <>
            {/* Mobile Bottom Nav */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-2 flex justify-between items-center z-50 pb-safe">
                {navItems.map((item) => {
                    const isActive = location === item.path;
                    return (
                        <button
                            key={item.label}
                            onClick={() => setLocation(item.path)}
                            className={cn(
                                "flex flex-col items-center gap-1 p-2 transition-colors",
                                isActive ? "text-blue-600" : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            <item.icon className={cn("w-6 h-6", isActive && "fill-current")} />
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* Desktop Sidebar */}
            <div className="hidden md:flex fixed left-0 top-0 bottom-0 w-20 flex-col items-center py-8 bg-white border-r border-slate-200 z-50">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white mb-8 shadow-lg shadow-blue-600/20">
                    <Sparkles className="w-6 h-6 fill-current" />
                </div>

                <div className="flex flex-col gap-6 w-full px-2">
                    {navItems.map((item) => {
                        const isActive = location === item.path;
                        return (
                            <button
                                key={item.label}
                                onClick={() => setLocation(item.path)}
                                className={cn(
                                    "flex flex-col items-center justify-center w-full aspect-square rounded-xl transition-all duration-200",
                                    isActive
                                        ? "bg-blue-50 text-blue-600"
                                        : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"
                                )}
                                title={item.label}
                            >
                                <item.icon className={cn("w-6 h-6 mb-1", isActive && "fill-current")} />
                            </button>
                        );
                    })}
                </div>

                <div className="mt-auto">
                    <Avatar className="w-10 h-10 ring-2 ring-slate-100 cursor-pointer hover:ring-blue-100 transition-all">
                        <AvatarImage src="https://github.com/shadcn.png" />
                        <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                </div>
            </div>
        </>
    );
}
