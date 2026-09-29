# 🛰️ Orbital — Satellite Intelligence

> **Semantic Retrieval and Multi-Temporal Change Analysis of Satellite Imagery**

**Orbital** is a responsive full-stack Next.js prototype that helps users discover relevant satellite imagery, compare observations across time, identify representative changes, and generate analysis reports through a unified geospatial intelligence workflow.

---

## 🔗 Project Links

### 🌐 Live Demo

https://satellite-intelligence-analysis-pla.vercel.app/

### 💻 GitHub Repository

https://github.com/subhendu1913/satellite-intelligence-analysis-platform

---

## 🎯 Problem Statement

### Semantic Retrieval and Multi-Temporal Change Analysis of Satellite Imagery

Satellite imagery contains valuable information for defence, disaster management, environmental monitoring, urban planning, agriculture, infrastructure, and other applications.

However, finding relevant imagery for a specific location and understanding how that location has changed across different time periods can require multiple tools and manual analysis.

The challenge is to provide a unified platform for:

* Semantic retrieval of relevant satellite imagery
* Multi-temporal image comparison
* Change identification
* Impact analysis
* Human-readable interpretation
* Report generation

---

# 💡 Our Solution

**Orbital** provides a single platform where users can:

1. Select an organization or mission
2. Search for a location
3. Search using natural-language queries
4. Retrieve relevant satellite scenes
5. Compare imagery across different time periods
6. Identify representative change regions
7. View impact information on an interactive map
8. Generate AI-assisted insights
9. Generate and download analysis reports

### Core Workflow

```text
DISCOVER
   ↓
RETRIEVE
   ↓
COMPARE
   ↓
DETECT
   ↓
EXPLAIN
   ↓
REPORT
```

---

# 🚀 Key Features

## 🔎 Semantic Satellite Search

Users can search for locations and observations using natural-language queries.

Example:

```text
"Show flood-affected areas around Kochi"
```

The prototype retrieves relevant locations and satellite scenes from its demonstration catalog.

---

## 🛰️ Satellite Scene Retrieval

The platform provides:

* Satellite scene previews
* Location information
* Observation metadata
* Search results
* Mission-specific imagery

---

## 🗺️ Interactive Map Explorer

The map interface supports:

* Location search
* Coordinates
* Map markers
* Zoom
* Fullscreen mode
* Area of Interest selection
* Satellite imagery reference layers
* Demonstration change overlays

---

## ⏱️ Multi-Temporal Analysis

Users can compare:

```text
BEFORE
   ↓
DURING
   ↓
AFTER
   ↓
RECOVERY
```

The interface provides timeline-based observation selection and a swipe comparison experience.

---

## 🔍 "WHAT CHANGED HERE?"

The change-analysis workflow highlights representative change regions and provides associated impact information.

Users can inspect:

* Change regions
* Representative statistics
* Confidence information
* Impact information
* Recovery observations

---

## 🤖 AI-Assisted Insight

The platform presents human-readable AI-assisted interpretation of the demonstrated observations and detected changes.

> **Important:** The current prototype uses deterministic demonstration logic and does not represent trained operational AI inference.

---

## 🚨 Emergency Analysis

The platform demonstrates an emergency monitoring workflow:

```text
Pre-Event Observation
        ↓
During-Event Observation
        ↓
Change / Impact Analysis
        ↓
Recovery Monitoring
```

This can be demonstrated using the **Disaster Management → Flood Analysis → Kochi** workflow.

---

## 📄 Report Generation

Users can generate an analysis report and download it as a PDF.

The prototype also supports:

* PDF reports
* CSV history export
* JSON workspace backup

---

# 🌍 Demonstrated Use Cases

The prototype supports multiple organizational workflows:

* **Defence & Security**
* **Disaster Management**
* **Weather / Meteorological Analysis**
* **Environment & Forest**
* **Urban Planning**
* **Agriculture**
* **Infrastructure Monitoring**

---

# 🧑‍💻 Technology Stack

### Frontend

* Next.js
* React
* TypeScript
* CSS
* Leaflet

### Backend

* Next.js App Router
* Next.js API Routes
* REST-style API endpoints
* Shared data-service layer

### Data

* Local JSON catalog
* Bundled satellite reference imagery
* Browser localStorage for prototype persistence

### Mapping

* Leaflet
* OpenStreetMap
* Esri World Imagery

### Reports

* jsPDF
* CSV export
* JSON workspace backup

### Deployment

* GitHub
* Vercel

---

# 🏗️ System Architecture

```text
                       USER
                         │
                         ▼
                ┌─────────────────┐
                │  Next.js UI     │
                │ React + TS      │
                └────────┬────────┘
                         │
                         ▼
                ┌─────────────────┐
                │ Data Service    │
                │ Adapter         │
                └────────┬────────┘
                         │
             ┌───────────┴───────────┐
             ▼                       ▼
     ┌──────────────┐        ┌──────────────┐
     │ Next.js APIs │        │ Local JSON   │
     │ /api/*       │        │ Catalog      │
     └──────┬───────┘        └──────┬───────┘
            │                       │
            └───────────┬───────────┘
                        ▼
              ┌───────────────────┐
              │ Analysis Workflow │
              └─────────┬─────────┘
                        │
          ┌─────────────┼─────────────┐
          ▼             ▼             ▼
      Retrieval     Comparison    Change Analysis
          │             │             │
          └─────────────┼─────────────┘
                        ▼
               ┌────────────────┐
               │ Report Engine  │
               └────────────────┘
```

---

# 🔌 API Routes

The prototype contains the following Next.js API routes:

```text
/api/catalog
/api/search
/api/analyze
/api/reports
/api/health
```

These routes allow the frontend to communicate with the application's data and analysis layer.

---

# 🧭 Application Routes

Important application routes include:

```text
/welcome
/login
/register
/organizations
/missions
/search
/map
/temporal
/emergency
/changes
/reports
/history
/saved
/settings
```

---

# 🎬 Recommended Two-Minute Demo

For a quick judge demonstration:

### Step 1 — Enter Demo Workspace

Open:

```text
/login
```

Select:

**Enter Demo Workspace**

---

### Step 2 — Select Mission

Choose:

```text
Disaster Management
        ↓
Flood Analysis
        ↓
Kochi
```

Then continue to the dashboard.

---

### Step 3 — Start Analysis

Select:

```text
New Analysis
        ↓
Configure Analysis
```

---

### Step 4 — Compare Time Periods

Inspect:

```text
Before
During
After
Recovery
```

Use the timeline and swipe comparison slider.

---

### Step 5 — Detect Changes

Select:

```text
WHAT CHANGED HERE?
```

Inspect the representative change region and impact information.

---

### Step 6 — Review Insight

Read the **AI-Assisted Insight** generated for the demonstration analysis.

---

### Step 7 — Monitor Recovery

Open:

```text
Monitor Recovery
```

to inspect the recovery workflow.

---

### Step 8 — Generate Report

Select:

```text
Generate Emergency Report
        ↓
View Report
        ↓
Download PDF
```

---

# 🌳 Second Demo — Environmental Monitoring

To demonstrate another use case:

```text
Environment & Forest
        ↓
Deforestation Analysis
        ↓
Amazon Basin
```

Then repeat the temporal comparison and change-analysis workflow.

---

# 💻 Run Locally

## Requirements

* Node.js 20.9 or later
* npm

## Installation

Clone the repository:

```bash
git clone https://github.com/subhendu1913/satellite-intelligence-analysis-platform.git
```

Enter the project:

```bash
cd satellite-intelligence-analysis-platform
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

# 🏭 Production Build

To test the production build:

```bash
npm run build
```

The application can be deployed to Vercel directly from the GitHub repository.

---

# 🛰️ Bundled Satellite Assets

All required demonstration satellite imagery is included inside:

```text
public/images/satellite/
```

The prototype does not depend on temporary Arena-hosted image URLs.

The bundled assets support the application's:

* Search results
* Scene previews
* Location cards
* Mission selection
* Temporal comparison
* Change analysis
* Emergency views
* Reports

---

# 🛡️ Offline Asset Recovery

The project includes asset verification and recovery scripts.

Verify satellite assets:

```bash
node scripts/verify-satellite-assets.mjs
```

Repair missing satellite assets:

```bash
node scripts/ensure-satellite-images.mjs
```

Normally, these commands are not required for ordinary application use.

---

# ⚠️ Prototype Limitations

> **DEMO DATA / PROTOTYPE ANALYSIS**

This project is a hackathon prototype.

The following information is simulated for demonstration purposes:

* Satellite observation dates
* Satellite-source metadata
* Cloud percentages
* Change detections
* Confidence values
* Impact statistics
* AI-assisted explanations

Some locations use representative imagery rather than verified date-specific acquisitions.

### Semantic Search

The current prototype uses:

```text
Keyword / Tag Matching
```

rather than production vector embeddings.

### Change Detection

The current change-detection workflow is a deterministic demonstration and does not represent trained machine-learning inference.

### Authentication

Login and registration currently use browser-local demonstration accounts.

They are not production identity management.

### Data Storage

Generated workspace information is stored in the browser using localStorage.

This is appropriate for a prototype but is not suitable for confidential operational intelligence.

> **Operational Disclaimer:** This platform demonstrates observation and impact assessment. It should not be treated as an operational intelligence or disaster-prediction system.

---

# 🔮 Future Production Architecture

A production implementation can replace the demonstration components with:

```text
                 Frontend
                    ↓
           Authenticated API
                    ↓
          PostgreSQL + PostGIS
                    ↓
                 pgvector
                    ↓
          Satellite Data Sources
                    ↓
          ML Change Detection
                    ↓
          LLM-Assisted Analysis
                    ↓
             Secure Reports
```

Potential future improvements:

* Real satellite data APIs
* Vector embeddings
* PostgreSQL/PostGIS
* pgvector
* Production authentication
* Multi-tenant authorization
* ML-based change detection
* Real-time satellite ingestion
* Secure cloud storage
* GPU-based image processing
* Role-based access control

---

# 📁 Project Structure

```text
satellite-intelligence-analysis-platform/
│
├── src/
│   ├── app/
│   │   ├── api/
│   │   ├── page.tsx
│   │   ├── layout.tsx
│   │   └── ...
│   │
│   ├── data/
│   │   └── *.json
│   │
│   └── lib/
│       ├── types.ts
│       ├── data-service.ts
│       └── ...
│
├── components/
│
├── public/
│   └── images/
│       └── satellite/
│
├── assets/
│
├── scripts/
│
├── package.json
├── next.config.ts
├── tsconfig.json
├── postcss.config.mjs
└── README.md
```

---

# 📊 Project Status

| Component                 | Status          |
| ------------------------- | --------------- |
| Responsive Web Interface  | ✅               |
| Mission Selection         | ✅               |
| Organization Selection    | ✅               |
| Location Search           | ✅               |
| Satellite Scene Retrieval | ✅ Prototype     |
| Interactive Map           | ✅               |
| Temporal Comparison       | ✅ Prototype     |
| Change Analysis           | ✅ Prototype     |
| AI-Assisted Insight       | ✅ Demonstration |
| Emergency Workflow        | ✅               |
| Recovery Monitoring       | ✅               |
| PDF Report                | ✅               |
| CSV Export                | ✅               |
| JSON Backup               | ✅               |
| Local Satellite Assets    | ✅               |
| Next.js API Routes        | ✅               |
| Vercel Deployment         | ✅               |

---

# 👥 Hackathon Information

**Project Name:** Orbital — Satellite Intelligence

**Problem Statement:**
Semantic Retrieval and Multi-Temporal Change Analysis of Satellite Imagery

**Project Type:**
Full-Stack Web Application

**Prototype:**
Next.js + React + TypeScript

**Deployment:**
Vercel

**Source Code:**
GitHub

---

# 📌 Project Links

### Live Demo

https://satellite-intelligence-analysis-pla.vercel.app/

### Source Code

https://github.com/subhendu1913/satellite-intelligence-analysis-platform

---

# ⭐ Core Idea

> **One Platform. Any Location. Multiple Missions. Intelligent Change Analysis.**

```text
Search
   ↓
Retrieve
   ↓
Compare
   ↓
Detect
   ↓
Explain
   ↓
Report
```

---

## Attribution

Satellite reference imagery:

* Esri World Imagery
* Maxar
* Earthstar Geographics

Street maps:

* © OpenStreetMap contributors

Other libraries:

* Leaflet
* jsPDF
* Lucide
* Inter

Source attribution remains visible in the application where applicable.
