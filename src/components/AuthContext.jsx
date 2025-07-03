import React, { createContext, useState, useContext, useEffect } from 'react';

// Create the Auth Context
const AuthContext = createContext(null);

// Auth Provider component to wrap your application
export const AuthProvider = ({ children }) => {
    // State to hold user information (rollNumber, roles) and the token (if using JWT)
    // For Basic Auth, we'll store username/password or a flag indicating authentication.
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    // In a real app with Basic Auth, you might store username/password in a less secure way
    // or rely purely on the browser's Basic Auth dialog. For this example, we'll use a flag.

    // On initial load, check if user is already "authenticated" (e.g., from session storage if you implement it)
    useEffect(() => {
        // In a real Basic Auth scenario, you'd typically rely on the browser's
        // authentication dialog and subsequent successful requests.
        // For demonstration, we'll assume if user is null, they are not authenticated.
        // If you were using JWT, you'd check localStorage for a token here.
    }, []);

    // Function to handle user login
    // For Basic Auth, this function might not directly handle the HTTP request,
    // but rather update the state *after* a successful basic auth prompt.
    const login = async (rollNumber, password) => {
        try {
            // In a Basic Auth setup, the browser typically handles the initial prompt.
            // For programmatic login (e.g., if you build a custom login form),
            // you'd make a fetch request with Basic Auth headers.
            const headers = new Headers();
            headers.set('Authorization', 'Basic ' + btoa(rollNumber + ":" + password));
            headers.set('Content-Type', 'application/json');

            const response = await fetch('http://localhost:8080/api/students/login', { // This endpoint is just a placeholder, Basic Auth works on any protected endpoint
                method: 'POST', // Or POST, depending on your backend's login endpoint if it exists
                headers: headers,
                body: JSON.stringify({
                    rollNumber,
                    password
                })
            });

            console.log(response)

            if (response.ok) {
                // For Basic Auth, a successful response to any protected endpoint
                // means the credentials were accepted. We don't get a JWT back.
                // We'll need to fetch user details and roles separately.
                // This is a simplification. In a real app, you'd usually have a specific
                // login endpoint that returns user info and roles upon successful basic auth.

                // Let's assume for now that if the login request succeeds,
                // we can then fetch the user's profile to get their roles.
                // This is a workaround since Basic Auth doesn't return roles directly on login.
                const userProfileResponse = await fetch(`http://localhost:8080/api/students/${rollNumber}/profile`, {
                    headers: headers
                });

                if (userProfileResponse.ok) {
                    const profileData = await userProfileResponse.json();
                    // In a real basic auth setup, roles might be fetched from a dedicated endpoint
                    // or hardcoded on the client for simplicity if roles are fixed.
                    // For now, we'll assume a student role for student login.
                    // For admin/faculty, you'd need a way to determine their roles.
                    // This is a limitation of pure Basic Auth without a dedicated login endpoint returning roles.

                    // For now, let's assume if a student logs in, they have ROLE_STUDENT.
                    // For a more robust solution, your backend login endpoint should return roles.
                    // Since we removed JWT, the backend doesn't send roles directly on login.
                    // We'll simulate roles based on the rollNumber for now or fetch from a new endpoint.

                    // Let's add a dummy role array for now. In a real app, this would come from the backend.
                    // For the purpose of enabling protected routes, we'll just set isAuthenticated to true.
                    // A proper Basic Auth setup would have a /userinfo endpoint or similar.

                    // For this basic auth, we'll just store the username and a placeholder for roles.
                    // The actual role enforcement happens on the backend via @PreAuthorize.
                    setUser({ rollNumber: rollNumber, roles: ["ROLE_ADMIN"] }); // Default to student role for now
                    setIsAuthenticated(true);
                    console.log("Login successful for:", rollNumber);
                    return { success: true, message: "Login successful" };
                } else {
                    const errorText = await userProfileResponse.text();
                    console.error("Failed to fetch user profile after basic auth:", errorText);
                    return { success: false, message: "Authentication successful, but failed to retrieve user profile." };
                }

            } else {
                const errorText = await response.text();
                console.error("Login failed:", errorText);
                return { success: false, message: "Authentication failed: Invalid credentials." };
            }
        } catch (error) {
            console.error("Network error during login:", error);
            return { success: false, message: "Network error during login." };
        }
    };

    // Function to handle user logout
    const logout = () => {
        setUser(null);
        setIsAuthenticated(false);
        // For Basic Auth, you might clear stored credentials or simply redirect.
        // The browser usually caches basic auth credentials, so a full logout might require more.
        console.log("Logged out.");
    };

    // Helper to get authorization headers for authenticated requests
    const getAuthHeaders = (username, password) => {
        if (username && password) {
            return {
                'Authorization': 'Basic ' + btoa(username + ":" + password),
                'Content-Type': 'application/json'
            };
        }
        return { 'Content-Type': 'application/json' }; // Default for unauthenticated
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, login, logout, getAuthHeaders }}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook to use the AuthContext
export const useAuth = () => {
    return useContext(AuthContext);
};
