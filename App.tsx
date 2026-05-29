import { useState, useEffect, useRef, useCallback } from 'react';
import {
  StyleSheet,
  View,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  Platform,
} from 'react-native';

import {
  SafeAreaView,
  SafeAreaProvider,
} from 'react-native-safe-area-context';

import { WebView } from 'react-native-webview';
import { Camera } from 'expo-camera';
import { StatusBar } from 'expo-status-bar';

// const WEBAPP_URL = 'https://redikma-dev.dikmadigital.com.br/'; // produção
// const WEBAPP_URL = 'https://redikma-hml.dikmadigital.com.br/'; // homologação
// const WEBAPP_URL = 'https://redikma-dev.dikmadigital.com.br/'; // versão dev

const WEBAPP_URL =
  'https://redikma-git-opencode-dikmadigitals-projects.vercel.app';

const LOAD_TIMEOUT_MS = 15000;

const COLORS = {
  primaryDark: '#0A4554',
  secondary: '#4FC3D9',
  white: '#FFFFFF',
  black: '#1A1A1A',
  gray: '#757575',
  background: '#F5F5F5',
  border: '#E0E0E0',
  accent: '#FDE205',
};

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

  const renderPermissionScreen = (
    message: string,
    subtitle?: string
  ) => (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />

      <View style={styles.centeredContent}>
        {message === 'Solicitando permissões necessárias...' && (
          <ActivityIndicator
            size="large"
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
            allowFileAccess
            allowFileAccessFromFileURLs
            allowUniversalAccessFromFileURLs
            mediaPlaybackRequiresUserAction={false}
            mixedContentMode="always"
            androidLayerType="hardware"
            allowsInlineMediaPlayback
            mediaCapturePermissionGrantType="grant"
            webviewDebuggingEnabled
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
    backgroundColor: COLORS.white,
    paddingHorizontal: 24,
  },

  permissionTitle: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.black,
    textAlign: 'center',
  },

  permissionSubtitle: {
    marginTop: 8,
    fontSize: 14,
    color: COLORS.gray,
    textAlign: 'center',
    lineHeight: 20,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryDark,
    paddingHorizontal: 100,
    paddingVertical: Platform.OS === 'android' ? 24 : 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },

  headerIcon: {
    width: 28,
    height: 28,
    borderRadius: 6,
    marginRight: 10,
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.white,
    letterSpacing: 0.5,
  },

  content: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  webview: {
    flex: 1,
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
    color: COLORS.gray,
  },

  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },

  errorCard: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },

  errorIcon: {
    fontSize: 56,
    marginBottom: 20,
  },

  errorTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.black,
    marginBottom: 10,
  },

  errorDescription: {
    fontSize: 15,
    color: COLORS.gray,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },

  retryButton: {
    backgroundColor: COLORS.primaryDark,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 10,
    minWidth: 200,
    alignItems: 'center',
  },

  retryText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },

  footer: {
    height: Platform.OS === 'ios' ? 18 : 30,
    backgroundColor: COLORS.primaryDark,
  },
});