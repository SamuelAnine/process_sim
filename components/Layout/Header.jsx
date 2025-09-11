import React from "react";

const Header = () => {
    return (
        <React.Fragment>
            <header>
                <div class="logo">Copilot</div>
                <nav>
                    <a href="#">Features</a>
                    <a href="#">Solutions</a>
                    <a href="#">Templates</a>
                    <a href="#">Resources</a>
                    <a href="#">Pricing</a>
                </nav>
                <div class="buttons">
                    <a href="#" class="btn btn-outline">Contact sales</a>
                    <a href="/signin" class="btn btn-outline">Log in</a>
                    <a href="#" class="btn btn=dark">Start trial</a>
                </div>
            </header>
        </React.Fragment>
    )
}

export default Header