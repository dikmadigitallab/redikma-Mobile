# Memória do Projeto - Redikma Mobile

## Arquitetura
Aplicativo React Native (Expo 54) que funciona como wrapper WebView para a plataforma Redikma (rede social corporativa).

## Stack
- Expo ~54.0.33
- React Native 0.81.5
- react-native-webview 13.15.0
- expo-camera ~17.0.10

## Estrutura
- `App.tsx` - Componente principal com WebView + permissões
- `index.ts` - Entry point
- `app.json` - Configuração Expo com permissões nativas

## TypeScript
- Projeto 100% TypeScript desde 28-05-2026
- `tsconfig.json` com `strict`, `module: "esnext"`, `moduleResolution: "bundler"`
- Entry point `index.ts` com `package.json` `main` atualizado

## Aprendizados

### Permissões de Câmera/Microfone no WebView (27-05-2026)
- O handler `onPermissionRequest` no JS **não funciona** no Android — o `RNCWebChromeClient` nativo gerencia as permissões automaticamente
- O fluxo nativo: WebView → `RNCWebChromeClient.onPermissionRequest()` → verifica `checkSelfPermission()` → se concedido, chama `request.grant()` diretamente; se não, tenta `Activity.requestPermissions()` via PermissionAwareActivity
- Se alguma permissão solicitada pelo WebView (ex: RECORD_AUDIO) não estiver concedida no nível do Android, o código nativo tenta o fluxo assíncrono que pode falhar no Expo
- **Solução**: Garantir que AMBAS as permissões (CAMERA + RECORD_AUDIO) sejam solicitadas e concedidas ANTES de renderizar o WebView
- No iOS, usar `mediaCapturePermissionGrantType="grant"` para auto-autorizar captura de mídia no WKWebView (iOS 15+)

### React Native WebView 13.15.0
- Versão usa a nova arquitetura (Fabric) com `codegenNativeComponent`
- O prop `onPermissionRequest` está definido nos tipos TypeScript mas **não é implementado** no código nativo Android
- Permissões de mídia são tratadas exclusivamente pelo `RNCWebChromeClient` no lado Java

## Endurecimento de Segurança do WebView (20-08-2026) — autoria: VIBECODE
- **Contexto**: app é wrapper puro de WebView para plataforma Next.js (login obrigatório, só autores autorizados postam). Auditoria identificou superfície de ataque desnecessária.
- **Mudanças em `App.tsx`**:
  - Allowlist de navegação: `onShouldStartLoadWithRequest` só permite `https://*.dikmadigital.com.br`; links externos abrem no navegador do sistema via `Linking.openURL` (decisão do usuário)
  - Iframes/embeds permitidos (`isTopFrame === false`) para não quebrar embeds de terceiros
  - `mediaCapturePermissionGrantType`: `"grant"` → `"prompt"` (usuário vê pedido nativo; antes qualquer origem visitada recebia câmera/mic silenciosamente)
  - Removidos: `allowFileAccess`, `allowFileAccessFromFileURLs`, `allowUniversalAccessFromFileURLs`, `mixedContentMode="always"` (inúteis para conteúdo 100% HTTPS remoto)
  - `webviewDebuggingEnabled={__DEV__}` (antes ligado incondicionalmente em produção)
- **Tipo**: `ShouldStartLoadRequest` não é re-exportado pelo index do react-native-webview 13.x — usada interface estrutural local `NavigationRequest { url: string; isTopFrame?: boolean }`
- **Validação**: `npx tsc --noEmit` limpo. Script `npm run build` não existe no projeto.
- **Pendências conhecidas**:
  - `eas.projectId` no `app.json` foi trocado no commit remoto `84958f4` (`608838e5...` → `5f7f415b...`) — usuário precisa confirmar qual é o oficial antes do próximo `eas build`
  - Chave NVIDIA órfã em `.env` (gitignored, nunca commitada — histórico limpo) — recomendada revogação
  - `google-services.json` presente mas sem wiring no Expo e fora do `.gitignore` — risco de commit acidental
  - Permissões Android excessivas no `app.json` (READ_MEDIA_AUDIO, FOREGROUND_SERVICE etc.) — podar após validar o que o webapp realmente usa
