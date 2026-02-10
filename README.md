# 🐾 Pet Shop Ecosystem - Frontend

---

![License Badge](https://img.shields.io/badge/License-MIT-green.svg)
![Tech Stack](https://img.shields.io/badge/Tech-React%20%7C%20TypeScript%20%7C%20Vite-blue.svg)
![Auth](https://img.shields.io/badge/Auth-OAuth2%20%2B%20PKCE-orange)
![Architecture](https://img.shields.io/badge/Architecture-Feature--Based-blueviolet)
![Backend](https://img.shields.io/badge/Backend-Spring%20Boot%20%7C%20OAuth2-brightgreen)

Este é o Client Application do ecossistema Pet Shop. Uma interface moderna, performática e extremamente segura, construída para consumir microsserviços utilizando os padrões mais rigorosos do mercado, como OAuth2 com PKCE.

- Segurança (OAuth2 + PKCE)
- Escalabilidade (Feature-based Architecture)
- Resiliência de rede (Token refresh sem race condition)
- Boa DX (TypeScript, Vite, UI moderna)

Ideal para sistemas corporativos, ERPs e microsserviços.

---
## 🏗️ Arquitetura de Software

Este projeto segue uma arquitetura modular baseada em **Features (Feature-Sliced Design simplificado)**. O objetivo é manter o código desacoplado, escalável e fácil de manter.
```mermaid
graph TD
App[App.tsx] --> Providers[Providers / Router]
Providers --> Layouts[Layouts: Auth / Main]
Layouts --> Features[Features: Auth, Users, Pets]

    subgraph "Feature Structure"
        Features --> Components[UI Components]
        Features --> Hooks[Business Logic]
        Features --> Services[API Calls]
    end

    subgraph "Shared Layer"
        Lib[Lib: Axios Instance]
        Store[Store: Zustand]
    end
```
## 🔐 Segurança & Resiliência de Rede
**Diferente de SPAs comuns, este projeto implementa:**

* Flow OAuth2 + PKCE (Proof Key for Code Exchange): Garante que o authorization_code só possa ser trocado por tokens pelo cliente que o solicitou.

* Singleton Promise Token Refresh: Se 10 requisições falharem simultaneamente com 401 (Token Expirado), apenas uma chamada de refresh é feita. As outras 9 ficam na FailedQueue e são re-executadas automaticamente assim que o novo token chega.

* Recuperação de Senha Segura: Tokens de redefinição com tempo de expiração curto e invalidação automática após uso, prevenindo ataques de replay.

* Silent Refresh: Hook dedicado para manutenção de sessão em background.
---

## 🛠️ Tech Stack
* Core: React 18 + Vite (SWC) + TypeScript.

* UI/UX: Tailwind CSS + Shadcn/ui (Radix UI) + Lucide Icons + Sonner (Toasts).

* State Management:
  * Zustand: Estado global leve e persistente.

  * React Query: Planejado para gerenciamento de cache de servidor.

* Forms: React Hook Form + Zod (Validação Schema-based).

* Networking: Axios com interceptors customizados.

* Autenticação: OAuth2 com PKCE (Authorization Code Flow).
---

## 📂 Estrutura do Projeto
O projeto segue uma arquitetura baseada em Features (módulos de negócio), facilitando a manutenção e o desacoplamento de código.
```text
src/
├── components/          # UI Kit (Botões, Inputs, Tabelas genéricas - Shadcn/UI)
├── features/            # 📦 Módulos de Negócio (Onde a lógica vive)
│   ├── auth/            # Ex: Feature de Autenticação
│   │   ├── api/         # Serviços HTTP específicos desta feature
│   │   ├── components/  # Componentes visuais exclusivos desta feature
│   │   ├── hooks/       # Lógica de estado (Stores do Zustand) e Hooks customizados
│   │   ├── pages/       # Páginas/Views completas da feature
│   │   └── index.ts     # 🚪 API PÚBLICA (Exporta o que outras features podem usar)
│   ├── dashboard/       # Feature de Dashboard
│   ├── inventory/       # Feature de Estoque
│   ├── sales/           # Feature de Vendas (PDV)
│   ├── settings/         # Feature de Configurações
│   └── ...
├── layouts/             # Wrappers de layout (Sidebar, Navbar, AuthLayout)
├── lib/                 # Configurações globais (Axios, Formatadores, Utils de bibliotecas)
├── pages/               # Páginas Genéricas (404, Manutenção) ou Agregadoras
└── types/               # Definições de Tipos compartilhados globalmente (ex: Paginação)
```

### 📏 Régua de Arquitetura (Regras do Projeto)

Para manter a escalabilidade e a saúde do código, seguimos rigorosamente 4 regras de ouro:

#### 1. Princípio da Feature Autocontida
Cada pasta dentro de `features/` funciona como um "mini-projeto" isolado.
- **✅ Certo:** O hook `useCartStore` fica em `features/sales/hooks/` porque pertence a vendas.
- **❌ Errado:** Colocar lógica de negócio específica em pastas globais como `src/hooks`.

#### 2. A Regra da API Pública (Barrel Files)
Uma feature **nunca** deve importar arquivos internos de outra feature diretamente. A comunicação deve ocorrer apenas através do arquivo `index.ts` (O Porteiro).
- **✅ Certo:** `import { inventoryService } from "@/features/inventory";`
- **❌ Errado:** `import { inventoryService } from "@/features/inventory/api/inventoryService";`

#### 3. Componentes Globais vs. Locais
- **Globais (`src/components`):** Componentes de UI genéricos reutilizáveis em todo o app (Botões, Inputs, Modais Shadcn).
- **Locais (`features/x/components`):** Componentes que possuem lógica de negócio ou são usados apenas naquela feature (ex: `ProductListTable`, `CartSummary`).

#### 4. O Papel das Pastas "Pages"
- **Feature Pages (`features/x/pages`):** Telas principais do sistema (Login, PDV, Dashboard). Conectam a Store aos Componentes.
- **Global Pages (`src/pages`):** Apenas para páginas sem domínio específico (404, Manutenção) ou páginas "Agregadoras" que orquestram múltiplas features.

---

### 🧭 Guia de Decisão: Onde crio meu arquivo?

| Tipo de Arquivo       | Pergunta a fazer                              | Destino                                                           |
|:----------------------|:----------------------------------------------|:------------------------------------------------------------------|
| **Componente Visual** | É genérico (UI Kit) ou específico de negócio? | Genérico: `src/components`<br>Específico: `features/x/components` |
| **Lógica / Hook**     | Lida com dados de uma feature específica?     | Sim: `features/x/hooks`<br>Não (Global): `src/lib` ou `src/hooks` |
| **Serviço API**       | A qual módulo de negócio pertence?            | `features/x/api`                                                  |
| **Página (Rota)**     | Pertence a uma feature clara?                 | Sim: `features/x/pages`<br>Não: `src/pages`                       |
| **Tipo / Interface**  | É usado apenas dentro da feature?             | Sim: `features/x/types.ts`<br>Não (Compartilhado): `src/types`    |

---
## 🚀 Como Iniciar
**Pré-requisitos**
* `Node.js 18+` e `NPM/PNPM/Yarn.`

**Instalação**
1. Clone o projeto: 
```bash
git clone https://github.com/iXDGabrielTK/petshop-frontend.git
cd petshop-frontend
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
   * Crie um arquivo `.env` na raiz do projeto baseado no `.env` abaixo e preencha com suas credenciais OAuth2 e URLs de API.
```bash
VITE_API_URL=http://localhost:8080
VITE_AUTH_CLIENT_ID=petshop-client
VITE_AUTH_URL=http://localhost:8081/oauth2/authorize
VITE_TOKEN_URL=http://localhost:8081/oauth2/token
VITE_REDIRECT_URI=http://127.0.0.1:3000/authorized
```

4. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```
---
 
### Fluxo de Autenticação (Resumo)
```
1. Usuário acessa rota protegida
2. Redirecionamento para o provedor OAuth2 (PKCE)
3. Retorno com authorization code
4. Troca de código por tokens (access + refresh) via backend OAuth
5. Tokens armazenados com persistência segura
6. Axios interceptors mantêm a sessão automaticamente
```
---

## **🔮 Roadmap & Futuro**
**O objetivo deste projeto é servir como um cliente robusto para microsserviços/ERPs. As próximas etapas incluem:**

### Status Atual do Projeto

* [x] Autenticação OAuth2 completa  

* [x] Fluxo de Recuperação de Senha (Esqueci a Senha / Redefinir Senha)

* [x] Camada de rede resiliente  

* [x] Arquitetura baseada em Features

* [x] Design system configurado

### 🚧 Em desenvolvimento:

* [ ] Implementação de Dashboards analíticos com Recharts.

* [ ] Integração completa de CRUDs para os módulos de negócio.

* [ ] Testes Unitários e E2E (Vitest/Playwright).

* [ ] CI/CD Pipelines.

---
## 📄 Licença

Este projeto está sob a licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

---

## 📬 Contato
Gostou do projeto ou quer trocar uma ideia técnica? Vamos conversar.

* **LinkedIn:** https://www.linkedin.com/in/gabriel-tanaka-b1669b175/

* **Email:** gabrielferraritanaka@gmail.com