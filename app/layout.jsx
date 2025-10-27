import React from "react"
import "@/styles/globals.css"
import Header from "@/components/Layout/Header"
import Provider from "@/Session/Provider"

const layout = ({children}) => {
    return (
        <React.Fragment>
            <html lang="en">
                <body>
                    <Header />
                    <Provider>
                        {children}
                    </Provider>
                </body>
            </html>
        </React.Fragment>
    )
}

export default layout