---
name: "skil-refactor-guard"
description: "Refatora código com segurança e padrão sênior. Invocar quando for refatorar arquivos monolíticos ou extrair módulos sem quebrar o projeto."
---

# Skil Refactor Guard

## Objetivo
Refatorar com cuidado para não quebrar o projeto, aplicando um fluxo de segurança com backup e migração gradual.

## Quando invocar (obrigatório)
- Sempre que for refatorar um arquivo monolítico (grande, muitas responsabilidades, difícil de manter).
- Sempre que for extrair funções/módulos de um arquivo para outros arquivos.
- Sempre que houver risco de regressão por mudanças estruturais.

## Regras de segurança
- Nunca refatore “no escuro”: antes, leia o arquivo e entenda entradas/saídas e integrações.
- Sempre criar um backup do arquivo original antes de mexer (para consulta e restauração).
- Criar primeiro o(s) arquivo(s) novo(s) que vão receber o código refatorado.
- Só depois de migrar e validar o comportamento, remover o código duplicado do arquivo monolítico.
- No final, rodar os comandos de validação do projeto (lint/typecheck/test) quando existirem.

## Fluxo recomendado (passo a passo)
1. Mapear o arquivo monolítico
   - Identificar responsabilidades, funções principais, pontos de entrada (event listeners, exports, chamadas globais).
   - Listar dependências (DOM, globals, imports, APIs, arquivos externos).

2. Criar backup do original
   - Criar um arquivo de backup no projeto com nome explícito.
   - Padrão recomendado: `<arquivo>.bak` ou `<arquivo>.backup.<ext>`.

3. Criar arquivos novos para a refatoração
   - Criar módulos/coisas novas com nomes claros.
   - Copiar o código que será migrado para esses arquivos e ajustar as interfaces.
   - Manter o arquivo monolítico funcionando (não remover nada ainda).

4. Integrar sem quebrar
   - Ligar o monolítico aos novos módulos (imports/chamadas) preservando comportamento.
   - Garantir que o caminho antigo e o novo não conflitam.

5. Validar comportamento
   - Testar manualmente o fluxo principal.
   - Rodar lint/typecheck/test, se existirem.

6. Remover duplicação com segurança
   - Remover do monolítico apenas o que já foi migrado e validado.
   - Se surgir erro, usar o backup para comparar ou restaurar rapidamente.

7. Finalizar
   - Garantir que não sobrou referência quebrada.
   - Garantir que o arquivo novo é a fonte final do código migrado.

## Critérios de aceite
- Build/validações passam.
- Não há duplicação do mesmo comportamento em dois lugares.
- O backup existe até a refatoração estar estável.

