# HMI-DARK_COMjs

**TwinCAT HMI Industrial Control System**

---

## 📋 Sobre o Projeto / About the Project

Este é um projeto de **TwinCAT HMI (Human-Machine Interface)** para automação industrial, projetado especificamente para controlar e monitorar **Unidades de Controle de Sensor (SCU)** em ambientes de manufatura ou controle de processo.

This is a **TwinCAT HMI (Human-Machine Interface)** application for industrial automation, specifically designed to control and monitor **Sensor Control Units (SCU)** in manufacturing or process control environments.

### Empresa / Company
**SIMEROS**

### Características Principais / Key Features

- 🎛️ **Controle PID**: Algoritmos avançados de controle de processo
- 📊 **Monitoramento de Sensores**: Visualização de dados em tempo real
- 🔧 **Controle de Manifold**: Operações completas de painel de manifold
- ⚠️ **Gerenciamento de Alarmes**: Registro de eventos e tratamento de alarmes
- 👥 **Gerenciamento de Usuários**: Controle de acesso baseado em funções
- 💾 **Registro de Dados**: Armazenamento histórico baseado em SQLite
- 🌐 **Suporte Multi-idioma**: Localização em inglês e alemão
- 🌙 **Tema Escuro**: Otimizado para ambientes industriais
- 📱 **Suporte PWA**: Operação offline e implantação móvel

---

## 🛠️ Tecnologia / Technology

- **Plataforma**: Beckhoff TwinCAT HMI Framework 1.12.762.x
- **IDE**: TwinCAT XAE Shell (baseado em Visual Studio)
- **Sistema de Build**: MSBuild
- **Comunicação**: Protocolo ADS (Automation Device Specification) para PLC
- **Linguagens**: JavaScript (ES2020), HTML5, CSS3
- **TypeScript**: 4.9.5 (suporte para verificação de tipos)

---

## 📁 Estrutura do Projeto / Project Structure

```
HMI_Dark/
├── Functions/              # Funções JavaScript customizadas (16 arquivos)
├── Pages/                  # Páginas de conteúdo (7 páginas)
├── User_Contols/           # Componentes de UI reutilizáveis
├── Server/                 # Configurações do lado do servidor
├── Themes/                 # Temas visuais (Base-Dark ativo)
├── Images/                 # Recursos de imagem
├── Localization/           # Suporte multi-idioma (EN, DE)
└── Properties/             # Configuração do projeto
```

---

## 🚀 Como Começar / Getting Started

### Pré-requisitos / Prerequisites

- TwinCAT XAE Shell (Visual Studio Shell com integração TwinCAT)
- TwinCAT HMI Engineering (versão 1.12.762.x)
- .NET Framework (para MSBuild)
- Git para controle de versão

### Abrindo o Projeto / Opening the Project

```bash
# Opção 1: Abrir solução no Visual Studio
# Clique duas vezes em HMI_Dark.sln ou use TwinCAT XAE Shell

# Opção 2: Build pela linha de comando
msbuild HMI_Dark.sln /p:Configuration=Release
```

---

## 📚 Documentação / Documentation

- **[CLAUDE.md](./CLAUDE.md)**: Guia completo do projeto para assistentes de IA / Comprehensive project guide for AI assistants
- **[COMO_TORNAR_PRIVADO.md](./COMO_TORNAR_PRIVADO.md)**: Instruções sobre como tornar este repositório privado / Instructions on how to make this repository private

---

## 🔒 Privacidade do Repositório / Repository Privacy

**Quer tornar este repositório privado?** / **Want to make this repository private?**

📖 Consulte o arquivo **[COMO_TORNAR_PRIVADO.md](./COMO_TORNAR_PRIVADO.md)** para instruções detalhadas sobre como alterar a visibilidade do repositório.

📖 See the **[COMO_TORNAR_PRIVADO.md](./COMO_TORNAR_PRIVADO.md)** file for detailed instructions on how to change repository visibility.

> ⚠️ **Importante**: A visibilidade do repositório é uma configuração do GitHub que deve ser alterada através da interface web, GitHub CLI ou API - não através de código.

> ⚠️ **Important**: Repository visibility is a GitHub setting that must be changed through the web interface, GitHub CLI, or API - not through code.

---

## 🤝 Contribuindo / Contributing

Para contribuir com este projeto:

1. Faça um fork do repositório
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

---

## 📞 Contato / Contact

**Projeto**: HMI-DARK_COMjs  
**Empresa**: SIMEROS  
**Framework**: Beckhoff TwinCAT HMI 1.12.762.x

---

## 📝 Licença / License

Este é um projeto proprietário da SIMEROS para sistemas de automação industrial.

This is a proprietary project by SIMEROS for industrial automation systems.

---

**Última atualização / Last updated**: 2026-01-08
