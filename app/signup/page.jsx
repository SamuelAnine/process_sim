'use client'
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { signIn } from "next-auth/react"
import slugify from "slugify"

export default function page() {
  const [isSignUp, setIsSignUp] = useState(true)
  const [emailSignIn, setEmailSignIn] = useState("")
  const [passwordSignIn, setPasswordSignIn] = useState("")
  const [showPasswordSignIn, setShowPasswordSignIn] = useState(false)
  const [showPasswordSignUp, setShowPasswordSignUp] = useState(false)
  const [notification, setNotification] = useState(null)
  const [details, setDetails] = useState({ name: '', email: '', password: '' })
  const router = useRouter()

  useEffect(() => {
    if (!notification) return
    const t = setTimeout(() => setNotification(null), 4000)
    return () => clearTimeout(t)
  }, [notification])

  const handleInput = (field) => e => {
    if (field === 'name') setDetails({ ...details, name: e.target.value })
    else if (field === 'email') setDetails({ ...details, email: e.target.value })
    else if (field === 'password') setDetails({ ...details, password: e.target.value })
  }

  const showNotification = (message, type = "success") => {
    setNotification({ message, type })
  }

  const logon = async (e) => {
    e.preventDefault()
    try {
      const Login = await signIn('credentials', {
        redirect: false,
        email: emailSignIn,
        password: passwordSignIn
      })
      if (Login?.ok && !Login?.error) {
        showNotification('Login successful!', 'success')
        setTimeout(() => { router.push('/dashboard') }, 1000)
      } else {
        showNotification('Email or Password incorrect', 'error')
      }
    } catch (error) {
      showNotification('An error occurred during login', 'error')
    }
  }

  const signup = async (e) => {
    e.preventDefault()
    try {
      const createAccount = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: details.name,
          email: details.email,
          password: details.password,
          username: slugify(details.name)
        })
      })
      const response = await createAccount.json()
      if (createAccount.ok) {
        showNotification(response.message || 'Account created successfully!', 'success')
        setTimeout(async () => {
          const autoLogin = await signIn('credentials', {
            redirect: false,
            email: details.email,
            password: details.password
          })
          if (autoLogin?.ok && !autoLogin?.error) {
            showNotification('Logging you in...', 'success')
            setTimeout(() => { router.push('/dashboard') }, 1000)
          } else {
            showNotification('Account created! Please sign in', 'success')
            setIsSignUp(false)
          }
        }, 1000)
      } else {
        showNotification(response.message || 'Signup failed', 'error')
      }
    } catch (error) {
      showNotification('An error occurred during signup', 'error')
    }
  }

  return (
    <div className="bs-auth-body">

      {notification && (
        <div className={`bs-auth-notif ${notification.type === 'success' ? 'bs-auth-notif-success' : 'bs-auth-notif-error'}`}>
          {notification.message}
        </div>
      )}

      <div className={`bs-auth-card ${isSignUp ? 'bs-panel-active' : ''}`}>

        {/* Sign In */}
        <div className="bs-auth-form bs-signin-form">
          <form onSubmit={logon}>
            <div className="bs-auth-form-inner">
              <div className="bs-auth-mark">BioSim</div>
              <h2 className="bs-auth-title">Sign In</h2>
              <p className="bs-auth-sub">Welcome back. Enter your details below.</p>

              <input
                className="bs-auth-input"
                type="email"
                placeholder="Email address"
                value={emailSignIn}
                onChange={(e) => setEmailSignIn(e.target.value)}
                required
              />

              <div className="bs-auth-input-wrap">
                <input
                  className="bs-auth-input"
                  type={showPasswordSignIn ? "text" : "password"}
                  placeholder="Password"
                  value={passwordSignIn}
                  onChange={(e) => setPasswordSignIn(e.target.value)}
                  required
                />
                <button type="button" className="bs-auth-eye" onClick={() => setShowPasswordSignIn(!showPasswordSignIn)}>
                  {showPasswordSignIn ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  )}
                </button>
              </div>

              <button type="submit" className="bs-auth-btn">Sign In</button>
              <p className="bs-auth-switch">
                No account yet?{' '}
                <button type="button" className="bs-auth-switch-link" onClick={() => setIsSignUp(true)}>
                  Create one free
                </button>
              </p>
            </div>
          </form>
        </div>

        {/* Sign Up */}
        <div className="bs-auth-form bs-signup-form">
          <form onSubmit={signup}>
            <div className="bs-auth-form-inner">
              <div className="bs-auth-mark">BioSim</div>
              <h2 className="bs-auth-title">Create Account</h2>

              <input
                className="bs-auth-input"
                type="text"
                placeholder="Full name"
                onChange={handleInput('name')}
                required
              />
              <input
                className="bs-auth-input"
                type="email"
                placeholder="Email address"
                onChange={e => setDetails({ ...details, email: e.target.value })}
                required
              />
              <div className="bs-auth-input-wrap">
                <input
                  className="bs-auth-input"
                  type={showPasswordSignUp ? "text" : "password"}
                  placeholder="Password"
                  onChange={e => setDetails({ ...details, password: e.target.value })}
                  required
                />
                <button type="button" className="bs-auth-eye" onClick={() => setShowPasswordSignUp(!showPasswordSignUp)}>
                  {showPasswordSignUp ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  )}
                </button>
              </div>

              <button type="submit" className="bs-auth-btn">Create Account</button>
              <p className="bs-auth-switch">
                Already have an account?{' '}
                <button type="button" className="bs-auth-switch-link" onClick={() => setIsSignUp(false)}>
                  Sign in
                </button>
              </p>
            </div>
          </form>
        </div>

        {/* Overlay */}
        <div className="bs-auth-overlay-wrap">
          <div className="bs-auth-overlay">
            <div className="bs-auth-overlay-panel">
              <div className="bs-overlay-logo">Bio<span>Sim</span></div>
              <div className="bs-overlay-badge">Already a member</div>
              <h2>Welcome back!</h2>
              <p>Already have an account? Sign in and continue.</p>
              <button type="button" className="bs-overlay-btn" onClick={() => setIsSignUp(false)}>Sign In</button>
            </div>
            <div className="bs-auth-overlay-panel">
              <div className="bs-overlay-logo">Bio<span>Sim</span></div>
              <div className="bs-overlay-badge">Free to join</div>
              <h2>New to BioSim?</h2>
              <p>Create a free account and run your first biogas simulation in minutes.</p>
              <button type="button" className="bs-overlay-btn" onClick={() => setIsSignUp(true)}>Get Started</button>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}