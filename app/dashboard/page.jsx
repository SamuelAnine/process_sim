'use client'

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function DashboardPage() {
    const { data: session, status } = useSession()
    const router = useRouter()

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/signup')
        }
    }, [status, router])

    if (status === 'loading') {
        return (
            <div className="db-loading">
                <div className="db-loading-spinner"></div>
            </div>
        )
    }

    const getGreeting = () => {
        const hour = new Date().getHours()
        if (hour < 12) return 'Good morning'
        if (hour < 17) return 'Good afternoon'
        return 'Good evening'
    }

    const firstName = session?.user?.name?.split(' ')[0] || 'there'

    return (
        <main className="db-page">
            <div className="db-bg-grid"></div>
            <div className="db-inner">

                {/* Greeting */}
                <div className="db-greeting">
                    <div className="db-badge">Dashboard</div>
                    <h1>{getGreeting()}, <span className="db-accent">{firstName}</span></h1>
                    <p>Choose how you want to continue. Your data is saved to your account.</p>
                </div>

                {/* Cards */}
                <div className="db-cards">

                    {/* Simple Mode */}
                    <div className="db-card" onClick={() => router.push('/simple')}>
                        <div className="db-card-top db-top-simple">
                            <div className="db-tag">Quick Estimate</div>
                            <div className="db-ghost">Fast</div>
                            <div className="db-card-title-wrap">
                                <div className="db-card-title">Simple Mode</div>
                                <div className="db-fact">
                                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                    Under 2 minutes
                                </div>
                            </div>
                        </div>
                        <div className="db-card-body">
                            <div className="db-card-who">Farmers, households and traders</div>
                            <p className="db-card-desc">Tell us your waste type and quantity and get your biogas yield and cost savings instantly.</p>
                            <button className="db-btn db-btn-outline-green" onClick={(e) => { e.stopPropagation(); router.push('/simple') }}>
                                Get Started
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                            </button>
                        </div>
                    </div>

                    {/* Engineering Workspace */}
                    <div className="db-card db-card-feat" onClick={() => router.push('/simulator')}>
                        <div className="db-card-top db-top-eng">
                            <div className="db-tag">Full PFD Designer</div>
                            <div className="db-ghost">Pro</div>
                            <div className="db-card-title-wrap">
                                <div className="db-card-title">Engineering Workspace</div>
                                <div className="db-fact">
                                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                    Drag and drop PFD
                                </div>
                            </div>
                        </div>
                        <div className="db-card-body">
                            <div className="db-card-who">Engineers, operators and industrial users</div>
                            <p className="db-card-desc">Build a full Process Flow Diagram and run a complete biogas simulation with real engineering calculations.</p>
                            <button className="db-btn db-btn-filled" onClick={(e) => { e.stopPropagation(); router.push('/simulator') }}>
                                Open Workspace
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                            </button>
                        </div>
                    </div>

                    {/* Learning Hub */}
                    <div className="db-card" onClick={() => router.push('/learning-hub')}>
                        <div className="db-card-top db-top-learn">
                            <div className="db-tag">Waste to Energy Guide</div>
                            <div className="db-ghost">Know</div>
                            <div className="db-card-title-wrap">
                                <div className="db-card-title">Learning Hub</div>
                                <div className="db-fact">
                                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                    Videos, guides and more
                                </div>
                            </div>
                        </div>
                        <div className="db-card-body">
                            <div className="db-card-who">Anyone starting from scratch</div>
                            <p className="db-card-desc">Learn how to turn your waste into gas with step by step guides, videos and practical tips.</p>
                            <button className="db-btn db-btn-outline-forest" onClick={(e) => { e.stopPropagation(); router.push('/learning-hub') }}>
                                Start Learning
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </main>
    )
}