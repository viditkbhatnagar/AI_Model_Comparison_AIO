# AI Model Comparison Dashboard

## 📋 Project Overview
This project is a React-based interactive dashboard designed to compare the performance of two Artificial Intelligence models (**AI_v1** vs **AI_v2**) in a hospital setting. It visualizes key performance indicators (KPIs) such as **Accuracy**, **Turnaround Time**, **Cost Efficiency**, and **Patient Satisfaction** across various medical departments.

The dashboard serves as a decision-support tool, helping stakeholders understand the impact of upgrading from the current model (AI_v1) to the improved model (AI_v2).

## 🚀 Key Features
- **Interactive Dashboard**: Dynamically loads and processes hospital data.
- **Model Comparison**: Side-by-side comparison of AI_v1 and AI_v2 across multiple metrics.
- **Department Analysis**: Drill-down capability to view performance by specific departments (e.g., Cardiology, Neurology).
- **Forecasting**: A 6-month predictive analysis using linear regression to forecast future model performance.
- **Visualizations**: Rich set of charts including Bar Charts, Radar Charts, Pie Charts, and Trend Lines using `recharts`.
- **Responsive Design**: Fully responsive UI built with Tailwind CSS.

## 🛠️ Tech Stack
- **Frontend Framework**: React (Vite)
- **Styling**: Tailwind CSS
- **Visualization**: Recharts
- **Data Parsing**: PapaParse (CSV processing)
- **Deployment**: Netlify

## 🔍 How It Works (Implementation Details)

### 1. Data Loading & Parsing
The application fetches raw data from a CSV file (`/dummy_hospital_generated.csv`) containing transactional hospital records.
- **Library**: `papaparse` converts the CSV text into a JSON object.
- **State Management**: The parsed data is stored in React state (`csvData`) and triggers a re-calculation of metrics.

### 2. Data Processing Logic
Raw data is processed to calculate baseline metrics and simulate AI model performance.
- **Baseline Calculation**:
  - *Accuracy*: Derived from Case Mix Index (CMI).
  - *Turnaround*: Derived from Length of Stay (LOS).
  - *Cost*: Derived from Severity.
  - *Satisfaction*: Derived from CMI and outcomes.
- **Model Simulation**:
  - **AI_v1 (Current)**: Simulated with moderate improvements over baseline (e.g., +8% accuracy).
  - **AI_v2 (Improved)**: Simulated with significant improvements (e.g., +12% accuracy, reduced costs).
- **Aggregation**: Data is aggregated by **Department** and **Month** to generate summary statistics.

### 3. Forecasting Engine
The forecasting tab uses **Linear Regression** to predict future trends.
- **Algorithm**: A custom linear regression function calculates the `slope` and `intercept` based on historical accuracy data.
- **Projection**: Extends the trend line 6 months into the future.
- **Clamping**: Ensures forecasted values stay within realistic bounds (0-100%).

### 4. Visualization Layers
- **KPI Cards**: Show immediate % improvement summaries.
- **Comparison Bar Chart**: Highlights the gap between V1 and V2.
- **Radar Chart**: Displays a multi-dimensional view of performance balance.
- **Trend Charts**: Visualizes historical vs. predicted performance over time.

## 📦 Installation & Setup

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn

### Steps
1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/AI-Model-Comparison.git
   cd AI-Model-Comparison
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run locally**
   ```bash
   npm run dev
   ```
   Access the app at `http://localhost:5173`.

4. **Build for production**
   ```bash
   npm run build
   ```

## ☁️ Deployment
This project is configured for deployment on **Netlify**.
- **Build Command**: `npm run build`
- **Publish Directory**: `dist`
- **Configuration**: See `netlify.toml` for redirect rules.

## 📂 Project Structure
```
├── public/
│   ├── _redirects          # Netlify routing rules
│   └── dummy_hospital_generated.csv  # Raw data source
├── src/
│   ├── App.jsx             # Main application logic & UI
│   ├── main.jsx            # Entry point
│   └── index.css           # Global styles (Tailwind)
├── netlify.toml            # Netlify configuration
├── package.json            # Dependencies & scripts
└── vite.config.js          # Vite configuration
```
