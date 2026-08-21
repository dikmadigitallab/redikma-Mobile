import { useState, useEffect, useRef, useCallback } from 'react';
import {
  StyleSheet,
  View,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  Platform,
  Linking,
} from 'react-native';

import {
  SafeAreaView,
  SafeAreaProvider,
} from 'react-native-safe-area-context';

import { WebView } from 'react-native-webview';
import { Camera } from 'expo-camera';
import { StatusBar } from 'expo-status-bar';

 //const WEBAPP_URL = 'https://redikma-dev.dikmadigital.com.br/'; // produção
const WEBAPP_URL = 'https://redikma-hml.dikmadigital.com.br/'; // homologação
// const WEBAPP_URL = 'https://redikma-dev.dikmadigital.com.br/'; // versão dev
//const WEBAPP_URL ='https://redikma-git-opencode-dikmadigitals-projects.vercel.app';

const LOAD_TIMEOUT_MS = 15000;

// Único domínio autorizado a carregar dentro do WebView (inclui subdomínios)
const ALLOWED_HOST_SUFFIX = 'dikmadigital.com.br';

// Subconjunto dos campos de navegação usados no filtro de origem
interface NavigationRequest {
  url: string;
  isTopFrame?: boolean;
}

const COLORS = {
  primaryDark: '#272662',
  secondary: '#86B0DD',
  accent: '#F15A24',

  white: '#FFFFFF',
  black: '#272662',
  gray: '#5C5A7A',

  background: '#F7ECDA',
  border: '#272662',
} as const;

function MainApp() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [hasMicPermission, setHasMicPermission] = useState<boolean | null>(null);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadTimedOut, setLoadTimedOut] = useState(false);

  const webViewRef = useRef<WebView>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const cameraPermission =
          await Camera.requestCameraPermissionsAsync();

        setHasPermission(cameraPermission.status === 'granted');
      } catch {
        setHasPermission(false);
      }

      try {
        const micPermission =
          await Camera.requestMicrophonePermissionsAsync();

        setHasMicPermission(micPermission.status === 'granted');
      } catch {
        setHasMicPermission(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (isLoading) {
      timeoutRef.current = setTimeout(() => {
        setLoadTimedOut(true);
        setIsLoading(false);
      }, LOAD_TIMEOUT_MS);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isLoading]);

  const handleError = useCallback(() => {
    setHasError(true);
    setIsLoading(false);
  }, []);

  const handleLoadEnd = useCallback(() => {
    setIsLoading(false);
    setLoadTimedOut(false);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  const handleContentProcessDidTerminate = useCallback(() => {
    webViewRef.current?.reload();
  }, []);

  const handleRetry = useCallback(() => {
    setHasError(false);
    setLoadTimedOut(false);
    setIsLoading(true);

    webViewRef.current?.reload();
  }, []);

  const isAllowedOrigin = useCallback((url: string): boolean => {
    try {
      const { protocol, hostname } = new URL(url);

      return (
        protocol === 'https:' &&
        (hostname === ALLOWED_HOST_SUFFIX ||
          hostname.endsWith(`.${ALLOWED_HOST_SUFFIX}`))
      );
    } catch {
      return false;
    }
  }, []);

  const handleShouldStartLoad = useCallback(
    (request: NavigationRequest): boolean => {
      // Embeds/iframes não são navegação principal — permite renderizar
      if (request.isTopFrame === false) {
        return true;
      }

      if (isAllowedOrigin(request.url)) {
        return true;
      }

      // Qualquer outro destino abre no navegador do dispositivo
      void Linking.openURL(request.url).catch(() => {
        // Falha ao abrir navegador externo: apenas bloqueia a navegação
      });

      return false;
    },
    [isAllowedOrigin]
  );

  const renderPermissionScreen = (
    message: string,
    subtitle?: string
  ) => (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />

      <View style={styles.centeredContent}>
        {message === 'Solicitando permissões necessárias...' && (
          <ActivityIndicator
            size="small"
            color={COLORS.primaryDark}
          />
        )}

        <Text style={styles.permissionTitle}>{message}</Text>

        {!!subtitle && (
          <Text style={styles.permissionSubtitle}>
            {subtitle}
          </Text>
        )}
      </View>
    </SafeAreaView>
  );

  if (hasPermission === null || hasMicPermission === null) {
    return renderPermissionScreen(
      'Solicitando permissões necessárias...'
    );
  }

  if (!hasPermission || !hasMicPermission) {
    return renderPermissionScreen(
      'Permissões necessárias negadas',
      'Acesse as configurações do dispositivo para permitir o acesso à câmera e ao microfone.'
    );
  }

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={['top', 'bottom']}
    >
      <StatusBar hidden />

      <View style={styles.header}>
        {/* <Image source={require('./assets/icon.png')} style={styles.headerIcon} /> */}
        {/* <Text style={styles.headerTitle}>Redikma</Text> */}
        
      </View>

      <View style={styles.content}>
        {hasError || loadTimedOut ? (
          <View style={styles.errorContainer}>
            <View style={styles.errorCard}>
              <Text style={styles.errorIcon}>📡</Text>

              <Text style={styles.errorTitle}>
                {loadTimedOut
                  ? 'Tempo excedido'
                  : 'Sem conexão'}
              </Text>

              <Text style={styles.errorDescription}>
                {loadTimedOut
                  ? 'O servidor está demorando muito para responder. Verifique sua conexão e tente novamente.'
                  : 'Verifique sua conexão com a internet e tente novamente.'}
              </Text>

              <TouchableOpacity
                style={styles.retryButton}
                onPress={handleRetry}
                activeOpacity={0.8}
              >
                <Text style={styles.retryText}>
                  Tentar novamente
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <WebView
            ref={webViewRef}
            source={{ uri: WEBAPP_URL }}
            style={styles.webview}
            javaScriptEnabled
            domStorageEnabled
            mediaPlaybackRequiresUserAction={false}
            androidLayerType="hardware"
            allowsInlineMediaPlayback
            mediaCapturePermissionGrantType="prompt"
            webviewDebuggingEnabled={__DEV__}
            onShouldStartLoadWithRequest={handleShouldStartLoad}
            startInLoadingState
            renderLoading={() => (
              <View style={styles.loadingContainer}>
                <ActivityIndicator
                  size="large"
                  color={COLORS.secondary}
                />

                <Text style={styles.loadingText}>
                  Carregando...
                </Text>
              </View>
            )}
            onError={handleError}
            onLoadEnd={handleLoadEnd}
            onContentProcessDidTerminate={
              handleContentProcessDidTerminate
            }
          />
        )}
      </View>

      <View style={styles.footer} />
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <MainApp />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.primaryDark,
  },

  centeredContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: 24,
  },

  permissionTitle: {
    marginTop: 16,
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.primaryDark,
    textAlign: 'center',
  },

  permissionSubtitle: {
    marginTop: 10,
    fontSize: 14,
    color: COLORS.gray,
    textAlign: 'center',
    lineHeight: 22,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primaryDark,
    paddingHorizontal: 24,
    paddingVertical: Platform.OS === 'android' ? 6 : 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  headerIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    marginRight: 10,
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: 0.3,
  },

  content: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  webview: {
    flex: 1,
    backgroundColor: COLORS.background,
    
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },

  loadingText: {
    marginTop: 16,
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.primaryDark,
  },

  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: 24,
  },

  errorCard: {
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 18,
    paddingVertical: 32,
    paddingHorizontal: 28,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  errorIcon: {
    fontSize: 52,
    marginBottom: 18,
  },

  errorTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.primaryDark,
    marginBottom: 10,
    textAlign: 'center',
  },

  errorDescription: {
    fontSize: 15,
    color: COLORS.gray,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 28,
  },

  retryButton: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    minWidth: 220,
    alignItems: 'center',
  },

  retryText: {
    color: COLORS.primaryDark,
    fontSize: 16,
    fontWeight: '700',
  },

  footer: {
    height: Platform.OS === 'ios' ? 14 : 22,
    backgroundColor: COLORS.primaryDark,
  },
});