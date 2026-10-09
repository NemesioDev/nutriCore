# 🌿 NutriCore — Software de Nutrição Clínica & Alta Performance

> Plataforma completa inspirada no Dietbox, desenvolvida em **React 19 + TypeScript + Vite** e conectada em **tempo real (Realtime)** com banco de dados relacional **Supabase PostgreSQL**.

---

## 🚀 Principais Funcionalidades

1. **Gestão de Usuários & Níveis de Acesso (RBAC):**
   - Papéis disponíveis com permissões diferenciadas: `admin`, `nutricionista`, `recepcionista` e `paciente`.
   - Gerenciamento e atualização de níveis em tempo real diretamente no Supabase.

2. **Prescrição Nutricional com Tabela TACO Oficial:**
   - Banco com dezenas de alimentos categorizados (Proteínas, Carboidratos, Vegetais, Laticínios, Gorduras Boas).
   - Cálculo automático de macronutrientes (Calorias, Carboidratos, Proteínas e Gorduras) proporcional às gramas prescritas.
   - Barra de progresso de metas calóricas em tempo real.
   - **Substituição Inteligente:** Sugestões de alimentos equivalentes isocalóricos.
   - Exportação direta para **WhatsApp** e **Impressão/PDF**.

3. **Avaliação Antropométrica & Metabolismo:**
   - Fórmulas científicas automáticas:
     - **IMC** com classificação OMS (Baixo peso, Eutrofia, Sobrepeso, Obesidade).
     - **TMB (Taxa Metabólica Basal)** por *Mifflin-St Jeor*.
     - **GET (Gasto Energético Total)** ajustado pelo fator de atividade física.
     - **RCQ (Relação Cintura-Quadril)** e percentual de gordura.
   - Histórico evolutivo completo gravado no banco relacional.

4. **Agenda de Consultas & Telemedicina:**
   - Agendamento de consultas presenciais e remotas.
   - Link integrado de teleconsulta e controle de status (`Agendado`, `Confirmado`, `Realizado`, `Cancelado`).

5. **Lista de Compras Automática & Acervo de Receitas:**
   - Geração automática da lista de compras semanal agregando todos os itens prescritos no plano alimentar do paciente.
   - Cópia com 1 clique para a área de transferência.

6. **Aplicativo do Paciente (Simulador Mobile):**
   - Bezel interativo de smartphone.
   - Registro de hidratação (+250ml) salvando no Supabase em tempo real.
   - Visualização das refeições prescritas.
   - Chat bidirecional em tempo real entre nutricionista e paciente.

---

## 🛠️ Tecnologias Utilizadas

- **Frontend:** React 19, TypeScript, Vite, Lucide React
- **Estilização:** CSS Moderno com Design System (Greenbox/NutriCore Palette)
- **Backend / Database:** Supabase PostgreSQL (10 tabelas relacionais com RLS e canais de Realtime ativos)
- **Biblioteca Nutricional:** Tabela TACO (Tabela Brasileira de Composição de Alimentos)

---

## 📦 Como Executar Localmente

```bash
# 1. Clonar o repositório
git clone https://github.com/NemesioDev/nutriCore.git

# 2. Entrar na pasta do projeto
cd nutricore

# 3. Instalar dependências
npm install

# 4. Executar em modo desenvolvimento
npm run dev
```

Acesse em seu navegador: `http://localhost:5173/`
