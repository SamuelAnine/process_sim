'use client'
import { useState, useEffect } from "react"

export default function Page() {
    //  toggle between sign-up and sign-in
    const [isSignUp, setIsSignUp] = useState(true)

    //  Sign-up inputs
    const [nameSignUp, setNameSignUp] = useState("")
    const [emailSignUp, setEmailSignUp] = useState("")
    const [passwordSignUp, setPasswordSignUp] = useState("")

    // Sign-in inputs
    const [emailSignIn, setEmailSignIn] = useState("")
    const [passwordSignIn, setPasswordSignIn] = useState("")

    // notification: {message, type} or null
    const [notification, setNotification] = useState(null)

    // auto hide notification
    useEffect(() => {
        if (!notification) return
        const t = setTimeout(() => setNotification(null), 4000)
        return () => clearTimeout(t)
    }, [notification])

    // to show visible notification
    const showNotification = (message, type = "success") => {
        setNotification({ message, type })
    }

    // SIGN UP: save user to localStorage and switch to sign-in
    const handleSignUp = (e) => {
        e.preventDefault()

        // (normalize email to lower-case)
        const user = {
            name: nameSignUp.trim(),
            email: emailSignUp.trim().toLowerCase(),
            password: passwordSignUp,
        }
        // save to localStorage store under JSON string
        localStorage.setItem("user", JSON.stringify(user))

        // Show visible success, switch to Sign In
        showNotification("Account created successfully! Now Sign in.", "success")
        setNameSignUp("")
        setEmailSignUp("")
        setPasswordSignUp("")
        setIsSignUp(false) // go back to sign-in view
    }

    // SIGN IN: check localStorage stored user
    const handleSignIn = (e) => {
        e.preventDefault()

        const storedRaw = localStorage.getItem("user")
        if (!storedRaw) {
            showNotification("No account found. Please sign up first", "error")
            return
        }

        let storedUser
        try {
            storedUser = JSON.parse(storedRaw)
        } catch {
            showNotification("stored user is corrupted. Please sign up again.", "error")
            return
        }

        // normalized email for comparison
        const emailNormalized = emailSignIn.trim().toLowerCase()

        if (storedUser.email === emailNormalized && storedUser.password === passwordSignIn) {
            showNotification(`Login successful! Wwlcome back, ${storedUser.name}`, "success")
            // clear sign-in inputs on success
            setEmailSignIn("")
            setPasswordSignIn("")
        } else {
            showNotification("Invalid email or password", "error")
            // keep email so user can correct password
            setPasswordSignIn("")
        }
    }

    // style for notification
    const notiBase = {
        position: "absolute",
        top: 14,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 999,
        padding: "10px 16px",
        borderRadius: 8,
        minWidth: 320,
        textAlign: "center",
        fontWeight: 700,
        boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
    }

    return (
        <div className={`container ${isSignUp ? "right-panel-active" : ""}`} style={{ position: "relative" }}>
            {/* Visible notification at top-center of the card */}
            {notification && (
                <div
                    style={{
                        ...notiBase,
                        backgroundColor: notification.type === "success" ? "#d4edda" : "#f8d7da",
                        color: notification.type === "success" ? "#155724" : "#721c24",
                        border: `1px solid ${notification.type === "success" ? "#c3e6b" : "#f5c6cb"}`
                    }}
                >
                    {notification.message}
                </div>
            )}

            <div className="form-container sign-in-container">
                <form onSubmit={handleSignIn}>
                    <h2>Sign In</h2>
                    <input type="email" placeholder="Email" value={emailSignIn} onChange={(e) => setEmailSignIn(e.target.value)} required />
                    <input type="password" placeholder="Password" value={passwordSignIn} onChange={(e) => setPasswordSignIn(e.target.value)} required />
                    <input type="submit" value="Sign In" />
                </form>
            </div>

            <div className="form-container sign-up-container">
                <form onSubmit={handleSignUp}>
                    <h2>Create Account</h2>
                    <input type="text" placeholder="Name" value={nameSignUp} onChange={(e) => setNameSignUp(e.target.value)} required />
                    <input type="email" placeholder="Email" value={emailSignUp} onChange={(e) => setEmailSignUp(e.target.value)} required />
                    <input type="password" placeholder="Password" value={passwordSignUp} onChange={(e) => setPasswordSignUp(e.target.value)} required />
                    <input type="submit" value="Sign Up" />
                </form>
            </div>

            <div className="overlay-container">
                <div className="overlay">
                    <div className="overlay-panel overlay-left">
                        <h2>Welcome Back!</h2>
                        <p>To keep connected, please login with your info</p>
                        <button className="ghost" onClick={() => setIsSignUp(false)}>Sign In</button>
                    </div>
                    <div className="overlay-panel overlay-right">
                        <h2>Hello, Friend!</h2>
                        <p>Register your details to get started</p>
                        <button className="ghost" onClick={() => setIsSignUp(true)}>Sign Up</button>
                    </div>
                </div>
            </div>
        </div>
    )
}
