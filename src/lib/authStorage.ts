export const AUTH_TOKEN_KEY = "theyassist_auth_token";
export const AUTH_USER_KEY = "theyassist_auth_user";
export const AUTH_USER_NAME_KEY = "theyassist_auth_user_name";
export const AUTH_USER_PROFILE_KEY_PREFIX = "theyassist_user_profile";
const AUTH_TOKEN_CHANGED_EVENT = "theyassist_auth_token_changed";

export type StoredAuthUser = {
  id?: number | string;
  name: string;
  email?: string;
};

export type StoredUserProfile = {
  background: string;
  interestTopics: string[];
  experience: string;
};

export function getAuthToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(AUTH_TOKEN_KEY);
}

export function getServerAuthTokenSnapshot() {
  return undefined;
}

export function getAuthUserName() {
  if (typeof window === "undefined") {
    return null;
  }

  return getAuthUser()?.name ?? window.localStorage.getItem(AUTH_USER_NAME_KEY);
}

export function getAuthUser() {
  if (typeof window === "undefined") {
    return null;
  }

  const savedUser = window.localStorage.getItem(AUTH_USER_KEY);

  if (savedUser) {
    try {
      const user = JSON.parse(savedUser) as Partial<StoredAuthUser>;
      if (typeof user.name === "string" && user.name.trim()) {
        return user as StoredAuthUser;
      }
    } catch {
      window.localStorage.removeItem(AUTH_USER_KEY);
    }
  }

  return null;
}

export function setAuthToken(token: string) {
  window.localStorage.setItem(AUTH_TOKEN_KEY, token);
  window.dispatchEvent(new Event(AUTH_TOKEN_CHANGED_EVENT));
}

export function setAuthUser(user: StoredAuthUser) {
  window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  window.localStorage.setItem(AUTH_USER_NAME_KEY, user.name);
  window.dispatchEvent(new Event(AUTH_TOKEN_CHANGED_EVENT));
}

export function getAuthUserProfile() {
  if (typeof window === "undefined") {
    return null;
  }

  const savedProfile = getAuthUserProfileSnapshot();

  if (!savedProfile) {
    return null;
  }

  try {
    return JSON.parse(savedProfile) as StoredUserProfile;
  } catch {
    const user = getAuthUser();
    window.localStorage.removeItem(getUserProfileKey(user));
    return null;
  }
}

export function getAuthUserProfileSnapshot() {
  if (typeof window === "undefined") {
    return null;
  }

  const user = getAuthUser();
  const profileKey = getUserProfileKey(user);
  return window.localStorage.getItem(profileKey);
}

export function setAuthUserProfile(profile: StoredUserProfile) {
  const user = getAuthUser();
  window.localStorage.setItem(getUserProfileKey(user), JSON.stringify(profile));
  window.dispatchEvent(new Event(AUTH_TOKEN_CHANGED_EVENT));
}

function getUserProfileKey(user: StoredAuthUser | null) {
  const userId = user?.id ?? user?.email ?? "current";
  return `${AUTH_USER_PROFILE_KEY_PREFIX}:${userId}`;
}

export function clearAuthToken() {
  window.localStorage.removeItem(AUTH_TOKEN_KEY);
  window.localStorage.removeItem(AUTH_USER_KEY);
  window.localStorage.removeItem(AUTH_USER_NAME_KEY);
  window.dispatchEvent(new Event(AUTH_TOKEN_CHANGED_EVENT));
}

export function subscribeToAuthToken(listener: () => void) {
  window.addEventListener("storage", listener);
  window.addEventListener(AUTH_TOKEN_CHANGED_EVENT, listener);

  return () => {
    window.removeEventListener("storage", listener);
    window.removeEventListener(AUTH_TOKEN_CHANGED_EVENT, listener);
  };
}
