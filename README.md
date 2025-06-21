# Hussaini Welfare Association

A role-based donation management app with event tracking, analytics, Razorpay donations, invoice generation via Zoho, and role management. Built using Firebase and Next.js.

---

## Preview

_Add screenshots here (Dashboard, Donation Flow, Analytics, etc.)_

---

## Project Overview

This platform allows users to:

- Register/login via email or Google
- Confirm email before login (for email signups)
- Donate securely through Razorpay
- Get invoice via Zoho automatically
- View donation and user growth analytics
- Attend/view categorized events
- Track their donation history
- Admins can approve members and manage roles

---

## 🧑‍💻 Tech Stack

| Layer         | Tools                             |
|---------------|-----------------------------------|
| Frontend      | Next.js, React, Tailwind CSS      |
| Backend/API   | Next.js API Routes                |
| Auth          | Firebase Authentication           |
| Database      | Firebase Firestore                |
| Payments      | Razorpay                          |
| Invoices      | Zoho Books                        |
| Charts        | Recharts / Chart.js               |
| Deployment    | Vercel                            |

---

## 🛠️ Setup Instructions

### 1. Clone the Repo

```bash
git clone https://github.com/nikhilsaiankilla/ngo.git
cd ngo

npm install

```

```bash
.env.local

NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=""
NEXT_PUBLIC_FIREBASE_API_KEY=""
NEXT_PUBLIC_FIREBASE_PROJECT_ID=""
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=""
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=""
NEXT_PUBLIC_FIREBASE_APP_ID=""
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=""
NEXT_PUBLIC_RAZORPAY_KEY_ID=""

FIREBASE_PROJECT_ID=""
FIREBASE_CLIENT_EMAIL=""
FIREBASE_PRIVATE_KEY=""


RAZORPAY_KEY_ID=""
RAZORPAY_KEY_SECRET=""

CRON_SECRET=""

# //ZOHO INVOICE KEYS 
ZOHO_CLIENT_ID=""
ZOHO_CLIENT_SECRET=""

# ZOHO_REDIRECT_URL="https://accounts.zoho.in/oauth/v2/auth?scope=ZohoInvoice.invoices.CREATE,ZohoInvoice.contacts.CREATE,ZohoInvoice.invoices.READ&client_id=YOUR_CLIENT_ID&response_type=code&access_type=offline&redirect_uri=http://localhost:3000/api/zoho/callback"

ZOHO_REFRESH_TOKEN=""
ZOHO_ORG_ID=""

CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""

EMAIL_PASSWORD=""
EMAIL_ID=""

```

```bash
npm run dev

```

```bash

├── components/       # Reusable UI components
├── app/            # Next.js Routes
│   ├── api/          # API Handlers
│   ├── dashboard/    # Authenticated routes including profile, analytics, etc.
│   │   ├── profile.js
│   │   ├── analytics.js
│   │   └── ...
│   ├── donate.js
│   └── index.js      # Landing or redirect logic
├── lib/              # Firebase config, helper methods
├── utils/            # Utility functions
├── public/           # Images/assets

```

## Features

### Authentication

- Manual sign-up (email + password)
- Email verification required before login
- Google login (verification not required)
- Unique username required on signup
- forget password

### Dashboard

- Personalized content based on role
- Role-based navigation links

### Profile Page
- View profile info (name, photo, email, phone)
- Mobile verification
- Upgrade role form (if applicable)
- Role approval history (e.g., Regular → Member with approver and date)
- Logout button

### Events

- View events as categorized cards:
- - Ongoing
- - Upcoming
- - Past

### Donations

- Donation input (amount)
- Razorpay payment
- Auto-invoice generation (Zoho)
- Email confirmation
- All data stored in Firebase
- Redirect to success page after donation

### My Donations
- List of all donations (success & failed)
- PDF download of receipts

### Analytics

- Graphs for:
- - Total users
- - Role-based growth
- - Donations (monthly/yearly)

### Admin (Upper Trustie) Features

- Add manual donations (cash/cheque)
- View & act on role upgrade requests
- Accept/reject with reason
- View interested people
- Track attendance

### Pending Tasks

- Final copywriting polish
- Replace with original images
- Privacy Policy + Terms content

### Contributing
- Fork this repo
- Create a branch (git checkout -b feat/feature-name)
- Commit your changes
- Push and create a PR

### Contact
Made by Nikhil Sai Ankilla
- nikhilsaiankilla@gmail.com
- https://nikhilsaiportfolio.vercel.app