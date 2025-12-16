import React from "react";

const Header = () => {
    return (
        <React.Fragment>
            <div className="home">
                <header>
                    <a href="/" className="logo">Home</a>
                    <nav>
                        <a href="#">Features</a>
                        <a href="#">Solutions</a>
                        <a href="#">Templates</a>
                        <a href="#">Resources</a>
                        <a href="#">Pricing</a>
                    </nav>
                    <div class="buttons">
                        <a href="#" class="btn btn-outline">Contact sales</a>
                        <a href="/signup" class="btn btn-outline">Log in</a>
                        <a href="#" class="btn btn=dark">Start trial</a>
                    </div>
                </header>
            </div>
        </React.Fragment>
    )
}

export default Header