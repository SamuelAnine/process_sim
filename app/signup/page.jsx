'use client'
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
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

    // notification: {message, type} or null
    const [notification, setNotification] = useState(null)

    const [details, setDetails] = useState({
        name: '',
        email: '',
        password: ''
    })

    const router = useRouter()
    // This handleInput is one way of hanndling input.
    // Another way is coded in the onchange function for email and password


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
    
                if (Login.error === null) {
                    alert('Login successful')
                    router.push('/simulator')
                }
                else {
                    alert('Email or Password incorrect')
                    setLoading(false)
                }
    
            } catch (error) {
                console.log(error)
            }
        }

    const signup = async (e) => {
        e.preventDefault()
        console.log("userdata", details)

        try {
            const createAccount = await fetch('/api/auth/signup', {
                method: 'POST',
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
                alert(response.message)
                router.push('/simulator')
            }
            else {
                alert(response.message)
            }
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <div className="auth-body">
            <div className={`container ${isSignUp ? "right-panel-active" : ""}`} style={{ position: "relative"}}>
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
                    <form onSubmit={logon}>
                        <h2>Sign In</h2>
                        <input type="email" placeholder="Email" value={emailSignIn} onChange={(e) => setEmailSignIn(e.target.value)} required />
                        <input type="password" placeholder="Password" value={passwordSignIn} onChange={(e) => setPasswordSignIn(e.target.value)} required />
                        <input type="submit" value="Sign In" />
                    </form>
                </div>

                <div className="form-container sign-up-container">
                    <form onSubmit={signup}>
                        <h2>Create Account</h2>
                        <input type="text" placeholder="Name" onChange={handleInput('name')} required />
                        <input type="email" placeholder="Email" onChange={e => setDetails({ ...details, email: e.target.value })} required />
                        <input type="password" placeholder="Password" onChange={e => setDetails({ ...details, password: e.target.value })} required />
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
        </div>
    )
}



