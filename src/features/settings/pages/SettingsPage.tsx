import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"

import { Switch } from "@/components/ui/switch"
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

export function SettingsPage() {
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
                                <AvatarImage src="https://i.pravatar.cc/100" />
                                <AvatarFallback>AD</AvatarFallback>
                            </Avatar>

                            <div>
                                <p className="font-medium">Administrador</p>
                                <p className="text-sm text-muted-foreground">
                                    admin@malvadaopet.com
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

                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium">Modo Escuro</p>
                            <p className="text-sm text-muted-foreground">
                                Alternar entre tema claro e escuro
                            </p>
                        </div>
                        <Switch />
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
