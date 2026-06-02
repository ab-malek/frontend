export type SignupPayload = {
  name: string;
  email: string;
  password: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type AuthApiResponse = {
  message: string;
  token?: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
};

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000";

async function postJson<TPayload>(endpoint: string, payload: TPayload): Promise<AuthApiResponse> {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = (await response.json()) as AuthApiResponse;

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}

export function signup(payload: SignupPayload) {
  return postJson("/api/auth/signup", payload);
}

export function login(payload: LoginPayload) {
  return postJson("/api/auth/login", payload);
}
