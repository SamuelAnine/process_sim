import React from "react"
import "@/styles/globals.css"
import Header from "@/components/Layout/Header"

const layout = ({children}) => {
    return (
        <React.Fragment>
            <html lang="en">
                <body>
                    <Header />
                    {children}
                </body>
            </html>
        </React.Fragment>
    )
}

export default layout