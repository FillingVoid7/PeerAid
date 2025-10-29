# PeerAid

**A Peer-to-Peer Verified Health Experience Platform**

*"Find your health twin. Connect with someone who truly knows what you're going through."*

---

## 🎯 Overview

PeerAid connects individuals facing health challenges (**Seekers**) with those who have successfully navigated similar conditions (**Guides**). Built on authenticated experience rather than medical authority, our platform provides structured, empathetic peer support through verified health journeys.

### The Problem We Solve

Traditional health communities suffer from:
- **Unverified anecdotes** and misinformation
- **Noise and irrelevance** - difficulty finding exact symptom/demographic matches
- **Lack of structure** in conversations and advice
- **Risk of dangerous non-medical guidance**

### Our Solution

A Tinder-like matching system that pairs people based on:
- ✅ **Verified health experiences** (optional medical document verification)
- 🎯 **Precise symptom and demographic matching**
- 📊 **Structured health profiles** with standardized data
- 💬 **Private, secure communication channels**

---

## 🚀 Key Features

### 🔍 Smart Matching Algorithm
- **Match Score Calculation**: Weighted algorithm considering symptoms, demographics, treatments, and verification status
- **Role-Based Matching**: Seekers (ongoing conditions) matched with Guides (resolved conditions)
- **Advanced Filtering**: Age, gender, blood type, location, and condition-specific criteria

### 👤 Structured Health Profiles
- **Personal Information**: Age, gender, nationality, blood type, contact preferences
- **Condition Details**: Category, onset timeline, symptom severity and frequency
- **Treatment History**: Medications, therapies, lifestyle changes with effectiveness ratings
- **Verification Options**: Self-declared, community-validated, or medical document verification

### 💬 Real-Time Communication
- **Secure Chat Interface** with typing indicators
- **Audio Calling** via WebRTC for deeper conversations
- **Connection Management** with request/accept workflow

### 🏥 Medical Verification System
- **Document Upload**: Redacted medical records for authenticity
- **Verification Badges**: Visual trust indicators
- **Privacy-First**: All personal information secured and encrypted

---

## 🚦 Getting Started

### Prerequisites
- Node.js 18+ 
- MongoDB instance

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/FillingVoid7/PeerAid.git
   cd peer-aid
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Configure your MongoDB URI, NextAuth secret, Cloudinary credentials, etc.
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 🎮 User Journey

### 1. **Onboarding**
- Choose role: Seeker (ongoing condition) or Guide (resolved condition)
- Complete structured health profile
- Optional medical document verification

### 2. **Matching** (For Seekers)
- Browse potential Guides with match scores
- Swipe right to send connection requests
- View detailed compatibility breakdowns

### 3. **Connection**
- Guides receive and can accept/decline requests
- Matched users unlock private chat channels
- Option for voice calls for deeper conversations

### 4. **Support Exchange**
- Share experiences, treatments, and coping strategies
- Structured conversation guided by profile data
- Rate and provide feedback on connections

---

## 🔒 Privacy & Safety

- **No Personal Identifiable Information (PII)** sharing
- **Encrypted communications** and secure data storage
- **Mandatory disclaimers**: "This is not medical advice"
- **Easy reporting tools** for inappropriate content

---

**⚠️ Important Disclaimer**: PeerAid provides peer support based on shared experiences. It is not a substitute for professional medical advice, diagnosis, or treatment. Always consult qualified healthcare providers for medical decisions.
