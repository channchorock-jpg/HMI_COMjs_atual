# Como Tornar Este Repositório Privado / How to Make This Repository Private

**Repositório**: channchorock-jpg/HMI_COMjs_atual  
**Data**: 2026-01-08

---

## 🇧🇷 Português

### Importante ⚠️
A visibilidade de um repositório no GitHub (público ou privado) **não pode ser alterada através de código**. É uma configuração do repositório que deve ser modificada através das configurações do GitHub.

### Métodos para Tornar o Repositório Privado

#### Método 1: Interface Web do GitHub (Recomendado)

1. **Acesse o repositório no GitHub**
   - Navegue até: https://github.com/channchorock-jpg/HMI_COMjs_atual

2. **Vá para as Configurações**
   - Clique na aba **"Settings"** (Configurações) no menu superior do repositório
   - Você precisa ter permissões de administrador no repositório

3. **Role até a Zona de Perigo**
   - Role a página até a seção **"Danger Zone"** (Zona de Perigo) no final da página

4. **Altere a Visibilidade**
   - Clique em **"Change visibility"** (Alterar visibilidade)
   - Selecione **"Make private"** (Tornar privado)

5. **Confirme a Ação**
   - Digite o nome do repositório quando solicitado: `channchorock-jpg/HMI_COMjs_atual`
   - Clique em **"I understand, make this repository private"**

#### Método 2: GitHub CLI (gh)

Se você tem o GitHub CLI instalado:

```bash
# Tornar o repositório privado
gh repo edit channchorock-jpg/HMI_COMjs_atual --visibility private
```

#### Método 3: API do GitHub

Usando a API REST do GitHub:

```bash
curl -X PATCH \
  -H "Accept: application/vnd.github.v3+json" \
  -H "Authorization: token SEU_TOKEN_AQUI" \
  https://api.github.com/repos/channchorock-jpg/HMI_COMjs_atual \
  -d '{"private":true}'
```

### O Que Acontece Quando o Repositório se Torna Privado?

✅ **Vantagens:**
- O código não será mais visível publicamente
- Apenas colaboradores autorizados poderão acessar
- Maior controle sobre quem pode ver o código
- Proteção de propriedade intelectual

⚠️ **Considerações:**
- Usuários que não são colaboradores perderão o acesso
- Links públicos para o repositório não funcionarão mais para usuários não autorizados
- Issues e Pull Requests públicos se tornarão privados
- GitHub Pages (se configurado) será desativado
- Algumas funcionalidades gratuitas podem ter limitações dependendo do plano

### Requisitos

- **Permissões**: Você deve ser o proprietário do repositório ou ter permissões de administrador
- **Plano do GitHub**: Verifique se seu plano do GitHub suporta repositórios privados (a maioria dos planos modernos suporta)

### Reverter para Público

Se precisar tornar o repositório público novamente:
1. Siga os mesmos passos acima
2. Em vez de "Make private", selecione "Make public"

---

## 🇬🇧 English

### Important ⚠️
Repository visibility on GitHub (public or private) **cannot be changed through code**. It is a repository setting that must be modified through GitHub settings.

### Methods to Make the Repository Private

#### Method 1: GitHub Web Interface (Recommended)

1. **Access the repository on GitHub**
   - Navigate to: https://github.com/channchorock-jpg/HMI_COMjs_atual

2. **Go to Settings**
   - Click on the **"Settings"** tab in the repository top menu
   - You need to have administrator permissions on the repository

3. **Scroll to Danger Zone**
   - Scroll down to the **"Danger Zone"** section at the bottom of the page

4. **Change Visibility**
   - Click on **"Change visibility"**
   - Select **"Make private"**

5. **Confirm the Action**
   - Type the repository name when prompted: `channchorock-jpg/HMI_COMjs_atual`
   - Click **"I understand, make this repository private"**

#### Method 2: GitHub CLI (gh)

If you have GitHub CLI installed:

```bash
# Make the repository private
gh repo edit channchorock-jpg/HMI_COMjs_atual --visibility private
```

#### Method 3: GitHub API

Using GitHub REST API:

```bash
curl -X PATCH \
  -H "Accept: application/vnd.github.v3+json" \
  -H "Authorization: token YOUR_TOKEN_HERE" \
  https://api.github.com/repos/channchorock-jpg/HMI_COMjs_atual \
  -d '{"private":true}'
```

### What Happens When the Repository Becomes Private?

✅ **Advantages:**
- Code will no longer be publicly visible
- Only authorized collaborators can access it
- Greater control over who can see the code
- Intellectual property protection

⚠️ **Considerations:**
- Users who are not collaborators will lose access
- Public links to the repository will no longer work for unauthorized users
- Public issues and Pull Requests will become private
- GitHub Pages (if configured) will be disabled
- Some free features may have limitations depending on the plan

### Requirements

- **Permissions**: You must be the repository owner or have administrator permissions
- **GitHub Plan**: Check if your GitHub plan supports private repositories (most modern plans do)

### Revert to Public

If you need to make the repository public again:
1. Follow the same steps above
2. Instead of "Make private", select "Make public"

---

## 📋 Checklist Rápido / Quick Checklist

### Antes de Tornar Privado / Before Making Private:

- [ ] Verificar se você tem permissões de administrador / Check if you have admin permissions
- [ ] Avisar colaboradores sobre a mudança / Notify collaborators about the change
- [ ] Fazer backup do repositório se necessário / Backup the repository if needed
- [ ] Verificar se há dependências de GitHub Pages / Check for GitHub Pages dependencies
- [ ] Confirmar que seu plano GitHub suporta repositórios privados / Confirm your GitHub plan supports private repos

### Após Tornar Privado / After Making Private:

- [ ] Verificar se o repositório está realmente privado / Verify the repository is actually private
- [ ] Adicionar colaboradores necessários / Add necessary collaborators
- [ ] Configurar permissões de acesso / Configure access permissions
- [ ] Atualizar links de documentação / Update documentation links
- [ ] Informar a equipe sobre a mudança / Inform the team about the change

---

## 🔗 Links Úteis / Useful Links

- [GitHub Docs - Setting repository visibility](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/managing-repository-settings/setting-repository-visibility)
- [GitHub CLI Documentation](https://cli.github.com/manual/gh_repo_edit)
- [GitHub API - Update a repository](https://docs.github.com/en/rest/repos/repos#update-a-repository)
- [GitHub Plans and Features](https://github.com/pricing)

---

## 💡 Notas Adicionais / Additional Notes

### Por que não é possível fazer isso via código?
A visibilidade do repositório é uma configuração de segurança e governança do GitHub que afeta:
- Permissões de acesso
- Indexação por motores de busca
- Disponibilidade pública
- Licenciamento e compliance

Por isso, o GitHub exige que essa mudança seja feita explicitamente através da interface ou API com autenticação adequada.

### Why can't this be done via code?
Repository visibility is a GitHub security and governance setting that affects:
- Access permissions
- Search engine indexing
- Public availability
- Licensing and compliance

Therefore, GitHub requires this change to be made explicitly through the interface or API with proper authentication.

---

**Última atualização / Last updated**: 2026-01-08  
**Repositório / Repository**: channchorock-jpg/HMI_COMjs_atual
