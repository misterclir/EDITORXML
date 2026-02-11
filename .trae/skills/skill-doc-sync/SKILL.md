---
name: "skill-doc-sync"
description: "Mantém a documentação 1:1 com o código. Invocar quando houver mudança de comportamento/arquivos ou ao revisar README/Docs."
---

# Skill Doc Sync

## Objetivo
Manter a documentação do projeto sempre fiel ao estado real do código (1:1), evitando promessas no README que não existem na implementação.

## Quando invocar (obrigatório)
- Ao alterar comportamento do sistema (features, fluxos, nomes de arquivos, formatos suportados).
- Ao mexer em UI que afete “Como usar”, prints, nomenclaturas e passos.
- Ao adicionar/remover arquivos relevantes do projeto.
- Ao revisar incoerências entre README e código.

## Regras
- Documentação descreve o que o código faz hoje, não o que “deveria fazer”.
- Se existirem divergências, escolher um caminho:
  - Atualizar a doc para refletir o código atual; ou
  - Atualizar o código para cumprir a doc (somente se isso for o objetivo).
- Não criar documentação extra sem necessidade: preferir ajustar o README existente.
- Evitar texto longo: documentação clara, objetiva e verificável.

## Fluxo recomendado
1. Ler a documentação alvo
   - Identificar claims: features, formatos, passos de uso, estrutura de arquivos.

2. Conferir no código
   - Localizar as funções/trechos que implementam cada claim.
   - Confirmar nomes reais (tags XML, parâmetros, nomes de arquivos, comportamento de download, etc.).

3. Marcar divergências
   - Para cada item: "doc diz X" vs "código faz Y".
   - Classificar: erro de doc, bug de código, ou decisão de produto.

4. Sincronizar
   - Ajustar a documentação para bater com o código atual (padrão).
   - Se a decisão for ajustar código, implementar e só então atualizar a doc.

5. Validar
   - Rodar o fluxo principal do app (ou executar scripts) para garantir que a doc está correta.

## Checklist rápido (1:1)
- Nomes e caminhos de arquivos batem com o repositório.
- Formatos descritos batem com o parser/serializador.
- Campos e opções descritos existem na UI e no output.
- Passos de uso funcionam como descritos.

