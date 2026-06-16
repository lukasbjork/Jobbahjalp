// Liten fetch-hjälpare för klienten. Kastar ett Error med ett svenskt
// meddelande från servern (inklusive 429-vänligt "försök igen om en stund").

export async function postJson<T>(url: string, body: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error("Kunde inte nå servern. Kontrollera din uppkoppling.");
  }

  if (!res.ok) {
    let message = "Något gick fel. Försök igen.";
    try {
      const data = (await res.json()) as { error?: string };
      if (data?.error) message = data.error;
    } catch {
      // Ignorera trasig JSON, behåll standardmeddelandet.
    }
    throw new Error(message);
  }

  return (await res.json()) as T;
}
