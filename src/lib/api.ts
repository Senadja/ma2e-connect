// Client API centralisé pour le backend MA2E.
// Injecte automatiquement le token Bearer et gère les erreurs JSON.

const BASE_URL = (import.meta.env.VITE_API_URL as string) || "/api";
const TOKEN_KEY = "ma2e-token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

// Session expirée / token invalide : on purge le token et on notifie l'app
// (AdminLayout écoute cet événement pour déconnecter et rediriger vers le login).
// Évite que les lectures authentifiées du back-office échouent en silence.
function handleUnauthorized() {
  setToken(null);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("ma2e:unauthorized"));
  }
}

type Options = {
  method?: string;
  body?: unknown;
  auth?: boolean;
  isForm?: boolean;
};

export async function api<T = unknown>(path: string, opts: Options = {}): Promise<T> {
  const { method = "GET", body, auth = false, isForm = false } = opts;
  const headers: Record<string, string> = {};
  if (!isForm && body !== undefined) headers["Content-Type"] = "application/json";
  if (auth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : isForm ? (body as FormData) : JSON.stringify(body),
    });
  } catch {
    throw new ApiError("Impossible de joindre le serveur", 0);
  }

  if (res.status === 204) return undefined as T;

  const text = await res.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      // Le serveur a renvoyé une réponse non-JSON (page d'erreur HTML, 413
      // fichier trop volumineux, timeout du proxy…). On ne propage pas le
      // cryptique « Unexpected token … is not valid JSON ».
      if (res.status === 401 && auth) handleUnauthorized();
      throw new ApiError(
        res.status === 413
          ? "Fichier trop volumineux."
          : "Le serveur a renvoyé une réponse inattendue. Réessayez.",
        res.status || 500
      );
    }
  }

  if (!res.ok) {
    if (res.status === 401 && auth) handleUnauthorized();
    const message = (data as { error?: string } | null)?.error;
    throw new ApiError(message || "Une erreur est survenue", res.status);
  }
  return data as T;
}
