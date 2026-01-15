import React from 'react';
import './OnePager.css';

export default function OnePager() {
    return (
        <div className="one-pager-wrapper">
            <div className="one-pager-container">
                {/* Back Button */}
                <div className="mb-4">
                    <a href="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600 transition-colors">
                        ← Back to Dashboard
                    </a>
                </div>

                {/* Header */}
                <header className="one-pager-header">
                    <div className="header-left">
                        <div className="logo-icon">🏥</div>
                        <div className="header-title">
                            <h1>MedTech AI Performance Analysis</h1>
                            <p>Healthcare Intelligence Platform | Executive Summary</p>
                        </div>
                    </div>
                    <div className="header-right">
                        <div className="header-badge">📊 One-Pager Report</div>
                        <div className="header-date">Analysis Period: Jan 2024 - Dec 2024<br />Generated: January 2026</div>
                    </div>
                </header>

                <main className="main-grid">
                    {/* About the Data */}
                    <section className="section-card about-section">
                        <h2 className="section-title">About the Data</h2>
                        <div className="about-grid">
                            <div className="about-item">
                                <div className="about-value">48</div>
                                <div className="about-label">Total Records</div>
                            </div>
                            <div className="about-item">
                                <div className="about-value">4</div>
                                <div className="about-label">Departments</div>
                            </div>
                            <div className="about-item">
                                <div className="about-value">12</div>
                                <div className="about-label">Months Analyzed</div>
                            </div>
                            <div className="about-item">
                                <div className="about-value">4</div>
                                <div className="about-label">KPI Metrics</div>
                            </div>
                        </div>
                    </section>

                    {/* AI Models Comparison */}
                    <section className="section-card models-section">
                        <h2 className="section-title">AI → Models</h2>
                        <div className="models-comparison">
                            <div className="model-card v1">
                                <div className="model-name">AI_v1</div>
                                <div className="model-desc">First Generation Model</div>
                                <div className="model-stat">+16.2%</div>
                                <div className="model-stat-label">Avg. Improvement</div>
                            </div>
                            <div className="vs-badge">VS</div>
                            <div className="model-card v2">
                                <div className="winner-banner">🏆 Winner</div>
                                <div className="model-name">AI_v2</div>
                                <div className="model-desc">Improved Second Generation</div>
                                <div className="model-stat">+23.4%</div>
                                <div className="model-stat-label">Avg. Improvement</div>
                            </div>
                        </div>
                    </section>

                    {/* Current Performance */}
                    <section className="section-card current-section">
                        <h2 className="section-title">Current Performance</h2>
                        <div className="chart-placeholder">
                            📊 KPI Comparison Chart<br />
                            <small>Images unavailable in repository</small>
                        </div>
                        <div className="kpi-row">
                            <div className="kpi-mini">
                                <span className="kpi-mini-label">Accuracy</span>
                                <span className="kpi-mini-value">+15.5%</span>
                            </div>
                            <div className="kpi-mini">
                                <span className="kpi-mini-label">Turnaround</span>
                                <span className="kpi-mini-value">+32.1%</span>
                            </div>
                            <div className="kpi-mini">
                                <span className="kpi-mini-label">Cost Savings</span>
                                <span className="kpi-mini-value">+23.2%</span>
                            </div>
                            <div className="kpi-mini">
                                <span className="kpi-mini-label">Satisfaction</span>
                                <span className="kpi-mini-value">+22.8%</span>
                            </div>
                        </div>
                    </section>

                    {/* Next 6 Months Forecast */}
                    <section className="section-card forecast-section">
                        <h2 className="section-title">Next Six Months Forecast</h2>
                        <div className="chart-placeholder">
                            📈 6-Month Forecast Chart<br />
                            <small>Images unavailable in repository</small>
                        </div>
                        <div className="kpi-row">
                            <div className="kpi-mini">
                                <span className="kpi-mini-label">Radiology</span>
                                <span className="kpi-mini-value">0.883</span>
                            </div>
                            <div className="kpi-mini">
                                <span className="kpi-mini-label">Pathology</span>
                                <span className="kpi-mini-value">0.912</span>
                            </div>
                            <div className="kpi-mini">
                                <span className="kpi-mini-label">Cardiology</span>
                                <span className="kpi-mini-value">0.931</span>
                            </div>
                            <div className="kpi-mini">
                                <span className="kpi-mini-label">Operations</span>
                                <span className="kpi-mini-value">0.985</span>
                            </div>
                        </div>
                    </section>

                    {/* Insights */}
                    <section className="section-card insights-section">
                        <h2 className="section-title">Key Insights</h2>
                        <div className="insights-grid">
                            <div className="insight-card">
                                <div className="insight-icon">📊</div>
                                <div className="insight-title">Enhanced Accuracy</div>
                                <div className="insight-text">AI_v2 achieves 15.5% accuracy improvement vs 9.8% for AI_v1, showing 58% better performance.</div>
                            </div>
                            <div className="insight-card">
                                <div className="insight-icon">⏱️</div>
                                <div className="insight-title">Faster Processing</div>
                                <div className="insight-text">Turnaround reduced by 32.1% with AI_v2, enabling faster patient care delivery.</div>
                            </div>
                            <div className="insight-card">
                                <div className="insight-icon">💰</div>
                                <div className="insight-title">Cost Efficiency</div>
                                <div className="insight-text">AI_v2 saves 23.2% in operational costs through better resource utilization.</div>
                            </div>
                            <div className="insight-card">
                                <div className="insight-icon">📈</div>
                                <div className="insight-title">Forecast Trend</div>
                                <div className="insight-text">Operations shows strongest trend (+0.68%/month, R²=0.47). Monitor for ceiling effects.</div>
                            </div>
                        </div>
                    </section>

                    {/* Attributes */}
                    <section className="section-card attributes-section">
                        <h2 className="section-title">Dataset Attributes</h2>
                        <div className="attributes-grid">
                            <div className="attribute-item">
                                <div className="attribute-value">Radiology</div>
                                <div className="attribute-label">Department 1</div>
                            </div>
                            <div className="attribute-item">
                                <div className="attribute-value">Pathology</div>
                                <div className="attribute-label">Department 2</div>
                            </div>
                            <div className="attribute-item">
                                <div className="attribute-value">Cardiology</div>
                                <div className="attribute-label">Department 3</div>
                            </div>
                            <div className="attribute-item">
                                <div className="attribute-value">Operations</div>
                                <div className="attribute-label">Department 4</div>
                            </div>
                            <div className="attribute-item">
                                <div className="attribute-value">Accuracy</div>
                                <div className="attribute-label">KPI Metric</div>
                            </div>
                            <div className="attribute-item">
                                <div className="attribute-value">Turnaround</div>
                                <div className="attribute-label">KPI Metric</div>
                            </div>
                            <div className="attribute-item">
                                <div className="attribute-value">Cost</div>
                                <div className="attribute-label">KPI Metric</div>
                            </div>
                            <div className="attribute-item">
                                <div className="attribute-value">Satisfaction</div>
                                <div className="attribute-label">KPI Metric</div>
                            </div>
                            <div className="attribute-item">
                                <div className="attribute-value">Baseline</div>
                                <div className="attribute-label">Model Type</div>
                            </div>
                            <div className="attribute-item">
                                <div className="attribute-value">AI_v1</div>
                                <div className="attribute-label">Model Type</div>
                            </div>
                            <div className="attribute-item">
                                <div className="attribute-value">AI_v2</div>
                                <div className="attribute-label">Model Type</div>
                            </div>
                            <div className="attribute-item">
                                <div className="attribute-value">Linear</div>
                                <div className="attribute-label">Forecast Model</div>
                            </div>
                        </div>
                    </section>
                </main>

                {/* Footer */}
                <footer className="footer">
                    <div className="footer-left">
                        <strong>MedTech AI Analytics Platform</strong><br />
                        Healthcare Intelligence | Prepared for Executive Review<br />
                        Confidential - Internal Use Only
                    </div>
                    <div className="footer-right">
                        <div className="footer-stat">
                            <div className="footer-stat-value">AI_v2</div>
                            <div className="footer-stat-label">Recommended</div>
                        </div>
                        <div className="footer-stat">
                            <div className="footer-stat-value">+44.4%</div>
                            <div className="footer-stat-label">Better Than v1</div>
                        </div>
                        <div className="footer-stat">
                            <div className="footer-stat-value">6 mo</div>
                            <div className="footer-stat-label">Forecast Period</div>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
}
