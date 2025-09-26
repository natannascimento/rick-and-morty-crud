# Rick & Morty CRUD Application

Aplicação Angular para gerenciamento de personagens de Rick & Morty, permitindo visualizar, criar, editar e deletar personagens. O projeto utiliza a API pública do Rick & Morty e localStorage para persistência local.

## 🚀 Tecnologias Utilizadas

- **Angular 19** - Framework principal
- **Angular Material** - Componentes de UI
- **TypeScript** - Linguagem de desenvolvimento
- **Jest** - Framework de testes
- **SCSS** - Pré-processador CSS
- **Rick & Morty API** - Fonte de dados dos personagens

## 📋 Pré-requisitos

Antes de executar o projeto, certifique-se de ter instalado em sua máquina:

- **Node.js** (versão 18 ou superior)
- **npm** (normalmente vem com o Node.js)
- **Angular CLI** (versão 19)

```bash
npm install -g @angular/cli@19
```

## 🔧 Instalação

1. **Clone o repositório:**
```bash
git clone https://github.com/natannascimento/rick-and-morty-crud.git
cd rick-and-morty-crud
```

2. **Instale as dependências:**
```bash
npm install --legacy-peer-deps
```

## ▶️ Execução

### Servidor de Desenvolvimento

Para iniciar o servidor de desenvolvimento:

```bash
ng serve
```

ou

```bash
npm start
```

Abra seu navegador e acesse `http://localhost:4200/`. A aplicação será recarregada automaticamente quando você modificar os arquivos fonte.

## 🧪 Testes

### Testes Unitários

Execute os testes unitários com Jest:

```bash
npm test
```

### Testes com Coverage

Para executar os testes com relatório de cobertura:

```bash
npm run test:coverage
```

O relatório será gerado na pasta `coverage/`.

## 📱 Funcionalidades

- ✅ **Listagem de Personagens** - Visualizar todos os personagens com paginação
- ✅ **Busca por Nome** - Filtrar personagens pelo nome
- ✅ **Detalhes do Personagem** - Ver informações completas
- ✅ **Criar Personagem** - Adicionar novos personagens localmente
- ✅ **Editar Personagem** - Modificar personagens existentes
- ✅ **Deletar Personagem** - Remover personagens (apenas locais)
- ✅ **Tema Rick & Morty** - Interface com cores temáticas
- ✅ **Design Responsivo** - Funciona em desktop e mobile

## 🎨 Estrutura do Projeto

```
src/
├── app/
│   ├── core/
│   │   ├── models/          # Modelos de dados
│   │   └── services/        # Serviços (API, localStorage)
│   ├── features/
│   │   └── character/       # Módulo de personagens
│   │       ├── character-list/     # Listagem
│   │       ├── character-detail/   # Detalhes
│   │       └── character-form/     # Formulário
│   └── shared/
│       └── pipes/           # Pipes customizados
```

## 🌐 API Externa

O projeto consome a [Rick & Morty API](https://rickandmortyapi.com/) para obter dados dos personagens originais da série.

## 💾 Persistência Local

Personagens criados localmente são armazenados no localStorage do navegador, permitindo que sejam editados e deletados.

## 📄 Licença

Este projeto foi desenvolvido para fins educacionais e de demonstração.

## 👨‍💻 Desenvolvedor

Desenvolvido com ❤️ por [Natan Nascimento](https://github.com/natannascimento)
