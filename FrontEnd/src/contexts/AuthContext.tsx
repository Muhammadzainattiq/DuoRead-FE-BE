import { createContext, useContext, useState, useEffect, ReactNode, useRef } from "react";
import axios from "axios";
import { toast } from "sonner";

const API_BASE = "https://zainattiq-duoread.hf.space";

interface User {
  id: string;
  name: string;
  email: string;
  native_language: string;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string, nativeLanguage: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (name?: string, nativeLanguage?: string) => Promise<boolean>;
  refreshAccessToken: () => Promise<boolean>;
  hasCompletedOnboarding: () => boolean;
  markOnboardingComplete: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const isRefreshing = useRef(false);
  const failedQueue = useRef<Array<{ resolve: (value: any) => void; reject: (error: any) => void }>>([]);

  // Refresh access token function
  const refreshAccessToken = async (): Promise<boolean> => {
    if (!refreshToken) {
      logout();
      return false;
    }

    try {
      const response = await axios.post(`${API_BASE}/auth/refresh`, {
        refresh_token: refreshToken
      });

      const { access_token, refresh_token: newRefreshToken, user: userData } = response.data;
      
      setToken(access_token);
      setRefreshToken(newRefreshToken);
      setUser(userData);
      
      localStorage.setItem("access_token", access_token);
      localStorage.setItem("refresh_token", newRefreshToken);
      localStorage.setItem("user", JSON.stringify(userData));
      
      return true;
    } catch (error) {
      console.error("Token refresh failed:", error);
      logout();
      return false;
    }
  };

  // Process failed queue after token refresh
  const processQueue = (error: any, token: string | null = null) => {
    failedQueue.current.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(token);
      }
    });
    
    failedQueue.current = [];
  };

  useEffect(() => {
    // Load auth data from localStorage on mount
    const storedToken = localStorage.getItem("access_token");
    const storedRefreshToken = localStorage.getItem("refresh_token");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      setToken(storedToken);
      setRefreshToken(storedRefreshToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Setup axios interceptors
  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          if (isRefreshing.current) {
            // If already refreshing, queue the request
            return new Promise((resolve, reject) => {
              failedQueue.current.push({ resolve, reject });
            }).then((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return axios(originalRequest);
            }).catch((err) => {
              return Promise.reject(err);
            });
          }

          originalRequest._retry = true;
          isRefreshing.current = true;

          try {
            const success = await refreshAccessToken();
            if (success) {
              const newToken = localStorage.getItem("access_token");
              processQueue(null, newToken);
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return axios(originalRequest);
            } else {
              processQueue(error, null);
              return Promise.reject(error);
            }
          } catch (refreshError) {
            processQueue(refreshError, null);
            return Promise.reject(refreshError);
          } finally {
            isRefreshing.current = false;
          }
        }

        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, [token, refreshToken]);

  const hasCompletedOnboarding = (): boolean => {
    return localStorage.getItem("onboarding_completed") === "true";
  };

  const markOnboardingComplete = (): void => {
    localStorage.setItem("onboarding_completed", "true");
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await axios.post(`${API_BASE}/auth/login`, {
        email,
        password
      });

      const { access_token, refresh_token, user: userData } = response.data;
      
      setToken(access_token);
      setRefreshToken(refresh_token);
      setUser(userData);
      
      localStorage.setItem("access_token", access_token);
      localStorage.setItem("refresh_token", refresh_token);
      localStorage.setItem("user", JSON.stringify(userData));
      
      toast.success("Welcome back!");
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Login failed");
      return false;
    }
  };

  const signup = async (
    name: string,
    email: string,
    password: string,
    nativeLanguage: string
  ): Promise<boolean> => {
    try {
      const response = await axios.post(`${API_BASE}/auth/signup`, {
        name,
        email,
        password,
        native_language: nativeLanguage
      });

      const { access_token, refresh_token, user: userData } = response.data;
      
      setToken(access_token);
      setRefreshToken(refresh_token);
      setUser(userData);
      
      localStorage.setItem("access_token", access_token);
      localStorage.setItem("refresh_token", refresh_token);
      localStorage.setItem("user", JSON.stringify(userData));
      
      // New users should see the onboarding tour
      localStorage.removeItem("onboarding_completed");
      
      toast.success("Account created successfully!");
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Signup failed");
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setRefreshToken(null);
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    
    // Clear failed queue
    failedQueue.current = [];
    isRefreshing.current = false;
    
    toast.success("Logged out successfully");
  };

  const updateProfile = async (name?: string, nativeLanguage?: string): Promise<boolean> => {
    if (!token) return false;

    try {
      const response = await axios.put(
        `${API_BASE}/auth/profile`,
        {
          ...(name && { name }),
          ...(nativeLanguage && { native_language: nativeLanguage })
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const updatedUser = response.data.user;
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      
      toast.success("Profile updated successfully!");
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Update failed");
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        refreshToken,
        loading,
        login,
        signup,
        logout,
        updateProfile,
        refreshAccessToken,
        hasCompletedOnboarding,
        markOnboardingComplete
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
