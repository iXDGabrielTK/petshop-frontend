export const ENV = {
    // Backend API principal
    API_URL: import.meta.env.VITE_API_URL,

    // Servidor de Autenticação (OAuth)
    AUTH_URL: import.meta.env.VITE_AUTH_URL,

    // Nome da aplicação
    APP_NAME: import.meta.env.VITE_APP_NAME,

    // Configurações do OAuth
    CLIENT_ID: import.meta.env.VITE_OAUTH_CLIENT_ID,
    REDIRECT_URI: import.meta.env.VITE_REDIRECT_URI || window.location.origin + '/authorized'
};

if (!ENV.API_URL || !ENV.CLIENT_ID) {
    throw new Error("FATAL: Variáveis de ambiente críticas ausentes.");
}