# Instruções Gerais do Projeto
## Objetivo
Antes de executar qualquer tarefa, você deve compreender completamente o contexto do projeto, respeitar as regras abaixo e seguir o fluxo de trabalho definido neste documento.
---
## Aviso super importante:
- antes de realizar qualquer coisa vc precisa verificar que esta na branch opencode, caso não esteja solicite ao usuario que mude pra essa branch, você não deve fazer alterações em nenhuma outra branch em hipotese nenhuma salvo com explicita solicitação do usuario
# Fluxo Obrigatório de Inicialização
Sempre que iniciar uma nova tarefa, execute obrigatoriamente as etapas abaixo, nesta ordem:
1. Analise toda a estrutura do projeto e identifique os principais arquivos e diretórios.
2. Leia integralmente o arquivo `memorias.md`.
3. Leia integralmente o arquivo `checkpoints.md`.
4. Leia integralmente o arquivo `instrucoes.md`.
5. Caso exista qualquer dúvida sobre como proceder e essa dúvida não esteja respondida em `instrucoes.md`, interrompa o trabalho e pergunte explicitamente ao usuário antes de continuar.
6. Após concluir a análise inicial, apresente um resumo detalhado do seu entendimento do projeto.
7. Aguarde a confirmação do usuário antes de realizar qualquer alteração.
---
# Regras Críticas
## Banco de Dados
- Nunca altere o schema do Prisma.
- Nunca edite arquivos relacionados ao schema do Prisma.
- Nunca execute migrações automaticamente.
- Nunca rode comandos como `prisma migrate`, `prisma db push` ou similares.
- Se alguma alteração no banco de dados for realmente necessária, informe exatamente o que deve ser alterado para que o usuário realize manualmente.
- Alterações no Prisma devem ser tratadas como último recurso.
## Segurança Operacional
- Nunca faça alterações sem compreender completamente o impacto.
- Sempre preserve compatibilidade com o código existente.
- Evite mudanças desnecessárias.
- Não remova funcionalidades existentes sem autorização explícita.
- Em caso de dúvida, pergunte antes de prosseguir.
- realize somente as alteraçõs solicitas pelo usuairo, e caso precisa alterar algo mais, peça autorização para o usuario
---
# Fluxo de Execução de Tarefas
Ao receber uma solicitação de desenvolvimento, siga este processo:
1. Entenda o objetivo da solicitação.
2. Identifique todos os arquivos envolvidos.
3. Analise dependências e impactos da alteração.
4. Execute as mudanças necessárias.
5. Verifique se não houve regressões.
6. Execute o build do projeto para validar que a aplicação não foi quebrada.
7. Corrija automaticamente qualquer erro de build causado pelas alterações.
8. quando o build estiver concluído com sucesso, vc deve atualizar o repositorio no github
9. salvar os checkpoint no arquivo checkpoints.md e todo o aprendizado sobre o projeto no arquivo memoria.md
9. 1. analise todo o trabalho ja realizado consultando a memoria.md
10. passar um resumo detalhado do que foi alterado de forma simples de entender
---
# Validação Obrigatória
Antes de concluir qualquer trabalho, execute obrigatoriamente:
```bash
npx expo start - me pergunte se o app rodou corretamente