import Cookies from "js-cookie";

const TOKEN_KEY = "loop_token";
const REMEMBER_DAYS = 30;

const buildOptions = (rememberMe) => ({
  sameSite: "strict",
  secure: window.location.protocol === "https:",
  path: "/",
  ...(rememberMe ? { expires: REMEMBER_DAYS } : {}),
});

export const saveSession = (token, rememberMe) => {
  Cookies.set(TOKEN_KEY, token, buildOptions(rememberMe));
};

export const getToken = () => Cookies.get(TOKEN_KEY);

export const clearSession = () => {
  Cookies.remove(TOKEN_KEY, { path: "/" });
};
