'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"

export default function SimplePage() {
    const router = useRouter()
    const { data: session } = useSession()

    // ──Waste params ──
    const wasteParams = {
        'Cassava Peels': { VS: 0.29, BMP: 0.22 },
        'Fruit and Vegetable': { VS: 0.10, BMP: 0.55 },
        'Cow Dung': { VS: 0.1, BMP: 0.35 },
        'Poultry Droppings': { VS: 0.40, BMP: 0.41 },
        'Mixed Scraps': { VS: 0.28, BMP: 0.42 },
        'Food Waste': { VS: 0.28, BMP: 0.48 },
        'Wastewater Sludge': { VS: 0.03, BMP: 0.20 },
        'Market Waste': { VS: 0.12, BMP: 0.52 },
    }

    // ── State ──
    const [mobileStep, setMobileStep] = useState(1)
    const [results, setResults] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    // Desktop state
    const [dWasteType, setDWasteType] = useState('')
    const [dQuantity, setDQuantity] = useState('')
    const [dPS, setDPS] = useState('medium')
    const [dTemp, setDTemp] = useState(35)
    const [dHRT, setDHRT] = useState(30)
    const [dDil, setDDil] = useState(2.5)
    const [dLPG, setDLPG] = useState(1200)
    const [dResults, setDResults] = useState(null)
    const [dLoading, setDLoading] = useState(false)
    const [dError, setDError] = useState(null)

    // Mobile state
    const [mWasteType, setMWasteType] = useState('')
    const [mQuantity, setMQuantity] = useState('')
    const [mPS, setMPS] = useState('medium')
    const [mTemp, setMTemp] = useState(35)
    const [mHRT, setMHRT] = useState(30)
    const [mDil, setMDil] = useState(2.5)
    const [mLPG, setMLPG] = useState(1200)
    const [mResults, setMResults] = useState(null)

    // ──Factor functions ──
    const getTempFactor = (T) =>
        T >= 30 && T <= 40 ? 1.0
            : T > 40 && T <= 55 ? 0.95
                : T >= 20 && T < 30 ? 0.85
                    : 0.70

    const getHRTFactor = (HRT) => Math.min(HRT / 30, 1.0)

    const getDilutionFactor = (W) => {
        if (W < 1) return 0.30
        if (W < 2) return 0.80
        if (W <= 3) return 1.00
        if (W <= 5) return 0.90
        return 0.60
    }

    const particleSizeMm = { small: 10, medium: 25, large: 50 }

    const getParticleFactor = (ps) => {
        const size = particleSizeMm[ps] ?? 25
        if (size <= 10) return 1.00
        if (size <= 20) return 0.95
        if (size <= 35) return 0.85
        return 0.70
    }

    // ── Scale classification ──
    const getScale = (digesterVolume) => {
        if (digesterVolume < 1) return 'Household scale'
        if (digesterVolume < 10) return 'Small commercial scale'
        if (digesterVolume < 50) return 'Community scale'
        if (digesterVolume < 500) return 'Large commercial scale'
        return 'Industrial scale'
    }

    // ── Optimization tips ──
    const getOptTips = (wasteType, tempFactor, hrtFactor, dilFactor, psFactor, T, HRT, W) => {
        const tips = []
        if (psFactor < 1.0) tips.push('Shredding or grinding your waste before loading can increase biogas yield by up to 30%.')
        if (hrtFactor < 1.0) tips.push('Increasing your retention time to 30 days gives microorganisms more time to break down waste and will improve your yield.')
        if (tempFactor < 1.0 && T < 30) tips.push('Raising your digestion temperature to 35°C can increase yield by up to 50%. Consider insulating your digester.')
        if (dilFactor < 1.0 && W < 2) tips.push('Increasing your water-to-waste ratio to 2.5 L/kg helps microorganisms access nutrients more easily.')
        if (wasteType === 'Cassava Peels') tips.push('Mix cassava peels with animal manure (50/50) to boost yield by up to 25% through better nutrient balance.')
        if (wasteType === 'Market Waste') tips.push('Pre-sorting market waste to remove inorganic material before loading improves breakdown rate significantly.')
        if (wasteType === 'Wastewater Sludge') tips.push('Co-digesting wastewater sludge with food waste or market waste improves gas production significantly.')
        if (tips.length === 0) tips.push('Your conditions are well optimised. For a full co-digestion analysis and industrial-scale design, try the Engineering Workspace.')
        return tips.slice(0, 3)
    }

    // ── Core calculation — formula ──
    const runCalculation = (wasteType, M, T, HRT, W, ps, lpgPrice) => {
        const { VS, BMP } = wasteParams[wasteType]
        const tempFactor = getTempFactor(T)
        const hrtFactor = getHRTFactor(HRT)
        const dilutionFactor = getDilutionFactor(W)
        const psFactor = getParticleFactor(ps)

        const biogasYield = M * VS * BMP * tempFactor * hrtFactor * dilutionFactor * psFactor
        const methaneYield = 0.6 * biogasYield
        const digesterVolume = (M / 1000) * HRT
        const fertilizerOutput = 0.4 * M
        const cookingHours = methaneYield * 2
        const lpgEquiv = methaneYield * 0.45
        const costSavings = lpgEquiv * lpgPrice
        const totalWater = W * M
        const scaleNote = getScale(digesterVolume)
        const tempZone = T >= 30 && T <= 40 ? 'Optimal (Mesophilic)'
            : T > 40 && T <= 55 ? 'Thermophilic'
                : T >= 20 ? 'Sub-optimal' : 'Too cold'

        const tips = getOptTips(wasteType, tempFactor, hrtFactor, dilutionFactor, psFactor, T, HRT, W)

        const y2 = M * 1.5 * VS * BMP * tempFactor * hrtFactor * dilutionFactor * psFactor
        const y3 = M * 2.0 * VS * BMP * tempFactor * hrtFactor * dilutionFactor * psFactor

        return {
            biogasYield: biogasYield.toFixed(2),
            methaneYield: methaneYield.toFixed(2),
            digesterVolume: digesterVolume.toFixed(2),
            fertilizerOutput: fertilizerOutput.toFixed(2),
            cookingHours: cookingHours.toFixed(1),
            lpgEquiv: lpgEquiv.toFixed(1),
            costSavings: costSavings.toFixed(0),
            totalWater: totalWater.toFixed(0),
            scaleNote,
            tempZone,
            tempFactor: (tempFactor * 100).toFixed(0),
            hrtFactor: (hrtFactor * 100).toFixed(0),
            dilutionFactor: (dilutionFactor * 100).toFixed(0),
            tips,
            chartY1: parseFloat(biogasYield.toFixed(2)),
            chartY2: parseFloat(y2.toFixed(2)),
            chartY3: parseFloat(y3.toFixed(2)),
            wasteType,
            quantity: M,
        }
    }

    // ── Desktop validation ──
    const validateDesktop = () => {
        if (!dWasteType) { setDError('Please select a waste type.'); return false }
        const M = parseFloat(dQuantity)
        if (!M || M < 1) { setDError('Waste quantity must be at least 1 kg.'); return false }
        if (M > 100000) { setDError('Waste quantity cannot exceed 100,000 kg.'); return false }
        if (dDil < 0.5) { setDError('Water ratio too low - minimum 0.5 L/kg.'); return false }
        if (dDil > 15) { setDError('Water ratio above 15 L/kg causes severe over-dilution.'); return false }
        if (dTemp < 10) { setDError('Temperature must be at least 10°C.'); return false }
        if (dTemp > 70) { setDError('Temperature above 70°C - bacteria cannot survive.'); return false }
        if (dHRT < 5) { setDError('Retention time must be at least 5 days.'); return false }
        if (dHRT > 90) { setDError('Retention time above 90 days - no additional benefit.'); return false }
        setDError(null)
        return true
    }

    const dCalculate = () => {
        if (!validateDesktop()) return
        setDLoading(true)
        setTimeout(() => {
            const res = runCalculation(dWasteType, parseFloat(dQuantity), dTemp, dHRT, dDil, dPS, parseFloat(dLPG) || 1200)
            setDResults(res)
            setDLoading(false)
            setTimeout(() => {
                const panel = document.getElementById('desktopResults')
                if (panel) panel.scrollIntoView({ behavior: 'smooth', block: 'start' })
                document.querySelectorAll('.sm-metric-card').forEach((el, i) => {
                    setTimeout(() => el.classList.add('vis'), i * 80)
                })
                document.querySelectorAll('.sm-opt-tip').forEach((el, i) => {
                    setTimeout(() => el.classList.add('vis'), 300 + i * 100)
                })
            }, 100)
        }, 800)
    }

    // ── Mobile validation step 1 ──
    const mValidateStep1 = () => {
        if (!mWasteType) { setError('Please select a waste type.'); return false }
        const M = parseFloat(mQuantity)
        if (!M || M < 1) { setError('Waste quantity must be at least 1 kg.'); return false }
        if (M > 100000) { setError('Waste quantity cannot exceed 100,000 kg.'); return false }
        setError(null)
        return true
    }

    const mGoStep2 = () => {
        if (mValidateStep1()) setMobileStep(2)
    }

    const mCalculate = () => {
        if (mDil < 0.5 || mDil > 15) { setError('Water ratio must be between 0.5 and 15 L/kg.'); return }
        if (mTemp < 10 || mTemp > 70) { setError('Temperature must be between 10°C and 70°C.'); return }
        if (mHRT < 5 || mHRT > 90) { setError('Retention time must be between 5 and 90 days.'); return }
        setError(null)
        setLoading(true)
        setTimeout(() => {
            const res = runCalculation(mWasteType, parseFloat(mQuantity), mTemp, mHRT, mDil, mPS, parseFloat(mLPG) || 1200)
            setMResults(res)
            setMobileStep(3)
            setLoading(false)
            setTimeout(() => {
                document.querySelectorAll('.sm-metric-card').forEach((el, i) => {
                    setTimeout(() => el.classList.add('vis'), i * 80)
                })
                document.querySelectorAll('sm-opt-tip').forEach((el, i) => {
                    setTimeout(() => el.classList.add('vis'), 300 + i * 100)
                })
            }, 100)
        }, 800)
    }

    const resetAll = () => {
        setMobileStep(1)
        setMResults(null)
        setDResults(null)
        setError(null)
        setDError(null)
        setMWasteType('')
        setMQuantity('')
        setDWasteType('')
        setDQuantity('')
        setMPS('medium')
        setDPS('medium')
        setMTemp(35); setDTemp(35)
        setMHRT(30); setDHRT(30)
        setMDil(2.5); setDDil(2.5)
    }

    // ── Chart bar heights ──
    const getBarHeights = (r) => {
        const maxY = Math.max(r.chartY1, r.chartY2, r.chartY3)
        const maxH = 80
        return {
            h1: Math.round((r.chartY1 / maxY) * maxH),
            h2: Math.round((r.chartY2 / maxY) * maxH),
            h3: Math.round((r.chartY3 / maxY) * maxH),
        }
    }

    // ── Shared Results JSX ──

    return (
        <main className="sm-page">

            {/* ═══════════ DESKTOP ═══════════ */}
            <div className="sm-desktop">

                {/* Left: Form */}
                <div className="sm-form-panel">
                    <div className="sm-form-header">
                        <div className="sm-fh-inner">
                            <div className="sm-fh-badge">Simple Mode</div>
                            <div className="sm-fh-title">Biogas Yield Estimator</div>
                            <div className="sm-fh-sub">Enter your waste details to get an instant estimate</div>
                        </div>
                    </div>

                    <div className="sm-form-body">
                        {dError && <div className="simple-error">{dError}</div>}

                        <div className="sm-field">
                            <div className="sm-label">Waste type</div>
                            <select className="sm-select" value={dWasteType} onChange={e => { setDWasteType(e.target.value); setDError(null) }}>
                                <option value="">Select your waste type</option>
                                {Object.keys(wasteParams).map(wt => (
                                    <option key={wt} value={wt}>{wt}</option>
                                ))}
                            </select>
                        </div>

                        <div className="sm-field">
                            <div className="sm-label">Quantity</div>
                            <div className="sm-qty-row">
                                <input className="sm-input" type="number" placeholder="e.g. 500" min="1" max="100000"
                                    value={dQuantity} onChange={e => { setDQuantity(e.target.value); setDError(null) }} />
                                <div className="sm-unit-badge">kg</div>
                            </div>
                            <div className="sm-hint">A wheelbarrow load is about 60–80 kg.</div>
                        </div>

                        <div className="sm-field">
                            <div className="sm-label">Particle size</div>
                            <div className="sm-toggle-group">
                                {['large', 'medium', 'small'].map(ps => (
                                    <button key={ps} className={`sm-toggle-btn${dPS === ps ? ' active' : ''}`} onClick={() => setDPS(ps)}>
                                        {ps === 'large' ? 'Large' : ps === 'medium' ? 'Medium' : 'Small/Ground'}
                                    </button>
                                ))}
                            </div>
                            <div className="sm-hint">Large = unshredded. Medium = chopped. Small = shredded.</div>
                        </div>

                        <div className="sm-field">
                            <div className="sm-label">
                                Temperature
                                <span className="sm-optional">Optional</span>
                            </div>
                            <div className="sm-stepper">
                                <button className="sm-step-btn" onClick={() => setDTemp(t => Math.max(10, t - 1))}>−</button>
                                <div className="sm-step-val">{dTemp}°C</div>
                                <button className="sm-step-btn" onClick={() => setDTemp(t => Math.min(70, t + 1))}>+</button>
                            </div>
                            <div className="sm-hint">35°C is ideal for Nigeria's climate.</div>
                        </div>

                        <div className="sm-field">
                            <div className="sm-label">
                                Retention Time (HRT)
                                <span className="sm-optional">Optional</span>
                            </div>
                            <div className="sm-stepper">
                                <button className="sm-step-btn" onClick={() => setDHRT(h => Math.max(5, h - 5))}>−</button>
                                <div className="sm-step-val">{dHRT} days</div>
                                <button className="sm-step-btn" onClick={() => setDHRT(h => Math.min(90, h + 5))}>+</button>
                            </div>
                            <div className="sm-hint">Standard is 30 days for household digesters.</div>
                        </div>

                        <div className="sm-field">
                            <div className="sm-label">
                                Dilution ratio (L/kg)
                                <span className="sm-optional">Optional</span>
                            </div>
                            <div className="sm-stepper">
                                <button className="sm-step-btn" onClick={() => setDDil(d => Math.round(Math.max(0.5, d - 0.5) * 10) / 10)}>−</button>
                                <div className="sm-step-val">{dDil} L/kg</div>
                                <button className="sm-step-btn" onClick={() => setDDil(d => Math.round(Math.min(15, d + 0.5) * 10) / 10)}>+</button>
                            </div>
                        </div>

                        <div className="sm-field">
                            <div className="sm-label">LPG price per kg (₦)</div>
                            <input className="sm-input" type="number" placeholder="e.g. 1200" min="100"
                                value={dLPG} onChange={e => setDLPG(e.target.value)} />
                            <div className="sm-hint">Used to calculate how much money you save by using biogas.</div>
                        </div>
                    </div>

                    <div className="sm-form-footer">
                        <button className="sm-main-btn" disabled={dLoading} onClick={dCalculate}>
                            {dLoading
                                ? <><div className="sm-spinner"></div> Calculating...</>
                                : <>
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
                                    Calculate Biogas Yield
                                </>
                            }
                        </button>
                    </div>
                </div>

                {/* Right: Results */}
                <div className="sm-results-panel">
                    {!dResults ? (
                        <div className="sm-empty">
                            <div className="sm-empty-icon">
                                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
                            </div>
                            <h3>Results appear here</h3>
                            <p>Fill in your waste details and click Calculate.</p>
                        </div>
                    ) : (
                        <div className="sm-results-content show" id="desktopResults">
                            <div className="sm-main-result sm-slide-up">
                                <div className="sm-mr-inner">
                                    <div className="sm-mr-eyebrow">Estimated Biogas Production</div>
                                    <div className="sm-mr-value">{dResults.biogasYield}<span>m³</span></div>
                                    <div className="sm-mr-sub">≈ {dResults.methaneYield} m³ methane (60% content)</div>
                                    <div className="sm-mr-scale">
                                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
                                        {dResults.scaleNote}
                                    </div>
                                </div>
                            </div>
                            <div className="sm-metric-grid">
                                <div className="sm-metric-card">
                                    <div className="sm-mc-label">Cooking Hours</div>
                                    <div className="sm-mc-val amber">{dResults.cookingHours}<span className="sm-mc-unit">hrs</span></div>
                                    <div className="sm-mc-sub">Estimated from yield</div>
                                </div>
                                <div className="sm-metric-card">
                                    <div className="sm-mc-label">LPG Replaced</div>
                                    <div className="sm-mc-val green">{dResults.lpgEquiv}<span className="sm-mc-unit">kg</span></div>
                                    <div className="sm-mc-sub">Equivalent LPG saved</div>
                                </div>
                                <div className="sm-metric-card">
                                    <div className="sm-mc-label">Cost Savings</div>
                                    <div className="sm-mc-val teal">₦{Number(dResults.costSavings).toLocaleString()}</div>
                                    <div className="sm-mc-sub">Saved on LPG</div>
                                </div>
                                <div className="sm-metric-card">
                                    <div className="sm-mc-label">Fertilizer Output</div>
                                    <div className="sm-mc-val blue">{dResults.fertilizerOutput}<span className="sm-mc-unit">kg</span></div>
                                    <div className="sm-mc-sub">Organic digestate</div>
                                </div>
                            </div>
                            <div className="sm-chart-wrap sm-slide-up">
                                <div className="sm-chart-title">What if you had more waste?</div>
                                <div className="sm-chart-bars">
                                    <div className="sm-bar-wrap">
                                        <div className="sm-bar-val">{dResults.chartY1}</div>
                                        <div className="sm-bar b-current" style={{ height: Math.round((dResults.chartY1 / Math.max(dResults.chartY1, dResults.chartY2, dResults.chartY3)) * 80) + 'px' }}></div>
                                        <div className="sm-bar-label">Current</div>
                                    </div>
                                    <div className="sm-bar-wrap">
                                        <div className="sm-bar-val">{dResults.chartY2}</div>
                                        <div className="sm-bar b-proj1" style={{ height: Math.round((dResults.chartY2 / Math.max(dResults.chartY1, dResults.chartY2, dResults.chartY3)) * 80) + 'px' }}></div>
                                        <div className="sm-bar-label">+50% waste</div>
                                    </div>
                                    <div className="sm-bar-wrap">
                                        <div className="sm-bar-val">{dResults.chartY3}</div>
                                        <div className="sm-bar b-proj2" style={{ height: Math.round((dResults.chartY3 / Math.max(dResults.chartY1, dResults.chartY2, dResults.chartY3)) * 80) + 'px' }}></div>
                                        <div className="sm-bar-label">+100% waste</div>
                                    </div>
                                </div>
                                <div className="sm-chart-sub">These bars show how much more biogas you could produce if you collected 50% or double your current waste quantity — same conditions, more input.</div>
                            </div>
                            <div>
                                <div className="sm-opt-title">Feedstock optimization tips</div>
                                <div className="sm-opt-tips">
                                    {dResults.tips.map((tip, i) => (
                                        <div key={i} className="sm-opt-tip vis">
                                            <div className="sm-opt-check">
                                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                            </div>
                                            <div className="sm-opt-text">{tip}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                <button className="sm-btn-again" onClick={() => setDResults(null)}>Calculate Again</button>
                                <button className="sm-btn-learn" onClick={() => router.push('/learning-hub')}>Learn About Biogas →</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ═══════════ MOBILE ═══════════ */}
            <div className="sm-mobile">
                <div className="sm-m-card">

                    {/* Step 1 */}
                    {mobileStep === 1 && (
                        <div>
                            <div className="sm-m-header">
                                <div className="sm-mh-inner">
                                    <div className="sm-mh-step">Step 1 of 2</div>
                                    <div className="sm-mh-title">Tell us about your waste</div>
                                    <div className="sm-progress"><div className="sm-progress-fill" style={{ width: '50%' }}></div></div>
                                </div>
                            </div>
                            <div className="sm-m-body">
                                {error && <div className="simple-error">{error}</div>}

                                <div className="sm-field">
                                    <div className="sm-label">Waste type</div>
                                    <select className="sm-select" value={mWasteType} onChange={e => { setMWasteType(e.target.value); setError(null) }}>
                                        <option value="">Select your waste type</option>
                                        {Object.keys(wasteParams).map(wt => (
                                            <option key={wt} value={wt}>{wt}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="sm-field">
                                    <div className="sm-label">Quantity of waste</div>
                                    <div className="sm-qty-row">
                                        <input className="sm-input" type="number" placeholder="e.g. 500" min="1" max="100000"
                                            value={mQuantity} onChange={e => { setMQuantity(e.target.value); setError(null) }} />
                                        <div className="sm-unit-badge">kg</div>
                                    </div>
                                    <div className="sm-hint">A wheelbarrow load is about 60–80 kg. A small truck is about 1,000 kg.</div>
                                </div>

                                <div className="sm-field">
                                    <div className="sm-label">Particle size</div>
                                    <div className="sm-toggle-group">
                                        {['large', 'medium', 'small'].map(ps => (
                                            <button key={ps} className={`sm-toggle-btn${mPS === ps ? ' active' : ''}`} onClick={() => setMPS(ps)}>
                                                {ps === 'large' ? 'Large' : ps === 'medium' ? 'Medium' : 'Small/Ground'}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="sm-hint">Large = unshredded. Medium = chopped. Small = shredded.</div>
                                </div>
                            </div>
                            <div className="sm-m-footer">
                                <button className="sm-main-btn" onClick={mGoStep2}>
                                    Continue
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 2 */}
                    {mobileStep === 2 && (
                        <div>
                            <div className="sm-m-header">
                                <div className="sm-mh-inner">
                                    <div className="sm-mh-step">Step 2 of 2</div>
                                    <div className="sm-mh-title">Set your conditions</div>
                                    <div className="sm-progress"><div className="sm-progress-fill" style={{ width: '100%' }}></div></div>
                                </div>
                            </div>
                            <div className="sm-m-body">
                                {error && <div className="simple-error">{error}</div>}

                                <div className="sm-field">
                                    <div className="sm-label">Temperature <span className="sm-optional">Optional</span></div>
                                    <div className="sm-stepper">
                                        <button className="sm-step-btn" onClick={() => setMTemp(t => Math.max(10, t - 1))}>−</button>
                                        <div className="sm-step-val">{mTemp}°C</div>
                                        <button className="sm-step-btn" onClick={() => setMTemp(t => Math.min(70, t + 1))}>+</button>
                                    </div>
                                    <div className="sm-hint">35°C is ideal for Nigeria's climate. Only change this if you know your setup runs cooler or hotter.</div>
                                </div>

                                <div className="sm-field">
                                    <div className="sm-label">Retention Time (HRT) <span className="sm-optional">Optional</span></div>
                                    <div className="sm-stepper">
                                        <button className="sm-step-btn" onClick={() => setMHRT(h => Math.max(5, h - 5))}>−</button>
                                        <div className="sm-step-val">{mHRT} days</div>
                                        <button className="sm-step-btn" onClick={() => setMHRT(h => Math.min(90, h + 5))}>+</button>
                                    </div>
                                    <div className="sm-hint">Standard is 30 days for most household digesters.</div>
                                </div>

                                <div className="sm-field">
                                    <div className="sm-label">Dilution ratio (L/kg) <span className="sm-optional">Optional</span></div>
                                    <div className="sm-stepper">
                                        <button className="sm-step-btn" onClick={() => setMDil(d => Math.round(Math.max(0.5, d - 0.5) * 10) / 10)}>−</button>
                                        <div className="sm-step-val">{mDil} L/kg</div>
                                        <button className="sm-step-btn" onClick={() => setMDil(d => Math.round(Math.min(15, d + 0.5) * 10) / 10)}>+</button>
                                    </div>
                                </div>

                                <div className="sm-field">
                                    <div className="sm-label">LPG price per kg (₦)</div>
                                    <input className="sm-input" type="number" placeholder="e.g. 1200" min="100"
                                        value={mLPG} onChange={e => setMLPG(e.target.value)} />
                                    <div className="sm-hint">Used to calculate how much money you save by using biogas.</div>
                                </div>
                            </div>
                            <div className="sm-m-footer">
                                <button className="sm-main-btn" disabled={loading} onClick={mCalculate}>
                                    {loading
                                        ? <><div className="sm-spinner"></div> Calculating...</>
                                        : <>
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
                                            Calculate My Estimate
                                        </>
                                    }
                                </button>
                                <button className="sm-back-btn" onClick={() => { setMobileStep(1); setError(null) }}>
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
                                    Back
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Results */}
                    {mobileStep === 3 && mResults && (
                        <div>
                            <div className="sm-m-header">
                                <div className="sm-mh-inner">
                                    <div className="sm-mh-step">Your Estimate</div>
                                    <div className="sm-mh-title">{mResults.quantity} kg of {mResults.wasteType}</div>
                                </div>
                            </div>
                            <div style={{ padding: '1.35rem 1.75rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div className="sm-main-result sm-slide-up">
                                    <div className="sm-mr-inner">
                                        <div className="sm-mr-eyebrow">Estimated Biogas Production</div>
                                        <div className="sm-mr-value">{mResults.biogasYield}<span>m³</span></div>
                                        <div className="sm-mr-sub">≈ {mResults.methaneYield} m³ methane (60% content)</div>
                                        <div className="sm-mr-scale">
                                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
                                            {mResults.scaleNote}
                                        </div>
                                    </div>
                                </div>
                                <div className="sm-metric-grid">
                                    <div className="sm-metric-card">
                                        <div className="sm-mc-label">Cooking Hours</div>
                                        <div className="sm-mc-val amber">{mResults.cookingHours}<span className="sm-mc-unit">hrs</span></div>
                                        <div className="sm-mc-sub">Estimated from yield</div>
                                    </div>
                                    <div className="sm-metric-card">
                                        <div className="sm-mc-label">LPG Replaced</div>
                                        <div className="sm-mc-val green">{mResults.lpgEquiv}<span className="sm-mc-unit">kg</span></div>
                                        <div className="sm-mc-sub">Equivalent LPG saved</div>
                                    </div>
                                    <div className="sm-metric-card">
                                        <div className="sm-mc-label">Cost Savings</div>
                                        <div className="sm-mc-val teal">₦{Number(mResults.costSavings).toLocaleString()}</div>
                                        <div className="sm-mc-sub">Saved on LPG</div>
                                    </div>
                                    <div className="sm-metric-card">
                                        <div className="sm-mc-label">Fertilizer Output</div>
                                        <div className="sm-mc-val blue">{mResults.fertilizerOutput}<span className="sm-mc-unit">kg</span></div>
                                        <div className="sm-mc-sub">Organic digestate</div>
                                    </div>
                                </div>
                                <div className="sm-chart-wrap sm-slide-up">
                                    <div className="sm-chart-title">What if you had more waste?</div>
                                    <div className="sm-chart-bars">
                                        <div className="sm-bar-wrap">
                                            <div className="sm-bar-val">{mResults.chartY1}</div>
                                            <div className="sm-bar b-current" style={{ height: Math.round((mResults.chartY1 / Math.max(mResults.chartY1, mResults.chartY2, mResults.chartY3)) * 80) + 'px' }}></div>
                                            <div className="sm-bar-label">Current</div>
                                        </div>
                                        <div className="sm-bar-wrap">
                                            <div className="sm-bar-val">{mResults.chartY2}</div>
                                            <div className="sm-bar b-proj1" style={{ height: Math.round((mResults.chartY2 / Math.max(mResults.chartY1, mResults.chartY2, mResults.chartY3)) * 80) + 'px' }}></div>
                                            <div className="sm-bar-label">+50% waste</div>
                                        </div>
                                        <div className="sm-bar-wrap">
                                            <div className="sm-bar-val">{mResults.chartY3}</div>
                                            <div className="sm-bar b-proj2" style={{ height: Math.round((mResults.chartY3 / Math.max(mResults.chartY1, mResults.chartY2, mResults.chartY3)) * 80) + 'px' }}></div>
                                            <div className="sm-bar-label">+100% waste</div>
                                        </div>
                                    </div>
                                    <div className="sm-chart-sub">These bars show how much more biogas you could produce if you collected 50% or double your current waste quantity - same conditions, more input.</div>
                                </div>
                                <div>
                                    <div className="sm-opt-title">Feedstock optimization tips</div>
                                    <div className="sm-opt-tips">
                                        {mResults.tips.map((tip, i) => (
                                            <div key={i} className="sm-opt-tip vis">
                                                <div className="sm-opt-check">
                                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                                </div>
                                                <div className="sm-opt-text">{tip}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div style={{ padding: '0 1.75rem 1.75rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                <button className="sm-btn-again" onClick={resetAll}>Estimate Again</button>
                                <button className="sm-btn-learn" onClick={() => router.push('/learning-hub')}>Learn About Biogas →</button>
                            </div>
                        </div>
                    )}

                </div>
            </div>

        </main>
    )
}