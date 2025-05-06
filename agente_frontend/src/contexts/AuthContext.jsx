import { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const verificarToken = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setLoading(false);
        return;
      }
      
      try {
        const res = await fetch("http://localhost:8000/verify", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (res.ok) {
          const data = await res.json();
          setUser({
            username: data.username,
            token
          });
        } else {
          // Token inválido
          localStorage.removeItem('token');
        }
      } catch (error) {
        console.error("Erro ao verificar token:", error);
      } finally {
        setLoading(false);
      }
    };
    
    verificarToken();
  }, []);
  
  const login = async (username, password) => {
    try {
      const res = await fetch("http://localhost:8000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      
      if (!res.ok) {
        throw new Error("Credenciais inválidas");
      }
      
      const data = await res.json();
      localStorage.setItem("token", data.access_token);
      
      // Verificar token
      const verifyRes = await fetch("http://localhost:8000/verify", {
        headers: {
          Authorization: `Bearer ${data.access_token}`,
        },
      });
      
      if (verifyRes.ok) {
        const userData = await verifyRes.json();
        setUser({
          username: userData.username,
          token: data.access_token
        });
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      throw error;
    }
  };
  
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };
  
  const value = {
    user,
    loading,
    login,
    logout
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}