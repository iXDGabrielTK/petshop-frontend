import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    History,
    Settings,
    LogOut,
    Store
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/features/auth";

export function DashboardLayout() {
    const location = useLocation();
    const navigate = useNavigate();
    const logout = useAuthStore((state) => state.logout);

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const navItems = [
        { href: "/dashboard", label: "Visão Geral", icon: LayoutDashboard },
        { href: "/inventario/produtos", label: "Produtos", icon: Package },
        { href: "/inventario/pdv", label: "PDV (Vendas)", icon: ShoppingCart },
        { href: "/inventario/movimentacoes", label: "Histórico", icon: History },
        { href: "/configuracoes", label: "Configurações", icon: Settings },
    ];

    return (
        <div className="flex min-h-screen bg-gray-100">
            <aside className="w-64 bg-white border-r shadow-sm flex flex-col fixed inset-y-0 z-50">
                <div className="p-6 flex items-center gap-2 border-b">
                    <Store className="h-6 w-6 text-primary" />
                    <span className="font-bold text-xl text-gray-800">Malvadão Pet</span>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.href;
                        return (
                            <Link to={item.href} key={item.href}>
                                <Button
                                    variant={isActive ? "default" : "ghost"}
                                    className={`w-full justify-start gap-3 ${
                                        isActive ? "bg-primary text-white" : "text-gray-600 hover:text-primary"
                                    }`}
                                >
                                    <item.icon className="h-4 w-4" />
                                    {item.label}
                                </Button>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t">
                    <Button
                        variant="outline"
                        className="w-full justify-start gap-3 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={handleLogout}
                    >
                        <LogOut className="h-4 w-4" />
                        Sair do Sistema
                    </Button>
                </div>
            </aside>

            <main className="flex-1 ml-64 p-8 overflow-y-auto">
                <div className="max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}