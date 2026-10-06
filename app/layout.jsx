import React from "react"
import "@/styles/globals.css"
import Header from "@/components/Layout/Header"
import Provider from "@/Session/Provider"
import { SpeedInsights } from "@vercel/speed-insights/next"

const Layout = ({ children }) => {
    return (
        <html lang="en">
            <body>
                <Provider>
                    <Header />
                    {children}
                </Provider>
                <SpeedInsights />
            </body>
        </html>
    )
}

export default Layout