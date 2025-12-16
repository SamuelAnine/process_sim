'use client'

import React from "react"
import { useSession } from "next-auth/react";

const page = () => {
    const { data: session } = useSession();

    return (
        <React.Fragment>
            <main className="admin">
                <img src={session?.user.image} alt="User profile image" referrerPolicy="no-referrer" />
                <div>Welcome {session?.user.name}</div>
            </main>
        </React.Fragment>
    )
}

export default page