type PushMessage = {
  to: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
};

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

const titles: Record<string, string> = {
  friend_accepted: "Nowy znajomy",
  booking_requested: "Nowa prośba o pobyt",
  booking_approved: "Pobyt zaakceptowany",
  booking_declined: "Pobyt odrzucony",
  booking_canceled: "Pobyt anulowany",
  place_deactivated: "Miejsce wyłączone",
  availability_conflict: "Konflikt dostępności",
  invite_signup: "Ktoś dołączył"
};

const bodies: Record<string, string> = {
  friend_accepted: "Twoje zaproszenie zostało przyjęte.",
  booking_requested: "Masz nową prośbę o pobyt.",
  booking_approved: "Twój pobyt został zaakceptowany.",
  booking_declined: "Twój pobyt został odrzucony.",
  booking_canceled: "Pobyt został anulowany.",
  place_deactivated: "Miejsce zostało wyłączone z użytku.",
  availability_conflict: "Zaktualizowano dostępność z konfliktem.",
  invite_signup: "Znajomy użył Twojego zaproszenia."
};

export async function sendExpoPush(messages: PushMessage[]) {
  if (messages.length === 0) {
    return;
  }

  try {
    await fetch(EXPO_PUSH_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(process.env.EXPO_ACCESS_TOKEN
          ? { Authorization: `Bearer ${process.env.EXPO_ACCESS_TOKEN}` }
          : {})
      },
      body: JSON.stringify(messages)
    });
  } catch {
    // TODO: handle push failures (ignored in MVP).
  }
}

export function pushPayload(type: string) {
  return {
    title: titles[type] ?? "Domy Kolegów",
    body: bodies[type] ?? "Masz nowe powiadomienie."
  };
}
