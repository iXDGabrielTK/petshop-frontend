import { useAuthStore } from "@/features/auth/store";

export function Dashboard() {
    const { user, logout } = useAuthStore();

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold">Painel do Sistema Malvadão</h1>

            <div className="mt-4 p-4 border rounded bg-slate-100">
                <p><strong>Usuário:</strong> {user?.name}</p>
                <p><strong>Email:</strong> {user?.email}</p>
                <p><strong>Permissões:</strong> {user?.roles.join(", ")}</p>
            </div>

            <button
                onClick={() => logout()}
                className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
                Sair do Sistema
            </button>
        </div>
    );
}