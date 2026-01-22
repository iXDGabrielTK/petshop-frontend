import { Outlet } from "react-router-dom";
import { Command } from "lucide-react";

export function AuthLayout() {
    return (
        <div className="container relative h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">

            <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
                <div className="absolute inset-0 bg-zinc-900" />
                <div className="relative z-20 flex items-center text-lg font-medium">
                    <Command className="mr-2 h-6 w-6" />
                    Petshop Malvadao Inc
                </div>
                <div className="relative z-20 mt-auto">
                    <blockquote className="space-y-2">
                        <p className="text-lg">
                            &ldquo;Gerenciar meu Pet Shop nunca foi tão fácil. A automação e a clareza dos dados são impressionantes.&rdquo;
                        </p>
                        <footer className="text-sm">Equipe Malvadao</footer>
                    </blockquote>
                </div>
            </div>

            <div className="lg:p-8">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                    <Outlet />
                    <p className="px-8 text-center text-sm text-muted-foreground">
                        Ao clicar em continuar, você concorda com nossos{" "}
                        <a href="#" className="underline underline-offset-4 hover:text-primary">
                            Termos
                        </a>{" "}
                        e{" "}
                        <a href="#" className="underline underline-offset-4 hover:text-primary">
                            Privacidade
                        </a>
                        .
                    </p>
                </div>
            </div>
        </div>
    );
}