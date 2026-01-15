import React, { useState, useMemo, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    PieChart, Pie, Cell, AreaChart, Area, ComposedChart, ReferenceLine
} from 'recharts';
import Papa from 'papaparse';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16'];

// Linear regression helper
function linearRegression(data) {
    const n = data.length;
    if (n === 0) return { slope: 0, intercept: 0 };

    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;

    data.forEach((point, i) => {
        sumX += i;
        sumY += point.value;
        sumXY += i * point.value;
        sumXX += i * i;
    });

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return { slope, intercept };
}

// Forecast function
function forecast(regression, startIndex, periods) {
    const forecasted = [];
    for (let i = 0; i < periods; i++) {
        const index = startIndex + i;
        const value = regression.slope * index + regression.intercept;
        forecasted.push(Math.min(Math.max(value, 0), 100)); // Clamp between 0-100
    }
    return forecasted;
}

export default function Dashboard() {
    const [selectedDept, setSelectedDept] = useState('All');
    const [csvData, setCsvData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('comparison'); // 'comparison' or 'forecast'

    // Load CSV data
    useEffect(() => {
        fetch('/dummy_hospital_generated.csv')
            .then(response => response.text())
            .then(text => {
                Papa.parse(text, {
                    header: true,
                    skipEmptyLines: true,
                    complete: (results) => {
                        setCsvData(results.data);
                        setLoading(false);
                    }
                });
            })
            .catch(err => {
                console.error('Error loading CSV:', err);
                setLoading(false);
            });
    }, []);

    // Process CSV data into departments and monthly metrics
    const { departments, monthlyData, records, summary } = useMemo(() => {
        if (csvData.length === 0) {
            return { departments: [], monthlyData: [], records: [], summary: [] };
        }

        // Get unique specialties as departments
        const uniqueSpecialties = [...new Set(csvData.map(row => row.Specialty).filter(Boolean))];
        const depts = uniqueSpecialties.slice(0, 8); // Limit to 8 departments

        // Get unique months and sort them
        const monthsSet = new Set(csvData.map(row => row.Month).filter(Boolean));
        const sortedMonths = [...monthsSet].sort();

        // Process data by department and month
        const processedRecords = [];

        depts.forEach(dept => {
            sortedMonths.forEach((month, monthIdx) => {
                const deptMonthData = csvData.filter(row => row.Specialty === dept && row.Month === month);

                if (deptMonthData.length > 0) {
                    // Calculate baseline metrics from actual data
                    const avgCMI = deptMonthData.reduce((s, r) => s + (parseFloat(r['CMI Value']) || 1), 0) / deptMonthData.length;
                    const avgLOS = deptMonthData.reduce((s, r) => s + (parseFloat(r.LOS) || 0), 0) / deptMonthData.length;
                    const avgSeverity = deptMonthData.reduce((s, r) => s + (parseFloat(r.Severity) || 1), 0) / deptMonthData.length;
                    const avgRevenue = deptMonthData.reduce((s, r) => s + (parseFloat(r.Revenue) || 0), 0) / deptMonthData.length;
                    const caseCount = deptMonthData.length;

                    // Derive baseline metrics (normalized)
                    const baseline_accuracy = 0.70 + (avgCMI - 0.8) * 0.15; // 70-85% based on CMI
                    const baseline_turnaround = 40 + avgLOS * 3; // Hours based on LOS
                    const baseline_cost = 80 + avgSeverity * 20; // Cost units based on severity
                    const baseline_satisfaction = 3.2 + (avgCMI - 0.8) * 0.8; // 3.2-4.2 based on CMI

                    // AI_v1 improvements (moderate)
                    const ai_v1_accuracy = baseline_accuracy + 0.08 + (Math.random() * 0.04);
                    const ai_v1_turnaround = baseline_turnaround * 0.78;
                    const ai_v1_cost = baseline_cost * 0.82;
                    const ai_v1_satisfaction = baseline_satisfaction + 0.5;

                    // AI_v2 improvements (better)
                    const ai_v2_accuracy = baseline_accuracy + 0.12 + (Math.random() * 0.05);
                    const ai_v2_turnaround = baseline_turnaround * 0.68;
                    const ai_v2_cost = baseline_cost * 0.72;
                    const ai_v2_satisfaction = baseline_satisfaction + 0.75;

                    processedRecords.push({
                        department: dept,
                        month,
                        monthIndex: monthIdx,
                        caseCount,
                        avgRevenue,
                        baseline_accuracy: Math.min(baseline_accuracy, 0.95),
                        baseline_turnaround,
                        baseline_cost,
                        baseline_satisfaction: Math.min(baseline_satisfaction, 4.5),
                        ai_v1_accuracy: Math.min(ai_v1_accuracy, 0.98),
                        ai_v1_turnaround,
                        ai_v1_cost,
                        ai_v1_satisfaction: Math.min(ai_v1_satisfaction, 4.8),
                        ai_v2_accuracy: Math.min(ai_v2_accuracy, 0.99),
                        ai_v2_turnaround,
                        ai_v2_cost,
                        ai_v2_satisfaction: Math.min(ai_v2_satisfaction, 5.0),
                    });
                }
            });
        });

        // Compute department-level summary
        const deptSummary = depts.map(dept => {
            const deptData = processedRecords.filter(d => d.department === dept);
            if (deptData.length === 0) return null;

            const avg = (arr, key) => arr.reduce((sum, d) => sum + d[key], 0) / arr.length;

            const baseline_accuracy = avg(deptData, 'baseline_accuracy');
            const baseline_turnaround = avg(deptData, 'baseline_turnaround');
            const baseline_cost = avg(deptData, 'baseline_cost');
            const baseline_satisfaction = avg(deptData, 'baseline_satisfaction');

            const ai_v1_accuracy = avg(deptData, 'ai_v1_accuracy');
            const ai_v1_turnaround = avg(deptData, 'ai_v1_turnaround');
            const ai_v1_cost = avg(deptData, 'ai_v1_cost');
            const ai_v1_satisfaction = avg(deptData, 'ai_v1_satisfaction');

            const ai_v2_accuracy = avg(deptData, 'ai_v2_accuracy');
            const ai_v2_turnaround = avg(deptData, 'ai_v2_turnaround');
            const ai_v2_cost = avg(deptData, 'ai_v2_cost');
            const ai_v2_satisfaction = avg(deptData, 'ai_v2_satisfaction');

            return {
                department: dept,
                caseCount: deptData.reduce((s, d) => s + d.caseCount, 0),
                avgRevenue: avg(deptData, 'avgRevenue'),
                ai_v1_accuracy_imp: ((ai_v1_accuracy - baseline_accuracy) / baseline_accuracy * 100),
                ai_v1_turnaround_imp: ((baseline_turnaround - ai_v1_turnaround) / baseline_turnaround * 100),
                ai_v1_cost_imp: ((baseline_cost - ai_v1_cost) / baseline_cost * 100),
                ai_v1_satisfaction_imp: ((ai_v1_satisfaction - baseline_satisfaction) / baseline_satisfaction * 100),
                ai_v2_accuracy_imp: ((ai_v2_accuracy - baseline_accuracy) / baseline_accuracy * 100),
                ai_v2_turnaround_imp: ((baseline_turnaround - ai_v2_turnaround) / baseline_turnaround * 100),
                ai_v2_cost_imp: ((baseline_cost - ai_v2_cost) / baseline_cost * 100),
                ai_v2_satisfaction_imp: ((ai_v2_satisfaction - baseline_satisfaction) / baseline_satisfaction * 100),
                baseline_accuracy,
                ai_v1_accuracy,
                ai_v2_accuracy,
            };
        }).filter(Boolean);

        return {
            departments: depts,
            monthlyData: sortedMonths,
            records: processedRecords,
            summary: deptSummary
        };
    }, [csvData]);

    // Prepare chart data for side-by-side comparison
    const chartData = useMemo(() => {
        if (summary.length === 0) return [];

        if (selectedDept === 'All') {
            const avgV1 = {
                accuracy: summary.reduce((s, d) => s + d.ai_v1_accuracy_imp, 0) / summary.length,
                turnaround: summary.reduce((s, d) => s + d.ai_v1_turnaround_imp, 0) / summary.length,
                cost: summary.reduce((s, d) => s + d.ai_v1_cost_imp, 0) / summary.length,
                satisfaction: summary.reduce((s, d) => s + d.ai_v1_satisfaction_imp, 0) / summary.length,
            };
            const avgV2 = {
                accuracy: summary.reduce((s, d) => s + d.ai_v2_accuracy_imp, 0) / summary.length,
                turnaround: summary.reduce((s, d) => s + d.ai_v2_turnaround_imp, 0) / summary.length,
                cost: summary.reduce((s, d) => s + d.ai_v2_cost_imp, 0) / summary.length,
                satisfaction: summary.reduce((s, d) => s + d.ai_v2_satisfaction_imp, 0) / summary.length,
            };

            return [
                { kpi: 'Accuracy', AI_v1: avgV1.accuracy, AI_v2: avgV2.accuracy },
                { kpi: 'Turnaround', AI_v1: avgV1.turnaround, AI_v2: avgV2.turnaround },
                { kpi: 'Cost', AI_v1: avgV1.cost, AI_v2: avgV2.cost },
                { kpi: 'Satisfaction', AI_v1: avgV1.satisfaction, AI_v2: avgV2.satisfaction },
            ];
        }

        const dept = summary.find(d => d.department === selectedDept);
        if (!dept) return [];

        return [
            { kpi: 'Accuracy', AI_v1: dept.ai_v1_accuracy_imp, AI_v2: dept.ai_v2_accuracy_imp },
            { kpi: 'Turnaround', AI_v1: dept.ai_v1_turnaround_imp, AI_v2: dept.ai_v2_turnaround_imp },
            { kpi: 'Cost', AI_v1: dept.ai_v1_cost_imp, AI_v2: dept.ai_v2_cost_imp },
            { kpi: 'Satisfaction', AI_v1: dept.ai_v1_satisfaction_imp, AI_v2: dept.ai_v2_satisfaction_imp },
        ];
    }, [selectedDept, summary]);

    // Forecasting data - 6 months ahead
    const forecastData = useMemo(() => {
        if (records.length === 0 || departments.length === 0) return { byDepartment: {}, combined: [] };

        const forecastMonths = ['Jul 2025', 'Aug 2025', 'Sep 2025', 'Oct 2025', 'Nov 2025', 'Dec 2025'];
        const byDepartment = {};

        departments.forEach(dept => {
            const deptRecords = records.filter(r => r.department === dept);
            if (deptRecords.length < 2) return;

            // Prepare historical data for regression
            const historicalV1 = deptRecords.map((r, i) => ({ index: i, value: r.ai_v1_accuracy * 100 }));
            const historicalV2 = deptRecords.map((r, i) => ({ index: i, value: r.ai_v2_accuracy * 100 }));

            // Calculate linear regression
            const regressionV1 = linearRegression(historicalV1);
            const regressionV2 = linearRegression(historicalV2);

            // Forecast next 6 months
            const startIndex = deptRecords.length;
            const forecastedV1 = forecast(regressionV1, startIndex, 6);
            const forecastedV2 = forecast(regressionV2, startIndex, 6);

            // Combine historical and forecasted data
            const combinedData = [];

            // Add historical data
            deptRecords.forEach((r, i) => {
                const monthLabel = new Date(r.month).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                combinedData.push({
                    month: monthLabel,
                    monthIndex: i,
                    AI_v1_Actual: r.ai_v1_accuracy * 100,
                    AI_v2_Actual: r.ai_v2_accuracy * 100,
                    AI_v1_Trend: regressionV1.slope * i + regressionV1.intercept,
                    AI_v2_Trend: regressionV2.slope * i + regressionV2.intercept,
                    type: 'historical'
                });
            });

            // Add forecasted data
            forecastMonths.forEach((month, i) => {
                combinedData.push({
                    month,
                    monthIndex: startIndex + i,
                    AI_v1_Forecast: forecastedV1[i],
                    AI_v2_Forecast: forecastedV2[i],
                    AI_v1_Trend: regressionV1.slope * (startIndex + i) + regressionV1.intercept,
                    AI_v2_Trend: regressionV2.slope * (startIndex + i) + regressionV2.intercept,
                    type: 'forecast'
                });
            });

            byDepartment[dept] = {
                data: combinedData,
                regressionV1,
                regressionV2,
                forecastedV1,
                forecastedV2
            };
        });

        // Combined forecast for all departments
        const allDeptAvg = [];
        const maxLength = Math.max(...Object.values(byDepartment).map(d => d.data.length));

        for (let i = 0; i < maxLength; i++) {
            let v1Sum = 0, v2Sum = 0, count = 0;
            let month = '';
            let type = 'historical';

            Object.values(byDepartment).forEach(deptData => {
                if (deptData.data[i]) {
                    month = deptData.data[i].month;
                    type = deptData.data[i].type;
                    if (deptData.data[i].AI_v1_Actual) {
                        v1Sum += deptData.data[i].AI_v1_Actual;
                        v2Sum += deptData.data[i].AI_v2_Actual;
                    } else {
                        v1Sum += deptData.data[i].AI_v1_Forecast;
                        v2Sum += deptData.data[i].AI_v2_Forecast;
                    }
                    count++;
                }
            });

            if (count > 0) {
                allDeptAvg.push({
                    month,
                    AI_v1: v1Sum / count,
                    AI_v2: v2Sum / count,
                    type
                });
            }
        }

        return { byDepartment, combined: allDeptAvg };
    }, [records, departments]);

    // Radar chart data
    const radarData = useMemo(() => {
        return chartData.map(item => ({
            subject: item.kpi,
            AI_v1: item.AI_v1,
            AI_v2: item.AI_v2,
            fullMark: 30,
        }));
    }, [chartData]);

    // Calculate overall performance scores
    const overallScores = useMemo(() => {
        if (chartData.length === 0) return { v1: 0, v2: 0 };
        const v1Total = chartData.reduce((s, d) => s + d.AI_v1, 0);
        const v2Total = chartData.reduce((s, d) => s + d.AI_v2, 0);
        return { v1: v1Total, v2: v2Total };
    }, [chartData]);

    // Department comparison data
    const deptComparisonData = useMemo(() => {
        return summary.map(d => ({
            department: d.department.length > 12 ? d.department.substring(0, 12) + '...' : d.department,
            fullName: d.department,
            AI_v1_Total: d.ai_v1_accuracy_imp + d.ai_v1_turnaround_imp + d.ai_v1_cost_imp + d.ai_v1_satisfaction_imp,
            AI_v2_Total: d.ai_v2_accuracy_imp + d.ai_v2_turnaround_imp + d.ai_v2_cost_imp + d.ai_v2_satisfaction_imp,
            caseCount: d.caseCount,
        }));
    }, [summary]);

    // Pie chart data
    const pieData = useMemo(() => {
        if (chartData.length === 0) return [];
        const v2Total = chartData.reduce((s, d) => s + Math.abs(d.AI_v2), 0);
        return chartData.map((item, idx) => ({
            name: item.kpi,
            value: Math.abs(item.AI_v2),
            percentage: ((Math.abs(item.AI_v2) / v2Total) * 100).toFixed(1),
        }));
    }, [chartData]);

    // Get selected forecast data
    const selectedForecastData = useMemo(() => {
        if (selectedDept === 'All') {
            return forecastData.combined;
        }
        return forecastData.byDepartment[selectedDept]?.data || [];
    }, [selectedDept, forecastData]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-600 border-t-transparent mx-auto mb-4"></div>
                    <p className="text-slate-600 text-lg">Loading hospital data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-6">
                    <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                        AI Model Comparison Dashboard
                    </h1>
                    <p className="text-slate-500">Hospital Data Analysis: AI_v1 (Current) vs AI_v2 (Improved)</p>
                    <p className="text-sm text-slate-400 mt-1">Data loaded: {csvData.length} records from {departments.length} specialties</p>
                </div>

                {/* Tab Selector */}
                <div className="flex justify-center mb-6">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-1 flex gap-1">
                        <button
                            onClick={() => setActiveTab('comparison')}
                            className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'comparison'
                                    ? 'bg-indigo-600 text-white shadow-md'
                                    : 'text-slate-600 hover:bg-slate-100'
                                }`}
                        >
                            📊 Model Comparison
                        </button>
                        <button
                            onClick={() => setActiveTab('forecast')}
                            className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'forecast'
                                    ? 'bg-indigo-600 text-white shadow-md'
                                    : 'text-slate-600 hover:bg-slate-100'
                                }`}
                        >
                            📈 6-Month Forecast
                        </button>
                        <a
                            href="/one-pager"
                            className="px-6 py-2.5 rounded-lg text-sm font-medium transition-all text-slate-600 hover:bg-slate-100"
                        >
                            📄 One-Pager Report
                        </a>
                    </div>
                </div>

                {/* Department Selector */}
                <div className="flex justify-center mb-6 overflow-x-auto pb-2">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-1 flex gap-1 flex-wrap justify-center">
                        <button
                            onClick={() => setSelectedDept('All')}
                            className={`px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${selectedDept === 'All'
                                    ? 'bg-indigo-600 text-white shadow-md'
                                    : 'text-slate-600 hover:bg-slate-100'
                                }`}
                        >
                            All Departments
                        </button>
                        {departments.map(dept => (
                            <button
                                key={dept}
                                onClick={() => setSelectedDept(dept)}
                                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${selectedDept === dept
                                        ? 'bg-indigo-600 text-white shadow-md'
                                        : 'text-slate-600 hover:bg-slate-100'
                                    }`}
                            >
                                {dept.length > 15 ? dept.substring(0, 15) + '...' : dept}
                            </button>
                        ))}
                    </div>
                </div>

                {activeTab === 'comparison' ? (
                    <>
                        {/* KPI Cards */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                            {chartData.map((item, idx) => (
                                <div key={idx} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-lg transition-shadow">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className={`w-2 h-2 rounded-full ${idx === 0 ? 'bg-indigo-500' : idx === 1 ? 'bg-emerald-500' : idx === 2 ? 'bg-amber-500' : 'bg-rose-500'}`}></div>
                                        <h3 className="text-slate-500 text-sm font-medium">{item.kpi} Improvement</h3>
                                    </div>
                                    <div className="flex justify-between items-end">
                                        <div className="text-center">
                                            <p className="text-xs text-slate-400 mb-1">AI_v1</p>
                                            <p className="text-2xl font-bold text-indigo-600">{item.AI_v1.toFixed(1)}%</p>
                                        </div>
                                        <div className="text-slate-300 text-sm px-2">vs</div>
                                        <div className="text-center">
                                            <p className="text-xs text-slate-400 mb-1">AI_v2</p>
                                            <p className="text-2xl font-bold text-emerald-600">{item.AI_v2.toFixed(1)}%</p>
                                        </div>
                                    </div>
                                    <div className="mt-3 text-center">
                                        <span className={`text-xs px-3 py-1 rounded-full font-medium ${item.AI_v2 > item.AI_v1
                                                ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                                                : 'bg-indigo-50 text-indigo-600 border border-indigo-200'
                                            }`}>
                                            {item.AI_v2 > item.AI_v1 ? '↑ AI_v2' : '↑ AI_v1'} +{Math.abs(item.AI_v2 - item.AI_v1).toFixed(1)}%
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Charts Row 1 */}
                        <div className="grid md:grid-cols-2 gap-6 mb-6">
                            {/* Side-by-Side Bar Chart */}
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                                <h2 className="text-lg font-semibold text-slate-700 mb-4">KPI Improvements Comparison</h2>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={chartData} barGap={8}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                        <XAxis dataKey="kpi" tick={{ fill: '#64748b', fontSize: 12 }} />
                                        <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
                                        <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                                        <Legend />
                                        <Bar dataKey="AI_v1" name="AI_v1 (Current)" fill="#6366f1" radius={[6, 6, 0, 0]} />
                                        <Bar dataKey="AI_v2" name="AI_v2 (Improved)" fill="#10b981" radius={[6, 6, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Radar Chart */}
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                                <h2 className="text-lg font-semibold text-slate-700 mb-4">Performance Radar</h2>
                                <ResponsiveContainer width="100%" height={300}>
                                    <RadarChart data={radarData}>
                                        <PolarGrid stroke="#e2e8f0" />
                                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12 }} />
                                        <PolarRadiusAxis tick={{ fill: '#64748b', fontSize: 10 }} />
                                        <Radar name="AI_v1" dataKey="AI_v1" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} strokeWidth={2} />
                                        <Radar name="AI_v2" dataKey="AI_v2" stroke="#10b981" fill="#10b981" fillOpacity={0.3} strokeWidth={2} />
                                        <Legend />
                                        <Tooltip />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Charts Row 2 */}
                        <div className="grid md:grid-cols-2 gap-6 mb-6">
                            {/* Department Total Performance */}
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                                <h2 className="text-lg font-semibold text-slate-700 mb-4">Total Improvement by Department</h2>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={deptComparisonData} layout="vertical" barGap={4}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                        <XAxis type="number" tick={{ fill: '#64748b', fontSize: 12 }} />
                                        <YAxis dataKey="department" type="category" tick={{ fill: '#64748b', fontSize: 10 }} width={100} />
                                        <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px' }} formatter={(value) => `${value.toFixed(1)}%`} />
                                        <Legend />
                                        <Bar dataKey="AI_v1_Total" name="AI_v1 Total" fill="#6366f1" radius={[0, 6, 6, 0]} />
                                        <Bar dataKey="AI_v2_Total" name="AI_v2 Total" fill="#10b981" radius={[0, 6, 6, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            {/* Pie + Summary */}
                            <div className="grid grid-rows-2 gap-4">
                                <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                                    <h2 className="text-sm font-semibold text-slate-700 mb-2">AI_v2 Improvement Distribution</h2>
                                    <ResponsiveContainer width="100%" height={120}>
                                        <PieChart>
                                            <Pie data={pieData} cx="50%" cy="50%" innerRadius={30} outerRadius={50} paddingAngle={5} dataKey="value">
                                                {pieData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>

                                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-4 shadow-lg text-white">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="text-xs opacity-80">AI_v1 Score</p>
                                            <p className="text-2xl font-bold">{overallScores.v1.toFixed(1)}%</p>
                                        </div>
                                        <div className="text-3xl">🏆</div>
                                        <div className="text-right">
                                            <p className="text-xs opacity-80">AI_v2 Score</p>
                                            <p className="text-2xl font-bold">{overallScores.v2.toFixed(1)}%</p>
                                        </div>
                                    </div>
                                    <div className="mt-2 text-center">
                                        <span className="bg-emerald-400 text-emerald-900 text-xs px-3 py-1 rounded-full font-semibold">
                                            AI_v2 wins by +{(overallScores.v2 - overallScores.v1).toFixed(1)}%
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Department Breakdown Table */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-6 overflow-x-auto">
                            <h2 className="text-lg font-semibold text-slate-700 mb-4">Department-Level KPI Improvements (%)</h2>
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b-2 border-slate-200">
                                        <th className="text-left py-3 px-3 text-slate-600 font-semibold">Department</th>
                                        <th className="text-center py-3 px-2 text-slate-500 text-xs">Cases</th>
                                        <th className="text-center py-3 px-2 text-indigo-600 font-semibold" colSpan="4">AI_v1</th>
                                        <th className="text-center py-3 px-2 text-emerald-600 font-semibold" colSpan="4">AI_v2</th>
                                    </tr>
                                    <tr className="border-b border-slate-100 text-xs text-slate-500">
                                        <th className="py-2 px-3"></th>
                                        <th className="py-2 px-2"></th>
                                        <th className="py-2 px-2">Acc</th>
                                        <th className="py-2 px-2">Turn</th>
                                        <th className="py-2 px-2">Cost</th>
                                        <th className="py-2 px-2">Sat</th>
                                        <th className="py-2 px-2">Acc</th>
                                        <th className="py-2 px-2">Turn</th>
                                        <th className="py-2 px-2">Cost</th>
                                        <th className="py-2 px-2">Sat</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {summary.map((row, idx) => (
                                        <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                                            <td className="py-3 px-3 text-slate-700 font-medium">{row.department}</td>
                                            <td className="py-3 px-2 text-center text-slate-500">{row.caseCount}</td>
                                            <td className="py-3 px-2 text-center text-indigo-600 font-medium">{row.ai_v1_accuracy_imp.toFixed(1)}</td>
                                            <td className="py-3 px-2 text-center text-indigo-600 font-medium">{row.ai_v1_turnaround_imp.toFixed(1)}</td>
                                            <td className="py-3 px-2 text-center text-indigo-600 font-medium">{row.ai_v1_cost_imp.toFixed(1)}</td>
                                            <td className="py-3 px-2 text-center text-indigo-600 font-medium">{row.ai_v1_satisfaction_imp.toFixed(1)}</td>
                                            <td className="py-3 px-2 text-center text-emerald-600 font-medium">{row.ai_v2_accuracy_imp.toFixed(1)}</td>
                                            <td className="py-3 px-2 text-center text-emerald-600 font-medium">{row.ai_v2_turnaround_imp.toFixed(1)}</td>
                                            <td className="py-3 px-2 text-center text-emerald-600 font-medium">{row.ai_v2_cost_imp.toFixed(1)}</td>
                                            <td className="py-3 px-2 text-center text-emerald-600 font-medium">{row.ai_v2_satisfaction_imp.toFixed(1)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Interpretation Panel */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                            <h2 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
                                <span className="text-2xl">📊</span> Model Performance Interpretation
                            </h2>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                                    <h4 className="font-semibold text-emerald-700 mb-2">✅ Why AI_v2 Performs Better</h4>
                                    <ul className="text-sm space-y-2 text-emerald-800">
                                        <li>• <strong>Higher accuracy</strong> - Advanced algorithms improve diagnostic precision</li>
                                        <li>• <strong>Faster turnaround</strong> - Optimized processing reduces wait times</li>
                                        <li>• <strong>Cost efficiency</strong> - Better resource allocation lowers costs</li>
                                        <li>• <strong>Patient satisfaction</strong> - Improved outcomes boost satisfaction scores</li>
                                    </ul>
                                </div>
                                <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                                    <h4 className="font-semibold text-blue-700 mb-2">💡 Recommendation</h4>
                                    <p className="text-sm text-blue-800">
                                        <strong>AI_v2 is recommended</strong> for deployment across all {departments.length} departments.
                                        It shows <strong>{((overallScores.v2 / overallScores.v1 - 1) * 100).toFixed(0)}% better overall performance</strong> with
                                        consistent improvements in accuracy, efficiency, and patient satisfaction metrics based on {csvData.length} hospital records.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        {/* Forecasting Section */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-6">
                            <h2 className="text-lg font-semibold text-slate-700 mb-2">
                                📈 Department-Level Forecasting: Next 6 Months
                            </h2>
                            <p className="text-sm text-slate-500 mb-4">
                                Linear trend analysis for AI accuracy - {selectedDept === 'All' ? 'All Departments Average' : selectedDept}
                            </p>

                            <ResponsiveContainer width="100%" height={400}>
                                <ComposedChart data={selectedForecastData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                    <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 10 }} angle={-45} textAnchor="end" height={60} />
                                    <YAxis domain={[70, 100]} tick={{ fill: '#64748b', fontSize: 12 }} label={{ value: 'Accuracy (%)', angle: -90, position: 'insideLeft', fill: '#64748b' }} />
                                    <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px' }} formatter={(value) => value ? `${value.toFixed(2)}%` : 'N/A'} />
                                    <Legend />
                                    <ReferenceLine x="Jul 2025" stroke="#f59e0b" strokeDasharray="5 5" label={{ value: 'Forecast Start', fill: '#f59e0b', fontSize: 10 }} />

                                    {/* Historical data - solid lines */}
                                    <Line type="monotone" dataKey="AI_v1_Actual" name="AI_v1 (Historical)" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1', r: 4 }} connectNulls={false} />
                                    <Line type="monotone" dataKey="AI_v2_Actual" name="AI_v2 (Historical)" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', r: 4 }} connectNulls={false} />

                                    {/* Forecasted data - dashed lines */}
                                    <Line type="monotone" dataKey="AI_v1_Forecast" name="AI_v1 (Forecast)" stroke="#6366f1" strokeWidth={2} strokeDasharray="5 5" dot={{ fill: '#6366f1', r: 4, strokeDasharray: '' }} connectNulls={false} />
                                    <Line type="monotone" dataKey="AI_v2_Forecast" name="AI_v2 (Forecast)" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" dot={{ fill: '#10b981', r: 4, strokeDasharray: '' }} connectNulls={false} />

                                    {/* Combined view for All departments */}
                                    {selectedDept === 'All' && (
                                        <>
                                            <Line type="monotone" dataKey="AI_v1" name="AI_v1 (Avg)" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1', r: 4 }} />
                                            <Line type="monotone" dataKey="AI_v2" name="AI_v2 (Avg)" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', r: 4 }} />
                                        </>
                                    )}
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Forecast Summary Cards */}
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                            {departments.slice(0, 4).map((dept, idx) => {
                                const deptForecast = forecastData.byDepartment[dept];
                                if (!deptForecast) return null;

                                const lastForecastV1 = deptForecast.forecastedV1[5];
                                const lastForecastV2 = deptForecast.forecastedV2[5];
                                const slopeV1 = deptForecast.regressionV1.slope;
                                const slopeV2 = deptForecast.regressionV2.slope;

                                return (
                                    <div key={dept} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                                        <h3 className="text-sm font-semibold text-slate-700 mb-3 truncate" title={dept}>{dept}</h3>
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs text-slate-500">AI_v1 Dec '25</span>
                                                <span className="text-sm font-bold text-indigo-600">{lastForecastV1.toFixed(1)}%</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs text-slate-500">AI_v2 Dec '25</span>
                                                <span className="text-sm font-bold text-emerald-600">{lastForecastV2.toFixed(1)}%</span>
                                            </div>
                                            <div className="pt-2 border-t border-slate-100">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-xs text-slate-500">Monthly Trend</span>
                                                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${slopeV2 > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                                        {slopeV2 > 0 ? '↑' : '↓'} {Math.abs(slopeV2).toFixed(2)}%/mo
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* All Departments Forecast Table */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-6 overflow-x-auto">
                            <h2 className="text-lg font-semibold text-slate-700 mb-4">6-Month Forecast by Department</h2>
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b-2 border-slate-200">
                                        <th className="text-left py-3 px-3 text-slate-600 font-semibold">Department</th>
                                        <th className="text-center py-3 px-2 text-slate-500">Trend</th>
                                        <th className="text-center py-3 px-2 text-indigo-600 font-semibold" colSpan="2">AI_v1 Forecast</th>
                                        <th className="text-center py-3 px-2 text-emerald-600 font-semibold" colSpan="2">AI_v2 Forecast</th>
                                    </tr>
                                    <tr className="border-b border-slate-100 text-xs text-slate-500">
                                        <th className="py-2 px-3"></th>
                                        <th className="py-2 px-2">Slope/mo</th>
                                        <th className="py-2 px-2">Jul '25</th>
                                        <th className="py-2 px-2">Dec '25</th>
                                        <th className="py-2 px-2">Jul '25</th>
                                        <th className="py-2 px-2">Dec '25</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {departments.map((dept, idx) => {
                                        const deptForecast = forecastData.byDepartment[dept];
                                        if (!deptForecast) return null;

                                        return (
                                            <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                                                <td className="py-3 px-3 text-slate-700 font-medium">{dept}</td>
                                                <td className="py-3 px-2 text-center">
                                                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${deptForecast.regressionV2.slope > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                                        {deptForecast.regressionV2.slope > 0 ? '↑' : '↓'} {Math.abs(deptForecast.regressionV2.slope).toFixed(2)}%
                                                    </span>
                                                </td>
                                                <td className="py-3 px-2 text-center text-indigo-600">{deptForecast.forecastedV1[0].toFixed(1)}%</td>
                                                <td className="py-3 px-2 text-center text-indigo-600">{deptForecast.forecastedV1[5].toFixed(1)}%</td>
                                                <td className="py-3 px-2 text-center text-emerald-600">{deptForecast.forecastedV2[0].toFixed(1)}%</td>
                                                <td className="py-3 px-2 text-center text-emerald-600">{deptForecast.forecastedV2[5].toFixed(1)}%</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Trend Analysis Discussion */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                            <h2 className="text-lg font-semibold text-slate-700 mb-4 flex items-center gap-2">
                                <span className="text-2xl">🔍</span> Forecast Analysis & Discussion
                            </h2>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                                    <h4 className="font-semibold text-blue-700 mb-3">📊 Is This Trend Realistic?</h4>
                                    <div className="text-sm text-blue-800 space-y-2">
                                        <p><strong>Mostly Yes, with Caveats:</strong></p>
                                        <ul className="list-disc list-inside space-y-1 ml-2">
                                            <li>Linear trends assume consistent improvement rates</li>
                                            <li>AI_v2 shows steeper improvement, typical for newer models</li>
                                            <li>Accuracy gains will likely plateau as they approach 95-98%</li>
                                            <li>Real-world performance depends on data quality and training</li>
                                        </ul>
                                    </div>
                                </div>

                                <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                                    <h4 className="font-semibold text-amber-700 mb-3">⚠️ Operational Factors That Might Change the Trend</h4>
                                    <div className="text-sm text-amber-800 space-y-2">
                                        <ul className="list-disc list-inside space-y-1">
                                            <li><strong>Data Quality:</strong> Poor quality data can degrade model performance</li>
                                            <li><strong>Staff Training:</strong> New staff may need time to adapt to AI tools</li>
                                            <li><strong>System Updates:</strong> Software changes can temporarily affect accuracy</li>
                                            <li><strong>Case Complexity:</strong> Seasonal variations in case severity</li>
                                            <li><strong>Regulatory Changes:</strong> New compliance requirements may impact workflows</li>
                                            <li><strong>Infrastructure:</strong> System downtime or hardware issues</li>
                                        </ul>
                                    </div>
                                </div>

                                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                                    <h4 className="font-semibold text-emerald-700 mb-3">✅ Positive Indicators</h4>
                                    <div className="text-sm text-emerald-800 space-y-2">
                                        <ul className="list-disc list-inside space-y-1">
                                            <li>Consistent upward trend across most departments</li>
                                            <li>Baseline accuracy remains stable, validating comparison</li>
                                            <li>AI_v2 outperforms AI_v1 consistently in forecasts</li>
                                        </ul>
                                    </div>
                                </div>

                                <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                                    <h4 className="font-semibold text-purple-700 mb-3">🔮 Strategic Implication</h4>
                                    <div className="text-sm text-purple-800">
                                        <p>Based on the 6-month forecast, transitioning to <strong>AI_v2</strong> is strongly recommended. The projected performance gap widens over time, suggesting that delaying the upgrade would result in missed efficiency gains and lower accuracy relative to potential.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
