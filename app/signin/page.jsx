import React from "react";

const page = () => {
    return (
        <React.Fragment>
            <main className="signin">
            <div className="container" id="container">
        
        <div className="form-container sign-in-container">
            <form>
                <h2>Sign In</h2>
                <input type="email" placeholder="Email" required/>
                <input type="password" placeholder="Password" required/>
                <button>Sign In</button>
            </form>
        </div>

        <div className="form-container sign-up-container">
            <form>
                <h2>Create Account</h2>
                <input type="text" placeholder="Name" required/>
                <input type="email" placeholder="Email" required/>
                <input type="password" placeholder="Password" required/>
                <button>Sign Up</button>
            </form>
        </div>

        <div className="overlay-container">
            <div className="overlay">
                <div className="overlay-panel overlay-left">
                    <h2>Welcome Back!</h2>
                    <p>To keep connected, please login with your info</p>
                    <button className="ghost" id="signInBtn">Sign In</button>
                </div>
                <div className="overlay-panel overlay-right">
                    <h2>Hello, Friend!</h2>
                    <p>Register your details to get started</p>
                    <button className="ghost" id="signUpBtn">Sign Up</button>
                </div>
            </div>
        </div>
    </div>
    </main>
    <script src="script.js"></script>
        </React.Fragment>
    )
}

export default page