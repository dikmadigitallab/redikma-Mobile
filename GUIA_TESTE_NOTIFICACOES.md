# Guia de Teste — Notificações Locais (Etapa 1)

> Criado em 21-08-2026 · Branch `opencode` · Commit `1884d27`
>
> Objetivo: testar na outra máquina (com Android Studio) as notificações
> locais de reengajamento implementadas hoje.

---

## O que foi implementado

- **Notificações locais nativas** (`expo-notifications`): a cada abertura do
  app, cancela lembretes pendentes e agenda um novo para **3 dias depois**.
  - Quem usa o app com frequência **nunca recebe** notificação.
  - Quem fica 3+ dias sem abrir, recebe um lembrete com mensagem aleatória.
- **4 mensagens fixas** em PT-BR (editáveis em
  `src/services/localNotifications.ts`, array `REENGAGEMENT_MESSAGES`).
- **Firebase instalado mas INATIVO** (fase 2): libs RNFB v26, plugin no
  app.json, serviço pronto em `src/services/pushNotifications.ts`.
  Nada dele roda hoje.

---

## Passo a passo na outra máquina

### 1. Baixar e preparar

```powershell
git pull
npm install
```

Confirme que está logado no EAS com a conta certa (necessário só para
builds EAS; para Android Studio local não precisa):

```powershell
eas whoami   # deve mostrar: oskharm12
```

### 2. Ativar modo teste rápido (opcional, recomendado)

Para a notificação chegar em ~2 minutos em vez de 3 dias, edite
`src/services/localNotifications.ts`:

```ts
// ANTES
const INACTIVITY_DAYS = 3;
...
seconds: INACTIVITY_DAYS * 24 * 60 * 60,

// DEPOIS (modo teste)
const INACTIVITY_DAYS = 0;
...
seconds: 2 * 60,
```

⚠️ **Reverter para os valores originais antes de qualquer build de produção!**

### 3. Compilar e rodar

**Opção A — tudo automático (recomendado):**

```powershell
npx expo run:android
```

Gera a pasta `android/`, compila com Gradle e instala no emulador ou
celular conectado via USB.

**Opção B — pelo Android Studio:**

```powershell
npx expo prebuild --platform android
```

Abra a pasta **`android/`** no Android Studio → Run ▶️.
Nesse caso rode também `npx expo start` num segundo terminal
(o dev client precisa do Metro bundler).

---

## Roteiro de validação

1. [ ] App abre normalmente (WebView do Redikma carrega)
2. [ ] Prompt de permissão de notificações aparece (Android 13+)
3. [ ] Aceitar a permissão
4. [ ] Fechar o app completamente
5. [ ] Aguardar o tempo do trigger (2 min no modo teste)
6. [ ] Notificação aparece no tray com uma das 4 mensagens
7. [ ] Tocar na notificação → app abre
8. [ ] Reabrir o app antes do prazo → notificação pendente é cancelada
      (verificar em Configurações → Apps → ReDikma → Notificações →
      canal `redikma-lembretes`)
9. [ ] Com o app ABERTO em primeiro plano, nenhuma notificação incomoda

---

## Depois do teste

Reverter o modo teste:

```ts
const INACTIVITY_DAYS = 3;
...
seconds: INACTIVITY_DAYS * 24 * 60 * 60,
```

Commitar qualquer ajuste na branch `opencode`.

---

## Problemas comuns

| Sintoma | Causa provável | Solução |
|---|---|---|
| Gradle falha no build | JDK errado | Usar JDK 17 |
| `ANDROID_HOME not found` | SDK não configurado | Definir variável de ambiente apontando pro SDK do Android Studio |
| Notificação não chega | Emulador sem Google Play / bateria otimizada | Testar em dispositivo físico; desativar otimização de bateria do app |
| App abre sem JS carregar | Metro não está rodando | Rodar `npx expo start` e recarregar o dev client |
| Erro de dependências | Lockfile dessincronizado | Apagar `node_modules` e rodar `npm install` de novo |

---

## Fase 2 (futuro) — Firebase Cloud Messaging

Já está tudo preparado: libs instaladas, plugin configurado,
`google-services.json` válido (projeto `redikma-ff4bb`) e serviço completo
em `src/services/pushNotifications.ts`. Para ativar:

1. Importar `setupBackgroundHandler` no `index.ts` e chamar no boot
2. Chamar `initializePush()` + handlers no `App.tsx`
3. Remover/desativar o agendamento local se desejar
