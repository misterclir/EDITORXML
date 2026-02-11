# Editor de Event Bags - MUDevs

**Um editor web para arquivos de configuração de Event Bags do MUDevs Emulator (Season 20.2-3)**

## Sobre o Projeto

Este é um editor online/offline desenvolvido para facilitar a criação, edição e visualização de arquivos de configuração de **Event Bags** (arquivos `.xml`, frequentemente encapsulados em `<ItemBag>`) utilizados no emulador MUDevs.

O projeto nasceu da necessidade de editar rapidamente arquivos como:

- Box of Luck.xml
- Heart of Love FireCracker.xml
- Timed Mastery Set Box.xml
- High Devil’s Box.xml
- entre outros...

de forma visual, segura e produtiva, sem precisar abrir em editores de texto bruto (como Notepad++) e correr risco de quebrar a sintaxe XML.

### Principais Funcionalidades

- **Carregamento automático do Item.xml**  
  O arquivo `Item.xml` (lista de todos os itens do jogo) é carregado diretamente da mesma pasta via `fetch`, sem necessidade de upload manual. Isso alimenta a seleção de itens com nomes e seções reais.

- **Suporte a dois formatos de Event Bag** (detecção automática):
  1. **Formato antigo** (mais comum):
     - `<BagConfig>` (o arquivo pode ter wrappers como `<ItemBag>` / `<BagItems>`, o editor lê os `<Item ...>`)
     - Exemplo: Box of Luck, Heart of Love, etc.
  2. **Formato novo/ex** (mais avançado):
     - `<BagConfigEx>` + `<DropInfo>` + `<RuudInfo>` + `<ItemEx>`
     - Suporta múltiplos `<DropInfo>`
     - Usa `Index` (decimal ou `0x..`) e converte automaticamente para Section + Type

- **Interface visual inteligente para itens**
  - Lista de itens organizada por seção (puxado do Item.xml)
  - Seleção do item via modal (por categoria + busca)
  - Section e Type não são editados diretamente (são definidos ao selecionar o item)
  - Nome do item aparece como texto para visualização clara
  - Campos editáveis variam conforme o tipo (Common ou EX)

- **Adição de itens facilitada**
  - **Item Comum**: adiciona uma linha vazia para escolher qualquer item
  - **Set Completo**: escolhe um Helmet (Section 7) e adiciona 5 peças (Sections 7,8,9,10,11), usando `Type` do Helmet e +1/+2/+3/+4 para as demais peças

- **Download**
  - O arquivo baixado usa o mesmo nome do arquivo carregado
  - O XML gerado é salvo com raiz `<BagConfig>` (Common) ou `<BagConfigEx>` (EX)
  - No formato Common, o download não inclui wrappers como `<ItemBag>` / `<BagItems>`
  - No formato EX, o download não inclui o atributo `Durability` em `<ItemEx>`

- **Design moderno e escuro**
  - Tema tecnológico escuro com Tailwind CSS
  - Gradientes azul-roxo, hover effects, loading spinner neon
  - Tabela responsiva com rolagem horizontal quando necessário

## Tecnologias Utilizadas

- **Frontend**: HTML5 + Tailwind CSS (CDN) + JavaScript puro
- **Carregamento de arquivos**: File API + DOMParser
- **Estilização**: Tailwind CSS + CSS custom (`style.css`) + Google Fonts (Inter) + Font Awesome
- **Execução**: 100% client-side (roda direto no navegador ou via AppServ local)

Não utiliza PHP, Node.js ou backend pesado — tudo roda no navegador para máxima leveza e portabilidade.

## Como Usar

1. Coloque os arquivos na mesma pasta:
   - `index.html`
   - `script.js`
   - `style.css`
   - `Item.xml` (obrigatório para dropdown)

2. Abra o `index.html` no navegador:
   - Recomendado via servidor local (AppServ, XAMPP, etc.)
   - No modo file://, o `fetch('Item.xml')` pode ser bloqueado pelo navegador

3. Carregue seu arquivo .xml de Event Bag
4. Edite as configurações e itens
5. Clique em **Baixar XML**

## Estrutura de Arquivos

editor-event-bags/
├── index.html          ← Arquivo principal (interface + lógica)
├── script.js           ← Lógica do editor
├── style.css           ← Estilos custom
├── Item.xml            ← Lista de itens do jogo (obrigatório)
└── README.md           ← Esta documentação
