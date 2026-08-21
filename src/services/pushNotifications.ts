import {
  AuthorizationStatus,
  getInitialNotification,
  getMessaging,
  getToken,
  onMessage,
  onNotificationOpenedApp,
  requestPermission,
  setBackgroundMessageHandler,
  subscribeToTopic,
} from '@react-native-firebase/messaging';
import type { Messaging, RemoteMessage } from '@react-native-firebase/messaging';

/**
 * Etapa 1 — Notificações de reengajamento (estáticas).
 *
 * As campanhas são criadas e disparadas pelo Console do Firebase
 * (Messaging > Campanhas), segmentadas por tópico. Nenhum backend
 * é necessário nesta etapa.
 *
 * Todas as funções falham silenciosamente: push nunca bloqueia o app.
 */

/** Tópico único da Etapa 1: campanhas "para todos os usuários". */
export const PUSH_TOPIC_GERAL = 'geral';

function getFirebaseMessaging(): Messaging | null {
  try {
    return getMessaging();
  } catch {
    // Firebase nativo indisponível (ex.: Expo Go) — ignora.
    return null;
  }
}

/** Solicita permissão de notificações (obrigatório no Android 13+). */
export async function requestPushPermission(): Promise<boolean> {
  const messaging = getFirebaseMessaging();

  if (!messaging) return false;

  try {
    const status = await requestPermission(messaging);

    return (
      status === AuthorizationStatus.AUTHORIZED ||
      status === AuthorizationStatus.PROVISIONAL
    );
  } catch {
    return false;
  }
}

/**
 * Obtém o token FCM do dispositivo e inscreve no tópico geral.
 * Etapa 2: enviar este token ao backend para segmentação individual.
 */
export async function registerPushDevice(): Promise<void> {
  const messaging = getFirebaseMessaging();

  if (!messaging) return;

  try {
    const token = await getToken(messaging);

    // Log temporário da Etapa 1 — removido quando o backend assumir.
    console.log('[Push] Token FCM:', token);

    await subscribeToTopic(messaging, PUSH_TOPIC_GERAL);
  } catch (error) {
    console.log('[Push] Falha ao registrar dispositivo:', error);
  }
}

/** Inicializa permissão + registro. */
export async function initializePush(): Promise<void> {
  const granted = await requestPushPermission();

  if (granted) {
    await registerPushDevice();
  } else {
    console.log('[Push] Permissão de notificações negada.');
  }
}

/** Notificação recebida com o app EM PRIMEIRO PLANO (não exibe tray por padrão). */
export function setupForegroundHandler(): void {
  const messaging = getFirebaseMessaging();

  if (!messaging) return;

  onMessage(messaging, (remoteMessage: RemoteMessage) => {
    console.log(
      '[Push] Foreground:',
      remoteMessage.notification?.title ?? '(sem título)'
    );
  });
}

/** Usuário tocou na notificação e abriu o app (background ou app morto). */
export function setupOpenedHandlers(): void {
  const messaging = getFirebaseMessaging();

  if (!messaging) return;

  onNotificationOpenedApp(messaging, (remoteMessage: RemoteMessage) => {
    console.log(
      '[Push] App aberto via notificação:',
      remoteMessage.notification?.title ?? '(sem título)'
    );
  });

  void getInitialNotification(messaging).then((remoteMessage) => {
    if (remoteMessage) {
      console.log(
        '[Push] App iniciado via notificação:',
        remoteMessage.notification?.title ?? '(sem título)'
      );
    }
  });
}

/**
 * Data messages recebidas com o app morto/em background.
 * Deve ser registrado no boot (index.ts), fora de componentes React.
 * Campanhas "notification message" do console não passam por aqui.
 */
export function setupBackgroundHandler(): void {
  const messaging = getFirebaseMessaging();

  if (!messaging) return;

  setBackgroundMessageHandler(messaging, async () => {
    // Etapa 1: nada a processar em background.
  });
}
