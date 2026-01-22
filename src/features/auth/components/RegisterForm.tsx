import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { api } from "@/lib/axios";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const registerSchema = z.object({
    nome: z.string().min(3, "O nome deve ter no mínimo 3 caracteres."),
    email: z.string().email("Insira um e-mail válido."),
    senha: z.string()
        .min(8, "A senha deve ter pelo menos 8 caracteres.")
        .regex(/[A-Z]/, "Deve conter pelo menos uma letra maiúscula.")
        .regex(/[0-9]/, "Deve conter pelo menos um número.")
        .regex(/[^A-Za-z0-9]/, "Deve conter um caractere especial (!@#$)."),
    confirmPassword: z.string()
}).refine((data) => data.senha === data.confirmPassword, {
    message: "As senhas não conferem.",
    path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterForm() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: { nome: "", email: "", senha: "", confirmPassword: "" },
    });

    async function onSubmit(data: RegisterFormValues) {
        setIsLoading(true);
        try {
            await api.post("/usuarios/register", {
                nome: data.nome,
                email: data.email,
                senha: data.senha
            });

            toast.success("Conta criada com sucesso!", {
                description: "Você será redirecionado para o login.",
                duration: 4000,
            });

            setTimeout(() => {
                navigate("/login");
            }, 1500);

        } catch (error: any) {
            console.error(error);
            toast.error("Erro ao criar conta", {
                description: error.response?.data?.message || "Verifique os dados e tente novamente."
            });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="grid gap-6">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                    {/* Nome */}
                    <FormField
                        control={form.control}
                        name="nome"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nome Completo</FormLabel>
                                <FormControl><Input placeholder="Ex: João da Silva" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Email */}
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>E-mail</FormLabel>
                                <FormControl><Input placeholder="nome@exemplo.com" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <FormField
                            control={form.control}
                            name="senha"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Senha</FormLabel>
                                    <FormControl><Input  placeholder="********" type="password" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="confirmPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Confirmar</FormLabel>
                                    <FormControl><Input placeholder="********" type="password" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Criar Conta
                    </Button>
                </form>
            </Form>
        </div>
    );
}