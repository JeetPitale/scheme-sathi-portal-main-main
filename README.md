# 🇮🇳 Scheme Sarthi — Government Scheme Discovery Portal

> **Your one-stop companion to discover, understand, and apply for government welfare schemes across India.**

Scheme Sarthi (स्कीम सारथी) is a modern, multilingual web portal that helps Indian citizens navigate the complex landscape of government welfare schemes — from pensions and health insurance to education grants, startup funding, and more.

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-State-orange)
![PWA](https://img.shields.io/badge/PWA-Enabled-brightgreen)

---

## ✨ Features

### For Citizens
- 🔍 **Smart Scheme Discovery** — Search and filter 400+ welfare schemes by category, state, and eligibility
- 🎙️ **Voice Search** — Find schemes using voice commands in multiple languages
- 📋 **One-Click Applications** — Apply to schemes with auto-filled forms
- 📊 **Application Tracking** — Real-time status timeline (pending → under review → approved/rejected)
- 🔔 **Notification Engine** — Instant alerts on application updates, new schemes, and announcements
- 🌐 **Multilingual** — Available in Hindi, English, Marathi, Tamil, Telugu, Bengali, Gujarati, Kannada, and Malayalam
- ✅ **Eligibility Checker** — Answer quick questions to find schemes you qualify for
- 🤖 **AI Chatbot** — In-app assistant to answer scheme-related queries
- 🌙 **Dark Mode** — Eye-friendly theme with system preference detection

### For Administrators
- 🛡️ **Multi-Role RBAC** — Three distinct admin roles with granular permissions:
  | Role | Access |
  |------|--------|
  | **Super Admin** | Full access: schemes, users, applications, audit logs, roles, notifications |
  | **Content Admin** | Manage schemes, view users, send notifications |
  | **Review Admin** | Review and approve/reject applications |
- 📊 **Analytics Dashboard** — User stats, application metrics, and category-wise data
- 📝 **Audit Logs** — Immutable, tamper-proof trail of every admin action (Super Admin only)
- 📨 **Notification Broadcasting** — Send targeted or broadcast notifications to users
- 📄 **Pagination** — Efficient pagination across all data tables
- ⚙️ **Maintenance Mode** — One-click portal maintenance toggle

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | React 18 + Vite 5 |
| **Styling** | Tailwind CSS + shadcn/ui |
| **State Management** | Zustand (persisted stores) |
| **Routing** | React Router v6 |
| **Forms** | React Hook Form + Zod validation |
| **Icons** | Lucide React |
| **Notifications** | Sonner (toast) |
| **PWA** | Vite PWA Plugin |
| **Data Persistence** | localStorage (service layer) |

---

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Admin/           # Admin layout, sidebar
│   ├── Chatbot/         # AI chatbot widget
│   ├── Layout/          # Header, Footer, Layout wrapper
│   ├── Onboarding/      # Language modal, walkthrough
│   ├── ui/              # shadcn/ui primitives
│   ├── NotificationBell.jsx
│   ├── Pagination.jsx
│   ├── StatusTimeline.jsx
│   └── ThemeToggle.jsx
├── data/                # Static scheme data (400+ schemes)
├── hooks/               # Custom hooks (useTranslation, useMobile)
├── lib/                 # Core utilities
│   ├── rbac.js          # Role-Based Access Control
│   ├── pagination.js    # Pagination utility
│   ├── store.js         # Zustand stores (auth, app, notif, theme)
│   └── utils.js
├── pages/               # Route pages
│   ├── admin/           # Admin panel pages
│   │   ├── AdminDashboard.jsx
│   │   ├── AdminSchemes.jsx
│   │   ├── AdminUsers.jsx
│   │   ├── AdminApplications.jsx
│   │   ├── AdminNotifications.jsx
│   │   ├── AdminAnalytics.jsx
│   │   ├── AdminSettings.jsx
│   │   ├── AdminRoles.jsx
│   │   └── AdminLogin.jsx
│   ├── Dashboard.jsx
│   ├── Services.jsx
│   ├── Eligibility.jsx
│   ├── ApplicationDetail.jsx
│   └── ...
├── services/            # Data access layer
│   ├── UserService.js
│   ├── ApplicationService.js
│   ├── NotificationService.js
│   ├── SchemeService.js
│   └── AuditService.js
├── stores/              # Additional Zustand stores
│   ├── schemeStore.js
│   └── auditStore.js
└── translations/        # i18n language files
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18.x
- **npm** ≥ 9.x

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/scheme-sathi-portal.git

# Navigate to the project
cd scheme-sathi-portal

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be available at `http://localhost:5173`.

### Build for Production

```bash
npm run build
```

Output is generated in the `dist/` directory, ready for deployment.

---

## 🔐 Demo Accounts

### User Account
| Field | Value |
|-------|-------|
| Mobile | `9876543210` |
| MPIN | `1234` |

### Admin Accounts
| Email | Password | Role |
|-------|----------|------|
| `admin@schemesarthi.gov.in` | `Admin@123` | Super Admin |
| `content@schemesarthi.gov.in` | `Content@123` | Content Admin |
| `reviewer@schemesarthi.gov.in` | `Reviewer@123` | Review Admin |

Access the admin panel at `/admin/login`.

---

## 📊 Application Status Flow

```
  ┌─────────┐     ┌──────────────┐     ┌──────────┐
  │ Pending │ ──▶ │ Under Review │ ──▶ │ Approved │
  └─────────┘     └──────────────┘     └──────────┘
                         │
                         ▼
                    ┌──────────┐
                    │ Rejected │  (requires remarks)
                    └──────────┘
```

---

## 🔒 RBAC Permission Matrix

| Permission | Super Admin | Content Admin | Review Admin |
|------------|:-----------:|:-------------:|:------------:|
| Add / Edit Schemes | ✅ | ✅ | ❌ |
| Delete Schemes | ✅ | ❌ | ❌ |
| Approve / Reject Apps | ✅ | ❌ | ✅ |
| View Users | ✅ | ✅ | ❌ |
| View Audit Logs | ✅ | ❌ | ❌ |
| Manage Roles | ✅ | ❌ | ❌ |
| Send Notifications | ✅ | ✅ | ❌ |

---

## 🌐 Supported Languages

Hindi · English · Marathi · Tamil · Telugu · Bengali · Gujarati · Kannada · Malayalam

---

## 📜 License

This project is for educational and demonstration purposes.

---

<p align="center">
  Built with ❤️ for Digital India 🇮🇳
</p>
