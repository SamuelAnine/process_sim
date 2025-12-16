import React from "react"

const page = () => {
    return (
        <React.Fragment>
            <main className="home-layout">

            <section class="hero">
                <h1>The platform service<br />businesses are built on</h1>
                <p>
                    Copilot empowers professional service businesses with tools to onboard clients,
                    deliver services, and get paid - all with a modern client portal that elevates
                    the client experience.
                </p>
            </section>

            <section class="ratings">
                <div>#### <span>G2</span></div>
                <div>#### <span>Capterra</span></div>
                <div>#### <span>ProductHunt</span></div>
            </section>

            <div class="cta">
                <a href="#" class="btn btn-green">Try for free</a>
            </div>
            </main>
        </React.Fragment>
    )
}

export default page