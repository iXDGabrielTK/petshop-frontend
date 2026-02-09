import { useForgotPassword } from "@/features/auth/hooks/useForgotPassword";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Mail, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";

export function ForgotPasswordForm() {
    const { form, onSubmit, isSubmitting, isSuccess } = useForgotPassword();

    if (isSuccess) {
        return (
            <div className="text-center space-y-4 py-4">
                <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto" />
                <h2 className="text-xl font-semibold">Verifique seu e-mail</h2>
                <p className="text-gray-500 text-sm">
                    Enviamos um link de recuperação para <strong>{form.getValues("email")}</strong>.
                </p>
                <Link to="/login">
                    <Button variant="outline" className="mt-4 w-full">Voltar ao Login</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="grid gap-6">
            <Form {...form}>
                <form onSubmit={onSubmit} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>E-mail</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                        <Input placeholder="seu@email.com" className="pl-10" {...field} />
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? "Enviando..." : "Enviar Link"}
                    </Button>
                </form>
            </Form>
        </div>
    );
}