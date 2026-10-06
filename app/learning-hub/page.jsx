'use client';

import { useState } from 'react';

const guides = [
    {
        id: 'what-is-ad',
        title: 'What is anaerobic digestion?',
        body: 'It is a natural process where small living organisms break down waste when there is no oxygen around. What comes out of it is biogas, which you can burn for cooking or power, and a leftover material that works well as fertiliser.',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></svg>
        ),
    },
    {
        id: 'how-digester-works',
        title: 'How does a biogas digester work?',
        body: 'A digester is simply a sealed tank. You put waste in one side, it stays sealed for some days while it breaks down, and gas collects at the top ready for use. The used waste comes out the other side as fertiliser.',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="8" width="16" height="12" rx="2" /><path d="M9 8V5a3 3 0 016 0v3" /></svg>
        ),
    },
    {
        id: 'best-waste',
        title: 'What waste types produce the most biogas?',
        body: 'Food waste and fruit waste tend to give more gas for the same amount of material. Cassava peels and market waste also work well. Wastewater sludge gives less per kilogram, but it is still usable.',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3v18h18" /><path d="M7 14l4-4 3 3 5-6" /></svg>
        ),
    },
    {
        id: 'yield-factors',
        title: 'What affects biogas yield?',
        body: 'The type of waste, the temperature, and how long it stays in the digester all matter. Warmer conditions and the right waiting time give better results. Getting these wrong lowers how much gas you get.',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v4M12 18v4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M2 12h4M18 12h4M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8" /></svg>
        ),
    },
    {
        id: 'cooking-energy',
        title: 'How is biogas used for cooking and energy?',
        body: 'You can connect it to a stove and cook with it just like gas from a cylinder. Larger setups can also run a generator for electricity.',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3 1.267 1.267 1.5 3 1.5 3z" /></svg>
        ),
    },
    {
        id: 'digestate',
        title: 'What is digestate and how is it used as fertiliser?',
        body: 'Digestate is what remains after the waste has broken down. It is rich in nutrients  and directly applied to the soil to improve crop yield.',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
        ),
    },
];

const concepts = [
    { term: 'Volatile Solids (VS)', short: 'The part of waste that can actually break down.', full: "The fraction of a feedstock's dry matter that bacteria can digest. Higher VS generally means more biogas potential per kilogram." },
    { term: 'Biochemical Methane Potential (BMP)', short: 'How much methane a waste type can give.', full: 'A measure of the maximum methane a feedstock can produce under ideal conditions, usually per kilogram of volatile solids.' },
    { term: 'Hydraulic Retention Time (HRT)', short: 'How long waste stays in the digester.', full: 'The average time material spends inside before it is removed. Too short and digestion is incomplete, too long adds cost with little extra gain.' },
    { term: 'Mesophilic vs Thermophilic', short: 'Two temperature ranges for running a digester.', full: 'Mesophilic runs around 30 to 38°C and is stable and forgiving. Thermophilic runs around 50 to 57°C, faster but needs tighter control.' },
    { term: 'Co-digestion', short: 'Mixing waste types to boost yield.', full: 'Feeding two or more waste types together, often to balance nutrients and get more gas than either would give alone.' },
    { term: 'CSTR', short: 'The most common digester design.', full: 'Continuous Stirred Tank Reactor. Waste is kept constantly mixed so conditions stay even throughout the tank.' },
];

const myths = [
    { myth: 'A biogas digester will make your compound smell.', fact: 'A properly sealed digester traps the gas inside. Once set up correctly, there is little to no smell.' },
    { myth: 'It can explode at any moment.', fact: 'Home-scale systems store gas at low pressure. Kept sealed and away from open flames, the risk is low.' },
    { myth: 'You need a lot of land to start.', fact: 'A household-scale digester can be smaller than 1 cubic metre. It can fit in a small backyard.' },
    { myth: 'Only big farms with animals can use it.', fact: 'Everyday kitchen scraps and market waste work too. No livestock needed.' },
    { myth: 'It is too expensive for the average person.', fact: 'Simple setups can cost far less over time than buying LPG or firewood month after month.' },
];

const processSteps = ['Feed Tank', 'Shredder', 'Mixing Tank', 'Pump', 'Heat Exchanger', 'Anaerobic Digester', 'Gas Holder & Digestate Tank'];

export default function LearningHubPage() {
    const [openGuide, setOpenGuide] = useState(null);
    const [expandedConcept, setExpandedConcept] = useState(null);

    return (
        <>
            <section className="lh-hero">
                <div className="lh-hero-glow" />
                <div className="lh-hero-inner">
                    <div className="lh-hero-eyebrow">Learning Hub</div>
                    <h1>Turn your waste into biogas, the safe way</h1>
                    <p>Plain-language guides and videos for anyone starting from zero, plus a deeper track for engineers.</p>
                </div>
            </section>

            <section className="lh-howworks">
                <div className="lh-howworks-inner">
                    <div className="lh-video-label" style={{ color: '#fff' }}>How it works, in four steps</div>
                    <div className="lh-howworks-grid">
                        <div className="lh-hw-step">
                            <div className="lh-hw-icon"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M3 12h18M3 18h18" /></svg></div>
                            <div className="lh-hw-label">Collect your waste</div>
                        </div>
                        <div className="lh-hw-step">
                            <div className="lh-hw-icon"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="4" y="8" width="16" height="12" rx="2" /><path d="M9 8V5a3 3 0 016 0v3" /></svg></div>
                            <div className="lh-hw-label">Feed the digester</div>
                        </div>
                        <div className="lh-hw-step">
                            <div className="lh-hw-icon"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3 1.267 1.267 1.5 3 1.5 3z" /></svg></div>
                            <div className="lh-hw-label">Bacteria produce gas</div>
                        </div>
                        <div className="lh-hw-step">
                            <div className="lh-hw-icon"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" /></svg></div>
                            <div className="lh-hw-label">Use gas and fertiliser</div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="lh-section">
                <div className="lh-section-head">
                    <h2>Guides</h2>
                    <p>Short explainers covering the basics, no engineering background needed.</p>
                </div>

                <div className="lh-guides">
                    {guides.map((g) => {
                        const isOpen = openGuide === g.id;
                        return (
                            <div key={g.id} className={`lh-guide-card${isOpen ? ' lh-open' : ''}`}>
                                <button
                                    className="lh-guide-trigger"
                                    onClick={() => setOpenGuide(isOpen ? null : g.id)}
                                >
                                    <span className="lh-guide-icon">{g.icon}</span>
                                    <span className="lh-guide-title">{g.title}</span>
                                    <svg className="lh-guide-chevron" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
                                </button>
                                <div className="lh-guide-body">
                                    <div className="lh-guide-body-inner">{g.body}</div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="lh-video-label">Watch it done</div>
                <div className="lh-video-grid">
                    <div className="lh-video-card">
                        <div className="lh-video-frame">
                            <iframe src="https://www.youtube.com/embed/c_Jtl-VhkKI" title="Make your own biogas to save money on LPG" allowFullScreen />
                        </div>
                        <div className="lh-video-caption">Make your own biogas to save money on LPG</div>
                    </div>
                    <div className="lh-video-card">
                        <div className="lh-video-frame">
                            <iframe src="https://www.youtube.com/embed/gibriNpzCDk" title="Stop buying gas: make your own homemade biogas" allowFullScreen />
                        </div>
                        <div className="lh-video-caption">Stop buying gas: make your own homemade biogas</div>
                    </div>
                </div>
            </section>

            <section className="lh-section lh-myths-section">
                <div className="lh-section-head">
                    <h2>Myths vs facts</h2>
                    <p>The questions people actually ask before they try it.</p>
                </div>
                <div className="lh-myths-grid">
                    {myths.map((m, i) => (
                        <div key={i} className="lh-myth-row">
                            <div className="lh-myth-cell lh-myth">
                                <div className="lh-myth-tag">Myth</div>
                                <p>{m.myth}</p>
                            </div>
                            <div className="lh-myth-cell lh-fact">
                                <div className="lh-myth-tag">Fact</div>
                                <p>{m.fact}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section className="lh-section">
                <div className="lh-section-head">
                    <h2>Key concepts</h2>
                    <p>Quick reference terms you will see in Simple Mode and the Engineering Workspace. Tap a card for the full definition.</p>
                </div>
                <div className="lh-concepts-grid">
                    {concepts.map((c, i) => {
                        const isExpanded = expandedConcept === i;
                        return (
                            <div
                                key={i}
                                className={`lh-concept-card${isExpanded ? ' lh-expanded' : ''}`}
                                onClick={() => setExpandedConcept(isExpanded ? null : i)}
                            >
                                <div>
                                    <div className="lh-concept-term">{c.term}</div>
                                    <div className="lh-concept-short">{c.short}</div>
                                    <div className="lh-concept-full">{c.full}</div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            <section className="lh-section lh-eng-section">
                <div className="lh-section-head">
                    <span className="lh-eng-badge">For process engineers and students</span>
                    <h2>See the process at industrial scale</h2>
                    <p>This is the same process you will build in Engineering Workspace, laid out step by step.</p>
                </div>

                <div className="lh-video-label" style={{ color: '#fff' }}>The industrial process, step by step</div>
                <div className="lh-process-flow">
                    {processSteps.map((step, i) => (
                        <div key={step} className="lh-process-step">
                            <div className="lh-process-dot">{i + 1}</div>
                            <div className="lh-process-label">{step}</div>
                        </div>
                    ))}
                </div>
                <div className="lh-eng-note">
                    <strong>Valves</strong> control and isolate flow between stages. <strong>Separators</strong> split digestate into liquid and solid fractions where the process calls for it.
                </div>

                <div className="lh-eng-cards">
                    <div className="lh-eng-card">
                        <h4>Why Continuous Stirred Tank Reactors</h4>
                        <p>CSTRs keep waste constantly mixed, so conditions stay even throughout the tank. This makes them the most common choice for industrial digesters and the default reactor type in the Workspace.</p>
                    </div>
                    <div className="lh-eng-card">
                        <h4>Scaling up: household to industrial</h4>
                        <p>Moving from a backyard digester to an industrial plant changes what you have to control. Retention time, mixing, and how fast you feed the digester all need closer management as scale increases.</p>
                    </div>
                    <div className="lh-eng-card">
                        <h4>Process safety at scale</h4>
                        <p>At industrial scale, methane and hydrogen sulphide need active monitoring. Gas detectors, sealed joints, and no open flames near the digester are standard practice, not optional.</p>
                    </div>
                    <div className="lh-eng-card">
                        <h4>Where this leads</h4>
                        <p>Once you understand the stages, you can build and connect them yourself in Engineering Workspace, the same way a real plant is laid out.</p>
                    </div>
                </div>

                <div className="lh-video-label" style={{ color: '#fff' }}>See a real plant</div>
                <div className="lh-video-grid" style={{ gridTemplateColumns: '1fr', maxWidth: '520px' }}>
                    <div className="lh-video-card lh-eng-video">
                        <div className="lh-video-frame">
                            <iframe src="https://www.youtube.com/embed/NPb4vBNJBWE" title="Dicklands Biogas facility tour" allowFullScreen />
                        </div>
                        <div className="lh-video-caption">Dicklands Biogas: a real facility, from feedstock to gas upgrading</div>
                    </div>
                </div>
            </section>

            <section className="lh-cta">
                <div className="lh-cta-inner">
                    <h2>Ready to see it in action?</h2>
                    <p>Run a real estimate with your own waste data, or build out a full process design.</p>
                    <div className="lh-cta-buttons">
                        <a href="/simple-mode" className="lh-cta-btn lh-primary">
                            Try Simple Mode
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                        </a>
                        <a href="/engineering-workspace" className="lh-cta-btn lh-secondary">Open Engineering Workspace</a>
                    </div>
                </div>
            </section>
        </>
    );
}