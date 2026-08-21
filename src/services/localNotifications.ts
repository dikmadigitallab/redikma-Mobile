import * as Notifications from 'expo-notifications';

/**
 * Etapa 1 — Notificações locais de reengajamento.
 *
 * Mensagens fixas gravadas no próprio app, sem servidor nem Firebase.
 * Estratégia: a cada abertura do app, o lembrete pendente é cancelado e
 * re-agendado para daqui INACTIVITY_DAYS dias. Assim, apenas usuários que
 * ficarem inativos por esse período recebem a notificação — quem usa o
 * app com frequência nunca é incomodado.
 *
 * Fase 2: Firebase Cloud Messaging assume o disparo remoto e segmentado;
 * este módulo pode ser removido ou mantido como fallback.
 */

/** Dias de inatividade antes de disparar o lembrete. */
const INACTIVITY_DAYS = 3;

/** Canal Android do canal de lembretes. */
const CHANNEL_ID = 'redikma-lembretes';

/** Mensagens fixas de reengajamento (uma é escolhida aleatoriamente). */
const REENGAGEMENT_MESSAGES: ReadonlyArray<{
  title: string;
  body: string;
}> = [
  {
    title: 'Saudade de você! 👋',
    body: 'Faz tempo que você não aparece no Redikma. Venha ver as últimas novidades!',
  },
  {
    title: 'Tem novidade esperando por você 📰',
    body: 'Você já viu as novas postagens de hoje no Redikma?',
  },
  {
    title: 'O Redikma está movimentado 💬',
    body: 'Novas publicações e interações te esperam. Corre lá para conferir!',
  },
  {
    title: 'Não perca o que rolou ✨',
    body: 'Aconteceu bastante coisa no Redikma enquanto você esteve fora.',
  },
];

/**
 * Com o app EM PRIMEIRO PLANO, notificação agendada não deve incomodar:
 * silencia banner/lista (o usuário já está dentro do app).
 */
export function configureForegroundBehavior(): void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: false,
      shouldShowList: false,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

async function ensurePermission(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();

  if (current.granted) return true;

  const request = await Notifications.requestPermissionsAsync();

  return request.granted;
}

/**
 * Cancela lembretes pendentes e agenda o próximo para
 * INACTIVITY_DAYS dias à frente, com mensagem aleatória.
 * Falha silenciosamente se a permissão for negada.
 */
export async function scheduleReengagementNotification(): Promise<void> {
  try {
    const granted = await ensurePermission();

    if (!granted) return;

    await Notifications.cancelAllScheduledNotificationsAsync();

    const index = Math.floor(Math.random() * REENGAGEMENT_MESSAGES.length);
    const message =
      REENGAGEMENT_MESSAGES[index] ?? REENGAGEMENT_MESSAGES[0];

    if (!message) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: message.title,
        body: message.body,
        sound: 'default',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: INACTIVITY_DAYS * 24 * 60 * 60,
        channelId: CHANNEL_ID,
      },
    });

    console.log(
      `[Push] Lembrete agendado para daqui ${INACTIVITY_DAYS} dias.`
    );
  } catch (error) {
    // Sem módulo nativo (ex.: Expo Go) ou falha transitória: ignora.
    console.log('[Push] Falha ao agendar lembrete:', error);
  }
}
