'use client'
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { signIn } from "next-auth/react"
import slugify from "slugify"

export default function page() {
    // toggle between sign-up and sign-in
    const [isSignUp, setIsSignUp] = useState(true)

    // Sign-up inputs 
    const [nameSignUp, setNameSignUp] = useState("")
    const [emailSignUp, setEmailSignUp] = useState("")
    const [passwordSignUp, setPasswordSignUp] = useState("")

    // Sign-in inputs
    const [emailSignIn, setEmailSignIn] = useState("")
    const [passwordSignIn, setPasswordSignIn] = useState("")

    // Password visibility toggles
    const [showPasswordSignIn, setShowPasswordSignIn] = useState(false)
    const [showPasswordSignUp, setShowPasswordSignUp] = useState(false)

    // notification: {message, type} or null
    const [notification, setNotification] = useState(null)

    const [details, setDetails] = useState({
        name: '',
        email: '',
        password: ''
    })

    const router = useRouter()

    // auto hide notification
    useEffect(() => {
        if (!notification) return
        const t = setTimeout(() => setNotification(null), 4000)
        return () => clearTimeout(t)
    }, [notification])

    const handleInput = (field) => e => {
        console.log(details, field)
        if (field === 'name') {
            setDetails({ ...details, name: e.target.value })
        }
        else if (field === 'email') {
            setDetails({ ...details, email: e.target.value })
        }
        else if (field === 'password') {
            setDetails({ ...details, password: e.target.value })
        }
    }

    // to show visible notification
    const showNotification = (message, type = "success") => {
        setNotification({ message, type })
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

    const logon = async (e) => {
        e.preventDefault()

        console.log(emailSignIn, passwordSignIn)

        try {
            const Login = await signIn('credentials', {
                redirect: false,
                email: emailSignIn,
                password: passwordSignIn
            })

            console.log("Login response:", Login)

            if (Login?.ok && !Login?.error) {
                showNotification('Login successful!', 'success')
                setTimeout(() => {
                    router.push('/simulator')
                }, 1000)
            }
            else {
                showNotification('Email or Password incorrect', 'error')
            }

        } catch (error) {
            console.log(error)
            showNotification('An error occurred during login', 'error')
        }
    }

    const signup = async (e) => {
        e.preventDefault()
        console.log("userdata", details)

        try {
            const createAccount = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: details.name,
                    email: details.email,
                    password: details.password,
                    username: slugify(details.name)
                })
            })

            const response = await createAccount.json()
            console.log("This is response", response)

            if (createAccount.ok) {
                showNotification(response.message || 'Account created successfully!', 'success')
                
                // Automatically sign in the user after successful signup
                setTimeout(async () => {
                    const autoLogin = await signIn('credentials', {
                        redirect: false,
                        email: details.email,
                        password: details.password
                    })

                    if (autoLogin?.ok && !autoLogin?.error) {
                        showNotification('Logging you in...', 'success')
                        setTimeout(() => {
                            router.push('/simulator')
                        }, 1000)
                    } else {
                        showNotification('Account created! Please sign in', 'success')
                        setIsSignUp(false)
                    }
                }, 1000)
            }
            else {
                showNotification(response.message || 'Signup failed', 'error')
            }
        } catch (error) {
            console.log(error)
            showNotification('An error occurred during signup', 'error')
        }
    }

    return (
        <div className="auth-body">
            <div className={`container ${isSignUp ? "right-panel-active" : ""}`} style={{ position: "relative" }}>
                {/* Visible notification at top-center of the card */}
                {notification && (
                    <div
                        style={{
                            ...notiBase,
                            backgroundColor: notification.type === "success" ? "#d4edda" : "#f8d7da",
                            color: notification.type === "success" ? "#155724" : "#721c24",
                            border: `1px solid ${notification.type === "success" ? "#c3e6cb" : "#f5c6cb"}`
                        }}
                    >
                        {notification.message}
                    </div>
                )}

                <div className="form-container sign-in-container">
                    <form onSubmit={logon}>
                        <h2>Sign In</h2>
                        <input type="email" placeholder="Email" value={emailSignIn} onChange={(e) => setEmailSignIn(e.target.value)} required />
                        <div style={{ position: 'relative', width: '100%' }}>
                            <input 
                                type={showPasswordSignIn ? "text" : "password"} 
                                placeholder="Password" 
                                value={passwordSignIn} 
                                onChange={(e) => setPasswordSignIn(e.target.value)} 
                                required 
                                style={{ paddingRight: '40px' }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPasswordSignIn(!showPasswordSignIn)}
                                style={{
                                    position: 'absolute',
                                    right: '10px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    padding: '5px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                {showPasswordSignIn ? (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                        <circle cx="12" cy="12" r="3"></circle>
                                    </svg>
                                ) : (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                        <line x1="1" y1="1" x2="23" y2="23"></line>
                                    </svg>
                                )}
                            </button>
                        </div>
                        <input type="submit" value="Sign In" />
                    </form>
                </div>

                <div className="form-container sign-up-container">
                    <form onSubmit={signup}>
                        <h2>Create Account</h2>
                        <input type="text" placeholder="Name" onChange={handleInput('name')} required />
                        <input type="email" placeholder="Email" onChange={e => setDetails({ ...details, email: e.target.value })} required />
                        <div style={{ position: 'relative', width: '100%' }}>
                            <input 
                                type={showPasswordSignUp ? "text" : "password"} 
                                placeholder="Password" 
                                onChange={e => setDetails({ ...details, password: e.target.value })} 
                                required 
                                style={{ paddingRight: '40px' }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPasswordSignUp(!showPasswordSignUp)}
                                style={{
                                    position: 'absolute',
                                    right: '10px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    padding: '5px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                {showPasswordSignUp ? (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                        <circle cx="12" cy="12" r="3"></circle>
                                    </svg>
                                ) : (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                        <line x1="1" y1="1" x2="23" y2="23"></line>
                                    </svg>
                                )}
                            </button>
                        </div>
                        <input type="submit" value="Sign Up" />
                    </form>
                </div>

                <div className="overlay-container">
                    <div className="overlay">
                        <div className="overlay-panel overlay-left">
                            <h2>Welcome Back!</h2>
                            <p>To keep connected, please login with your info</p>
                            <button className="ghost" type="button" onClick={() => setIsSignUp(false)}>Sign In</button>
                        </div>
                        <div className="overlay-panel overlay-right">
                            <h2>Hello, Friend!</h2>
                            <p>Register your details to get started</p>
                            <button className="ghost" type="button" onClick={() => setIsSignUp(true)}>Sign Up</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}