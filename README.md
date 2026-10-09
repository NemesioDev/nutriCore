# 🍏 NutriCore — Plataforma de Nutrição & Gestão Clínica

> **NutriCore** é um software web moderno para nutricionistas e profissionais de saúde, focado em precisão científica, prescrição rápida de dietas com tabela TACO/IBGE, avaliação antropométrica avançada e aplicativo interativo para pacientes.

---

## ✨ Principais Funcionalidades

### 🥗 1. Criador de Dietas & Planos Alimentares
- **Base Nutricional TACO / IBGE**: Cálculo instantâneo de calorias (kcal), carboidratos, proteínas, gorduras e fibras por porção e a cada 100g.
- **Painel de Macros em Tempo Real**: Distribuição visual do Valor Energético Total (VET) comparado com a meta planejada.
- **Assistente NutriCore (Substituição Inteligente)**: Sugere alimentos alternativos com cálculo automático de gramatura equivalente em calorias e macronutrientes.
- **Integração com WhatsApp**: Envio direto do plano estruturado e humanizado para o WhatsApp do paciente com apenas um clique.
- **Impressão & PDF Profissional**: Exportação de receituário dietético limpo e formatado.

### 📊 2. Avaliação Antropométrica & Cálculos Clínicos
- **IMC (OMS)**: Cálculo e classificação automática do estado nutricional.
- **Taxa Metabólica Basal (TMB)**: Equação de *Mifflin-St Jeor*.
- **Gasto Energético Total (GET)**: Ajuste com base no fator de atividade física do paciente.
- **Composição Corporal**: Estimativa de % de gordura, massa magra (kg), Relação Cintura-Quadril (RCQ) e tabela de histórico evolutivo.

### 📱 3. Simulador do Aplicativo do Paciente (NutriCore Mobile)
- Moldura de smartphone interativa exibindo exatamente como o paciente visualiza as refeições do dia.
- **Rastreador de Hidratação**: Registro de copos d'água (+250ml) com barra de progresso em tempo real da meta diária.
- **Canal Direto**: Prévia de envio de mensagens e orientações com a nutricionista.

### 👥 4. Gestão de Pacientes & Prontuários
- Cadastro completo de anamnese rápida, dados biométricos e histórico.
- Busca instantânea e filtros por nome ou e-mail.

### 📅 5. Agenda de Consultas & Telemedicina
- Gestão de atendimentos presenciais e teleconsultas com link de videoconferência.

### 🛒 6. Lista de Compras Inteligente & Receitas Fit
- Geração automática da lista de compras semanal calculada a partir dos itens do plano alimentar ativo.
- Biblioteca de receitas saudáveis com passo a passo e divisão de macros.

---

## 🛠️ Tecnologias Utilizadas

- **Frontend Core**: HTML5 Semântico, Vanilla JavaScript (ES6+ modular).
- **Estilização**: Vanilla CSS com Design System baseado em CSS Variables (tokens de cor, elevação e tipografia).
- **Ícones & Tipografia**: Font Awesome 6 e Google Fonts (Inter).
- **Sem Dependências Pesadas**: Carregamento instantâneo, compatível com qualquer navegador moderno sem necessidade de build step.

---

## 🚀 Como Executar Localmente

### Opção 1: Abrir diretamente no navegador
Basta dar um duplo clique no arquivo `index.html`.

### Opção 2: Servidor local simples (Python)
```bash
# Na pasta do projeto:
python -m http.server 8080
```
Acesse em seu navegador: [http://localhost:8080/index.html](http://localhost:8080/index.html)

---

## 📂 Estrutura do Projeto

```text
nutricore/
├── index.html             # Interface principal e roteamento de abas
├── README.md              # Documentação oficial do projeto
├── .gitignore             # Arquivos ignorados pelo controle de versão
├── css/
│   ├── variables.css      # Design tokens e paleta NutriCore
│   ├── auth.css           # Tela de autenticação e login
│   ├── app.css            # Estilos da plataforma, cards, modais e simulador
│   └── print.css          # Estilização para impressão e PDF
└── js/
    ├── food-database.js   # Tabela TACO / IBGE com alimentos e macros
    ├── mock-data.js       # Dados iniciais de pacientes, dietas e consultas
    ├── diet-builder.js    # Lógica do prescritor de dietas e assistente
    ├── anthropometry.js   # Fórmulas de IMC, TMB, GET e antropometria
    └── app.js             # Orquestração do sistema e simulador
```

---

## 📄 Licença
Distribuído sob a licença MIT.
