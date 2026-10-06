'use client'

import { useState } from "react"

const wasteOptions = [
    'Cassava Peels',
    'Fruit and Vegetable',
    'Cow Dung',
    'Poultry Droppings',
    'Mixed Scraps',
    'Food Waste',
    'Wastewater Sludge',
    'Market Waste'
]

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

const componentsFields = {
    MixingTank: [
        { name: 'waterRatio', label: 'Water to Waste Ratio (L/kg)', type: 'number', placeholder: 'e.g. 2 (means 2L water per 1kg waste)' },
    ],
    Digester: [
        { name: 'retentionTime', label: 'Retention Time (days)', type: 'number', placeholder: 'e.g. 20 (range: 10-60)' },
    ],
    HeatExchanger: [
        { name: 'inletTemp', label: 'Inlet Temperature (°C)', type: 'number', placeholder: 'e.g. 25' },
        { name: 'outletTemp', label: 'Outlet Temperature (°C)', type: 'number', placeholder: 'e.g. 35' },
    ],
    GasHolder: [
        { name: 'volumeCapacity', label: 'Volume Capacity (m³)', type: 'number', placeholder: 'e.g. 10' },
    ],
    DigestateTank: [],
    Pump: [
        { name: 'flowRate', label: 'Flow Rate (m³/day)', type: 'number', placeholder: 'e.g. 5' },
    ],
    Valve: [
        { name: 'status', label: 'Valve Status', type: 'select', options: ['Open', 'Closed'] },
    ],
    Shredder: [
        { name: 'particleSize', label: 'Target Particle Size (mm)', type: 'number', placeholder: 'e.g. 10 (range: 5-50)' },
    ],
    Separator: [
        { name: 'separationEfficiency', label: 'CO₂ Removal Efficiency (%)', type: 'number', placeholder: 'e.g. 85 (range: 50-99)' },
    ],
}

const componentsLabels = {
    FeedTank: 'Feed Tank',
    MixingTank: 'Mixing Tank',
    Digester: 'Digester',
    GasHolder: 'Gas Holder',
    HeatExchanger: 'Heat Exchanger',
    DigestateTank: 'Digestate Tank',
    Pump: 'Pump',
    Valve: 'Valve',
    Shredder: 'Shredder',
    Separator: 'Gas Separator',
}

// --- Optimization Calculator ---
const calculateOptimization = (wastes) => {
    if (!wastes || wastes.length === 0) return null

    const totalM = wastes.reduce((sum, w) => sum + (parseFloat(w.quantity) || 0), 0)
    if (totalM === 0) return null

    // Blend VS and BMP
    const blendedVS = wastes.reduce((sum, w) => sum + ((wasteParams[w.type]?.VS || 0) * (parseFloat(w.quantity) || 0)), 0) / totalM
    const blendedBMP = wastes.reduce((sum, w) => sum + ((wasteParams[w.type]?.BMP || 0) * (parseFloat(w.quantity) || 0)), 0) / totalM

    // Optimal conditions
    const optTemp = 35    // °C mesophilic optimal
    const optHRT = 30    // days
    const optWaterRatio = 2.5   // L/kg

    const optTempFactor = 1.0
    const optHRTFactor = 1.0
    const optDilutionFactor = 1.0

    const maxBiogas = totalM * blendedVS * blendedBMP * optTempFactor * optHRTFactor * optDilutionFactor
    const maxMethane = 0.6 * maxBiogas
    const fertilizer = 0.4 * totalM
    const cooking = maxMethane * 2
    const savings = maxMethane * 0.45 * 1400 // <- Current price of LPG Gas

    return {
        optTemp,
        optHRT,
        optWaterRatio,
        maxBiogas: maxBiogas.toFixed(2),
        maxMethane: maxMethane.toFixed(2),
        fertilizer: fertilizer.toFixed(2),
        cooking: cooking.toFixed(1),
        savings: savings.toFixed(0),
        totalMass: totalM,
        blendedVS: blendedVS.toFixed(3),
        blendedBMP: blendedBMP.toFixed(3),
    }
}

export default function SimulatorPanel({ selectedNode, onClose, onSimulate, results, error }) {
    const [inputs, setInputs] = useState({})
    const [loading, setLoading] = useState(false)

    // Co-digestion waste entries
    const [wastes, setWastes] = useState([{ type: '', quantity: '' }])
    const [showOptimization, setShowOptimization] = useState(false)

    if (!selectedNode) return null

    const category = selectedNode.category
    const fields = componentsFields[category] || []
    const label = componentsLabels[category] || category
    const isFeedTank = category === 'FeedTank'

    const handleChange = (e) => {
        setInputs({ ...inputs, [e.target.name]: e.target.value })
    }

    // Co-digestion handlers
    const handleWasteChange = (index, field, value) => {
        const updated = [...wastes]
        updated[index] = { ...updated[index], [field]: value }
        setWastes(updated)
    }

    const addWaste = () => {
        if (wastes.length < 3) setWastes([...wastes, { type: '', quantity: '' }])
    }

    const removeWaste = (index) => {
        if (wastes.length > 1) setWastes(wastes.filter((_, i) => i !== index))
    }

    const handleSimulate = (e) => {
        e.preventDefault()
        setLoading(true)
        setShowOptimization(false)

        if (isFeedTank) {
            // Pass wastes array for co-digestion
            setTimeout(() => {
                onSimulate(category, { wastes })
                setLoading(false)
            }, 600)
        } else {
            setTimeout(() => {
                onSimulate(category, inputs)
                setLoading(false)
            }, 600)
        }
    }

    const validWastes = wastes.filter(w => w.type && parseFloat(w.quantity) >= 1)
    const optimization = isFeedTank && validWastes.length > 0 ? calculateOptimization(validWastes) : null

    return (
        <div className="sim-panel">

            {/* Panel Header */}
            <div className="sim-panel-header-new">
                <div className="sim-panel-badge">{label}</div>
                <h3>{selectedNode.text || label}</h3>
                <button className="sim-panel-close-new" onClick={onClose}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                </button>
            </div>

            <div className="sim-panel-body-inner">

                {/* Error Message */}
                {error && (
                    <div className="sim-panel-error">
                        {error}
                    </div>
                )}

                {/* Feed Tank — Co-digestion inputs */}
                {isFeedTank ? (
                    <form onSubmit={handleSimulate}>
                        <p className="sim-panel-section-title">Waste Inputs (up to 3 types)</p>

                        {wastes.map((waste, index) => (
                            <div className="sim-waste-entry" key={index}>
                                <div className="sim-panel-field">
                                    <label>Waste Type {index + 1}</label>
                                    <select
                                        value={waste.type}
                                        onChange={(e) => handleWasteChange(index, 'type', e.target.value)}
                                        required
                                    >
                                        <option value="">-- Select --</option>
                                        {wasteOptions.map(opt => (
                                            <option key={opt}>{opt}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="sim-panel-field">
                                    <label>Quantity (kg)</label>
                                    <input
                                        type="number"
                                        placeholder="e.g. 100"
                                        value={waste.quantity}
                                        onChange={(e) => handleWasteChange(index, 'quantity', e.target.value)}
                                        min="1"
                                        max="100000"
                                        required
                                    />
                                </div>
                                {wastes.length > 1 && (
                                    <button
                                        type="button"
                                        className="sim-remove-btn"
                                        onClick={() => removeWaste(index)}
                                    >
                                        Remove
                                    </button>
                                )}
                            </div>
                        ))}

                        {wastes.length < 3 && (
                            <button
                                type="button"
                                className="sim-add-btn"
                                onClick={addWaste}
                            >
                                + Add Another Waste Type
                            </button>
                        )}

                        <div className="sim-panel-total">
                            Total Waste: {wastes.reduce((sum, w) => sum + (parseFloat(w.quantity) || 0), 0).toFixed(1)} kg
                        </div>

                        <div className="sim-panel-btn-row">
                            <button
                                type="submit"
                                className="btn btn-green sim-panel-btn"
                                disabled={loading}
                            >
                                {loading ? 'Processing...' : 'Simulate'}
                            </button>
                            {optimization && (
                                <button
                                    type="button"
                                    className="btn btn-outline sim-panel-btn"
                                    onClick={() => setShowOptimization(!showOptimization)}
                                >
                                    {showOptimization ? 'Hide Optimization' : (
                                        <>
                                            Optimize
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '4px', verticalAlign: '-2px' }}>
                                                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                                            </svg>
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </form>
                ) : fields.length > 0 ? (
                    /* Standard input fields for other components */
                    <form onSubmit={handleSimulate}>
                        {fields.map((field) => (
                            <div className="sim-panel-field" key={field.name}>
                                <label>{field.label}</label>
                                {field.type === 'select' ? (
                                    <select
                                        name={field.name}
                                        value={inputs[field.name] || ''}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">--- Select ---</option>
                                        {field.options.map(opt => (
                                            <option key={opt}>{opt}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <input
                                        type={field.type}
                                        name={field.name}
                                        placeholder={field.placeholder}
                                        value={inputs[field.name] || ''}
                                        onChange={handleChange}
                                        min="0"
                                        required
                                    />
                                )}
                            </div>
                        ))}

                        <button
                            type="submit"
                            className="btn btn-green sim-panel-btn"
                            disabled={loading}
                        >
                            {loading ? 'Calculating...' : 'Simulate'}
                        </button>
                    </form>
                ) : (
                    <p className="sim-panel-note">
                        This component receives digestate output from the Digester.
                        Run simulation from the Digester to see results here.
                    </p>
                )}

                {/* Optimization Panel */}
                {showOptimization && optimization && (
                    <div className="sim-optimization">
                        <h4>Optimization Analysis</h4>
                        <p className="sim-opt-subtitle">
                            Based on {optimization.totalMass} kg of{' '}
                            {wastes.length === 1 ? wastes[0].type : `${wastes.length} waste types`}
                        </p>

                        <div className="sim-opt-section">
                            <p className="sim-opt-label">Optimal Conditions for Maximum Methane:</p>
                            <div className="sim-opt-row">
                                <span>Best Temperature</span>
                                <span>{optimization.optTemp}°C</span>
                            </div>
                            <p className="sim-opt-why">Mesophilic range — peak bacterial activity</p>

                            <div className="sim-opt-row">
                                <span>Best Retention Time</span>
                                <span>{optimization.optHRT} days</span>
                            </div>
                            <p className="sim-opt-why">Full substrate conversion — beyond 30 days yields negligible additional biogas</p>

                            <div className="sim-opt-row">
                                <span>Best Water Ratio</span>
                                <span>{optimization.optWaterRatio} L/kg</span>
                            </div>
                            <p className="sim-opt-why">Optimal bacterial concentration — prevents dilution inhibition</p>
                        </div>

                        <div className="sim-opt-section">
                            <p className="sim-opt-label">Maximum Predicted Output:</p>
                            <div className="sim-opt-row">
                                <span>Biogas Yield</span>
                                <span>{optimization.maxBiogas} m³</span>
                            </div>
                            <div className="sim-opt-row">
                                <span>Methane</span>
                                <span>{optimization.maxMethane} m³</span>
                            </div>
                            <div className="sim-opt-row">
                                <span>Fertilizer</span>
                                <span>{optimization.fertilizer} kg</span>
                            </div>
                            <div className="sim-opt-row">
                                <span>Cooking Hours</span>
                                <span>{optimization.cooking} hrs</span>
                            </div>
                            <div className="sim-opt-row">
                                <span>Cost Savings</span>
                                <span>₦{Number(optimization.savings).toLocaleString()}</span>
                            </div>
                        </div>

                        {wastes.length > 1 && (
                            <div className="sim-opt-section">
                                <p className="sim-opt-label">Co-digestion Blend:</p>
                                <div className="sim-opt-row">
                                    <span>Blended VS</span>
                                    <span>{optimization.blendedVS}</span>
                                </div>
                                <div className="sim-opt-row">
                                    <span>Blended BMP</span>
                                    <span>{optimization.blendedBMP} m³/kg VS</span>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Results Section */}
                {results && (
                    <div className="sim-panel-results">
                        <h4>Results</h4>
                        {(() => {
                            const cardColors = ['green', 'blue', 'amber', 'teal']
                            let cardIndex = 0
                            return Object.entries(results).map(([key, val]) => {
                                const isDivider = key.replace(/─/g, '').trim() === ''
                                if (isDivider) {
                                    return <div className="sim-section-divider" key={key}>{val.toString().replace(/─/g, '').trim() || key.replace(/─/g, '').trim()}</div>
                                }
                                const isMetric = /^-?\d/.test(String(val))
                                if (isMetric) {
                                    const color = cardColors[cardIndex % cardColors.length]
                                    cardIndex++
                                    return (
                                        <div className={`sim-metric-card ${color}`} key={key}>
                                            <div className="sim-metric-label">{key}</div>
                                            <div className={`sim-metric-val ${color}`}>{val}</div>
                                        </div>
                                    )
                                }
                                return (
                                    <div className="sim-panel-row" key={key}>
                                        <span className="sim-result-label">{key}</span>
                                        <span className="sim-result-value">{val}</span>
                                    </div>
                                )
                            })
                        })()}
                    </div>
                )}

            </div>
        </div>
    )
}