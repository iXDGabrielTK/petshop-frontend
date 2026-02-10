import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Monitor, Moon, Sun } from "lucide-react"

import { useAuthStore } from "@/features/auth/store"
import { useSettingsStore } from "@/features/settings/hooks/useSettingsStore"
import { useSyncSettings } from "@/features/settings/hooks/useSyncSettings"

export function SettingsPage() {
    const { theme, setTheme } = useSettingsStore();
    const { user } = useAuthStore();
    useSyncSettings();

    const getInitials = (name?: string) => {
        if (!name) return "U";
        return name
            .split(" ")
            .map((n) => n[0])
            .slice(0, 2)
            .join("")
            .toUpperCase();
    };

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-2xl font-semibold">Configurações</h1>

            <Tabs defaultValue="users" className="w-full">
                <TabsList>
                    <TabsTrigger value="users">Usuários</TabsTrigger>
                    <TabsTrigger value="theme">Aparência</TabsTrigger>
                    <TabsTrigger value="printer">Impressora</TabsTrigger>
                </TabsList>

                <TabsContent value="users" className="space-y-4">
                    <h2 className="text-lg font-medium">Gerenciar Usuários</h2>
                    <Separator />

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                            <Avatar>
                                <AvatarImage
                                    src={`https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=random`}
                                />
                                <AvatarFallback>{getInitials(user?.name)}</AvatarFallback>
                            </Avatar>

                            <div>
                                <p className="font-medium">{user?.name || "Usuário"}</p>
                                <p className="text-sm text-muted-foreground">
                                    {user?.email || "email@naoencontrado.com"}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1 uppercase">
                                    {user?.roles?.[0] || "USER"}
                                </p>
                            </div>
                        </div>

                        <Button variant="outline">Editar</Button>
                    </div>

                    <Button>Novo Usuário</Button>
                </TabsContent>

                <TabsContent value="theme" className="space-y-4">
                    <h2 className="text-lg font-medium">Aparência</h2>
                    <Separator />

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-0.5">
                            <p className="font-medium">Tema da Interface</p>
                            <p className="text-sm text-muted-foreground">
                                Escolha como você quer ver o sistema.
                            </p>
                        </div>

                        <div className="w-45">
                            <Select
                                value={theme}
                                onValueChange={(value) => setTheme(value as import('@/features/auth/types').Theme)}                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione o tema" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="light">
                                        <div className="flex items-center gap-2">
                                            <Sun className="h-4 w-4" /> Claro
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="dark">
                                        <div className="flex items-center gap-2">
                                            <Moon className="h-4 w-4" /> Escuro
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="system">
                                        <div className="flex items-center gap-2">
                                            <Monitor className="h-4 w-4" /> Sistema
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="printer" className="space-y-6">
                    <h2 className="text-lg font-medium">Impressão de Cupom</h2>
                    <Separator />

                    <div className="space-y-2 max-w-sm">
                        <label className="text-sm font-medium">
                            Impressora padrão
                        </label>

                        <Select>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione uma impressora" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="epson">Epson TM-T20</SelectItem>
                                <SelectItem value="bematech">Bematech MP-4200</SelectItem>
                                <SelectItem value="pdf">Salvar como PDF</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
