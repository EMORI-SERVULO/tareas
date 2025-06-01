import { useContext, createContext, useState, useEffect } from "react";
import type { AuthResponse, User } from "../types/types";
import requestNewAccessToken from "./requestNewAccessToken";
import { API_URL } from "./authConstants";

const AuthContext = createContext({
  isAuthenticated: false,
  getAccessToken: () => {},
  setAccessTokenAndRefreshToken: (
    _accessToken: string,
    _refreshToken: string
  ) => {},
  getRefreshToken: () => {},
  saveUser: (_userData: AuthResponse) => {},
  getUser: () => ({} as User | undefined),
  signout: () => {},
});

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | undefined>();
  const [accessToken, setAccessToken] = useState<string>("");
  const [refreshToken, setRefreshToken] = useState<string>("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isloading, setIsLoading] = useState(true);

function getAccessToken() {
  if (accessToken) return accessToken;

  const token = localStorage.getItem("token");
  if (token) {
    const { accessToken } = JSON.parse(token);
    setAccessToken(accessToken);
    return accessToken;
  }

  return null;
}

  function saveUser(userData: AuthResponse) {
    setAccessTokenAndRefreshToken(
      userData.access_token,
      userData.refreshToken
    );
    setUser(userData.user);
    setIsAuthenticated(true);
  }

  function setAccessTokenAndRefreshToken(
    accessToken: string,
    refreshToken: string
  ) {
    console.log("setAccessTokenAndRefreshToken", accessToken, refreshToken);
    setAccessToken(accessToken);
    setRefreshToken(refreshToken);

    localStorage.setItem("token", JSON.stringify({ accessToken, refreshToken }));
  }

  function getRefreshToken() {
    if (!!refreshToken) {
      return refreshToken;
    }
    const token = localStorage.getItem("token");
    if (token) {
      const { refreshToken } = JSON.parse(token);
      setRefreshToken(refreshToken);
      return refreshToken;
    }
    return null;
  }

  async function getNewAccessToken(refreshToken: string) {
    const token = await requestNewAccessToken(refreshToken);
    if (token) {
    
      setAccessTokenAndRefreshToken(token, refreshToken);
      return token;
    } 

    return null;
  }

  function getUser(): User | undefined {
    //console.log('user',user)
    return user;
  }

  function signout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("auth");
    localStorage.clear();
    setAccessToken("");
    setRefreshToken("");
    setUser(undefined);
    setIsAuthenticated(false);
  }

  async function checkAuth() {
    try {
      if (!!accessToken) {

        const userInfo = await retrieveUserInfo(accessToken);
        setUser(userInfo);
        setAccessToken(accessToken);
        setIsAuthenticated(true);
        setIsLoading(false);
      } else {

        const token = localStorage.getItem("token");
        if (token) {

          const refreshToken = JSON.parse(token).refreshToken;

          getNewAccessToken(refreshToken)
            .then(async (newToken) => {
              const userInfo = await retrieveUserInfo(newToken!);
              setUser(userInfo);
              setAccessToken(newToken!);
              setIsAuthenticated(true);
              setIsLoading(false);
            })
            .catch((error) => {
              console.log(error);
              setIsLoading(false);
            });
        } else {
          setIsLoading(false);
        }
      }
    } catch (error) {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        getAccessToken,
        setAccessTokenAndRefreshToken,
        getRefreshToken,
        saveUser,
        getUser,
        signout,
      }}
    >
      {isloading ? <div>Loading...</div> : children}
    </AuthContext.Provider>
  );
}

async function retrieveUserInfo(accessToken: string) {
  try {
    const response = await fetch(`${API_URL}/user`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (response.ok) {
      const json = await response.json();
      //console.log(json);
      return json.body??json;
    }
  } catch (error) {}
}

export const useAuth = () => useContext(AuthContext);