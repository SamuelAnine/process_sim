'use client'

import React, {useState} from "react"
import { signIn } from 'next-auth/react'
import { useSession } from "next-auth/react"

const Signin = () => {
    const [userinfo, setUserInfo] = useState({ email: '', password: '' })
    const [loading, setLoading] = useState(false)

    const { data: session } = useSession();
    const userrole = session;
    console.log(userrole)

    const logon = async (e) => {
        e.preventDefault()
        setLoading(true)

        const { email, password } = userinfo

        try {
            const Login = await signIn('credentials', {
                redirect: false,
                email: email,
                password: password
            })

            if (Login.error === null) {
                alert('Login successful')
                routerServerGlobal.push('/v2-permission-required')
            }
            else {
                alert('Email or Password incorrect')
                setLoading(false)
            }

        } catch (error) {
            console.log(error)
        }
    }

    return (
        <React.Fragment>
            <button onClick={() => signIn('google')}>
                Sign in Google
            </button>
        </React.Fragment>
    )
}

export default Signin