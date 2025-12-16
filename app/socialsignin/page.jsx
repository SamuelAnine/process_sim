'use client'

import React, {useState} from "react"
import { signIn } from 'next-auth/react'
import { useSession } from "next-auth/react"

const Signin = () => {
    const [userinfo, setUserInfo] = useState({ email: '', password: '' })
    const [loading, setLoading] = useState(false)

    const { data: session } = useSession();
    const userrole = session;
    console.log("This is session", session, userrole?.user?.name)

    const logon = async (e) => {
        e.preventDefault()
        setLoading(true)

        console.log(userinfo)

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
            <button onClick={() => Signin('twitter')}>
                Sign in Twitter
            </button>
            <form onSubmit={logon}>
                <input type="email" name="" id="" onChange={e => setUserInfo({...userinfo, email: e.target.value})} required placeholder="Enter email" />
                <input type="password" name="" id="" onChange={e => setUserInfo({...userinfo, password: e.target.value})} required placeholder="Enter password" />
                <input type="submit" value="Signin" />
            </form>
        </React.Fragment>
    )
}

export default Signin