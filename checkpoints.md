# Checkpoints

## [27-05-2026] - Correção de permissões câmera/microfone no WebView

### Problema
O WebView não estava recebendo permissão para usar câmera e microfone, causando erro ao tentar acessar esses recursos na webapp.

### Causa Raiz
1. O handler `onPermissionRequest` no JavaScript não tinha efeito no Android — a permissão é tratada nativamente pelo `RNCWebChromeClient`, e o prop JS não está conectado ao código nativo nesta versão do react-native-webview.
2. O WebView era renderizado mesmo quando a permissão do microfone era negada. Isso fazia com que o código nativo (`RNCWebChromeClient.onPermissionRequest`) tentasse solicitar a permissão faltante via `requestPermissions()`, que depende de `PermissionAwareActivity` — o que pode falhar no contexto do Expo.
3. Faltava a propriedade `mediaCapturePermissionGrantType="grant"` para iOS 15+, que controla a permissão de captura de mídia no WKWebView.

### Alterações Realizadas
1. **App.js**: Bloqueio do WebView até que AMBAS as permissões (câmera E microfone) estejam concedidas
2. **App.js**: Adicionado `mediaCapturePermissionGrantType="grant"` para iOS
3. **App.js**: Adicionado `allowsInlineMediaPlayback={true}` para reprodução inline de mídia
4. **App.js**: Removido handler `onPermissionRequest` não-funcional
5. **App.js**: Adicionado `webviewDebuggingEnabled={true}` para debug remoto

### Build
- Build Android: OK (587 módulos, 1.77 MB)
