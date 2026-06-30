const CSRF_COOKIE_NAME = "csrf_token_js";
const AUTH_TOKEN_KEY = "raksha_auth_token";

function getCsrfToken(): string | null {
  const cookies = document.cookie.split(";");
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split("=");
    if (name === CSRF_COOKIE_NAME) {
      return value;
    }
  }
  return null;
}

export function getAuthToken(): string | null {
  try {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setAuthToken(token: string): void {
  try {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  } catch {}
}

export function clearAuthToken(): void {
  try {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  } catch {}
}

export async function fetchWithCsrf(url: string, options: RequestInit = {}): Promise<Response> {
  const method = options.method?.toUpperCase() || "GET";
  const headers = new Headers(options.headers);
  
  const authToken = getAuthToken();
  if (authToken) {
    headers.set("Authorization", `Bearer ${authToken}`);
  }
  
  if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    let token = getCsrfToken();
    
    if (!token) {
      try {
        const fetchHeaders: Record<string, string> = {};
        if (authToken) fetchHeaders["Authorization"] = `Bearer ${authToken}`;
        const res = await fetch("/api/csrf-token", { 
          credentials: "include",
          headers: fetchHeaders
        });
        if (res.ok) {
          const data = await res.json();
          token = data.csrfToken;
        }
      } catch (e) {
        console.error("Failed to fetch CSRF token:", e);
      }
    }
    
    if (token) {
      headers.set("x-csrf-token", token);
    }
  }
  
  options.headers = headers;
  options.credentials = options.credentials || "include";
  
  return fetch(url, options);
}

export async function initCsrf(): Promise<void> {
  if (!getCsrfToken()) {
    try {
      const headers: Record<string, string> = {};
      const authToken = getAuthToken();
      if (authToken) headers["Authorization"] = `Bearer ${authToken}`;
      await fetch("/api/csrf-token", { credentials: "include", headers });
    } catch (e) {
      console.error("Failed to initialize CSRF token:", e);
    }
  }
}
