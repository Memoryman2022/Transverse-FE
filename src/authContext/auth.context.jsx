import React, { useState, useEffect } from "react";
import axios from "axios";

const API_URL = "https://transverse-backend.adaptable.app";

const AuthContext = React.createContext();

function AuthProviderWrapper(props) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [authError, setAuthError] = useState(null);

  const registerUser = (userName, email, password) => {
    axios
      .post(`${API_URL}/auth/registration`, { userName, email, password })
      .then((response) => {
        loginUser(email, password);
      })
      .catch((error) => {
        console.error("Registration failed", error.response.data);
        setAuthError(error.response.data.message);
      });
  };

  const loginUser = (email, password) => {
    setAuthError(null);
    axios
      .post(`${API_URL}/auth/login`, { email, password })
      .then((response) => {
        const token = response.data.token; // Assuming the response contains the token
        storeToken(token);
        authenticateUser(); // Now that the token is stored, authenticate the user
      })
      .catch((error) => {
        console.error("Login error:", error.response.data.message);
        // Handle login error
      });
  };

  const storeToken = (token) => {
    localStorage.setItem("token", token);
  };

  const authenticateUser = () => {
    // Get the stored token from the localStorage
    const storedToken = localStorage.getItem("token");

    // If the token exists in the localStorage
    if (storedToken) {
      // We must send the JWT token in the request's "Authorization" Headers
      axios
        .get(`${API_URL}/auth/verify`, {
          headers: { Authorization: `Bearer ${storedToken}` },
        })
        .then((response) => {
          // If the server verifies that JWT token is valid
          const user = response.data;
          // Update state variables
          setIsLoggedIn(true);
          setIsLoading(false);
          setUser(user);
        })
        .catch((error) => {
          if (error) {
            setAuthError(error.response.data.message);
            return;
          }
          // If the server sends an error response (invalid token)
          // Update state variables
          setIsLoggedIn(false);
          setIsLoading(false);
          setUser(null);
        });
    } else {
      // If the token is not available
      setIsLoggedIn(false);
      setIsLoading(false);
      setUser(null);
    }
  };

  const removeToken = () => {
    // Upon logout, remove the token from the localStorage
    localStorage.removeItem("token");
  };

  const logOutUser = () => {
    removeToken();
    authenticateUser();
  };

  useEffect(() => {
    // Run the function after the initial render,
    // after the components in the App render for the first time.
    authenticateUser();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        isLoading,
        user,
        storeToken,
        authenticateUser,
        logOutUser,
        loginUser,
        registerUser,
        authError,
      }}
    >
      {props.children}
    </AuthContext.Provider>
  );
}

export { AuthProviderWrapper, AuthContext };