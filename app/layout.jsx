import React from "react"
import "@/styles/globals.css"
import Header from "@/components/Layout/Header"
import Provider from "@/Session/Provider"
import { SpeedInsights } from "@vercel/speed-insights/next"

const layout = ({ children }) => {
    return (
        <html lang="en">
            <body>
                <Header />
                <Provider>
                    {children}
                </Provider>
                <SpeedInsights />
            </body>
        </html>
    )
}

export default layout