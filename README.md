# 🚚 Track POD - Proof of Delivery Tracking System

A complete, production-ready delivery tracking system with geofence verification, fixed weekly routes, and real-time monitoring. Built with Node.js, MongoDB, and React Native.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![React Native](https://img.shields.io/badge/react--native-0.73.0-blue)](https://reactnative.dev/)
[![MongoDB](https://img.shields.io/badge/mongodb-%3E%3D6.0-green)](https://www.mongodb.com/)

![Track POD Banner](https://via.placeholder.com/1200x400/4CAF50/FFFFFF?text=Track+POD+System)

---

## 📋 Table of Contents

- [Features](#-features)
- [Demo](#-demo)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Usage](#-usage)
- [API Documentation](#-api-documentation)
- [Screenshots](#-screenshots)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)
- [Support](#-support)

---

## ✨ Features

### 🚛 Driver App (React Native)
- ✅ **Fixed Weekly Routes** - Pre-assigned routes for Monday to Saturday
- ✅ **Auto-Unlock System** - Routes automatically unlock at 6 AM daily
- ✅ **Sequential Delivery** - Enforced delivery order (Shop 1 → 2 → 3)
- ✅ **Geofence Verification** - GPS-based location verification (prevents fraud)
- ✅ **Proof of Delivery** - Photo capture + Digital signature
- ✅ **On-Hold Functionality** - Pause deliveries with reasons (break, fuel, traffic)
- ✅ **Offline Support** - Queue updates when offline, sync when connected
- ✅ **Real-time GPS Tracking** - Continuous location monitoring
- ✅ **Push Notifications** - Route unlock alerts & reminders
- ✅ **Delivery History** - View past deliveries with stats

### 📊 Admin Features (Backend API)
- ✅ **Route Builder** - Create and assign weekly routes
- ✅ **Live Tracking** - Monitor all active drivers in real-time
- ✅ **Shop Management** - Add/edit delivery locations with geofence settings
- ✅ **Driver Management** - Manage driver accounts and assignments
- ✅ **Performance Analytics** - Delivery stats, completion rates, timing analysis
- ✅ **Delivery Reports** - Export and analyze delivery data
- ✅ **Auto-Unlock Scheduling** - Automated route unlocking via cron jobs

---

## 🎥 Demo

### Driver App Flow
```
Login → View Today's Route → Start Delivery → Navigate to Shop 
→ Arrive (Geofence Check) → Capture POD → Complete → Next Shop
```

### Admin Dashboard
```
Dashboard → Create Route → Assign to Driver → Monitor Live Deliveries 
→ View Reports → Performance Analytics
```

---

## 🛠 Tech Stack

### Backend
- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT (JSON Web Tokens)
- **File Storage:** Cloudinary / AWS S3
- **Push Notifications:** Firebase Cloud Messaging
- **Job Scheduling:** Node-cron
- **Validation:** Joi
- **Logging:** Winston

### Mobile App
- **Framework:** React Native 0.73
- **Navigation:** React Navigation v6
- **State Management:** Redux Toolkit
- **API Client:** Axios
- **Maps:** React Native Maps
- **Location:** React Native Geolocation Service
- **Distance Calculation:** Geolib
- **Image Picker:** React Native Image Picker
- **Signature Capture:** React Native Signature Canvas
- **Push Notifications:** Firebase Cloud Messaging
- **Storage:** AsyncStorage

### DevOps & Tools
- **Version Control:** Git & GitHub
- **API Testing:** Postman
- **Database GUI:** MongoDB Compass
- **Deployment:** Railway / Render / AWS
- **Monitoring:** PM2 (production)

---

## 🏗 Architecture

```
┌─────────────────┐
│  Driver App     │ (React Native)
│  (iOS/Android)  │
└────────┬────────┘
         │
         │ REST API
         │
┌────────▼────────┐
│  Backend API    │ (Node.js + Express)
│  + Cron Jobs    │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
┌───▼───┐ ┌──▼──────┐
│MongoDB│ │Cloudinary│
│       │ │ / S3    │
└───────┘ └─────────┘
```

### Data Flow
1. **Driver Login** → JWT token issued
2. **Cron Job** (6 AM) → Auto-unlock today's route
3. **Driver** starts delivery → GPS location tracked
4. **Arrive at shop** → Geofence verified
5. **Capture POD** → Photo uploaded to Cloudinary
6. **Complete delivery** → Update database
7. **Admin Dashboard** → View real-time updates

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have:

- **Node.js** 18+ and npm
- **MongoDB** 6+ (local or Atlas)
- **React Native development environment**
  - Android: Android Studio
  - iOS: Xcode (macOS only)
- **Accounts:**
  - [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (Free)
  - [Cloudinary](https://cloudinary.com) (Free)
  - [Firebase](https://console.firebase.google.com) (Free)

---

## 📦 Installation

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/track-pod-system.git
cd track-pod-system
```

### 2. Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your credentials
nano .env
```

### 3. Mobile App Setup

```bash
# Navigate to mobile folder
cd mobile

# Install dependencies
npm install

# iOS only (macOS required)
cd ios && pod install && cd ..

# Create environment file
echo "API_BASE_URL=http://YOUR_IP:3000/api" > .env
```

---

## ⚙️ Configuration

### Backend (.env)

```env
# Server
NODE_ENV=development
PORT=3000

# Database (REQUIRED)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/track-pod

# JWT (REQUIRED)
JWT_SECRET=your-super-secret-key-change-this
JWT_EXPIRES_IN=7d

# Cloudinary (Optional - for images)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Firebase (Optional - for push notifications)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com

# Settings
DEFAULT_GEOFENCE_RADIUS=50
AUTO_UNLOCK_HOUR=6
AUTO_UNLOCK_MINUTE=0
```

### Mobile App (.env)

```env
# Replace with your computer's IP address
# Find it: Windows (ipconfig) | Mac/Linux (ifconfig)
API_BASE_URL=http://192.168.1.100:3000/api
```

---

## 🎯 Usage

### Start Backend Server

```bash
cd backend
npm run dev
```

Server runs at: `http://localhost:3000`

### Start Mobile App

```bash
cd mobile

# Android
npm run android

# iOS
npm run ios
```

### Create Test Data

```javascript
// In Node.js REPL or MongoDB Compass

// 1. Create Driver
db.drivers.insertOne({
  name: "John Doe",
  email: "driver@test.com",
  phone: "+1234567890",
  password: "$2a$10$hashed_password", // Use bcrypt to hash
  vehicleNumber: "ABC123",
  isActive: true
});

// 2. Create Shop
db.shops.insertOne({
  shopName: "Test Store",
  phone: "+1234567890",
  address: "123 Main St, City",
  location: {
    type: "Point",
    coordinates: [74.3587, 31.5204] // [longitude, latitude]
  },
  geofenceRadius: 50,
  isActive: true
});

// 3. Create Route
db.routes.insertOne({
  routeName: "Monday Route",
  driverId: ObjectId("driver_id_here"),
  dayOfWeek: "monday",
  shops: [{
    shopId: ObjectId("shop_id_here"),
    sequenceNumber: 1,
    estimatedTime: 15
  }],
  totalShops: 1,
  isActive: true
});

// 4. Assign Route to Driver
db.drivers.updateOne(
  { email: "driver@test.com" },
  { $set: { "weeklyRoutes.monday": ObjectId("route_id_here") }}
);
```

### Default Login

```
Email: driver@test.com
Password: password123
```

---

## 📡 API Documentation

### Authentication

#### POST `/api/auth/login`
Login driver and get JWT token

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"driver@test.com","password":"password123"}'
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "driver": {
    "_id": "...",
    "name": "John Doe",
    "email": "driver@test.com"
  }
}
```

### Dispatch APIs

#### GET `/api/dispatches/today`
Get today's dispatch for logged-in driver

```bash
curl -X GET http://localhost:3000/api/dispatches/today \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### POST `/api/dispatches/:id/deliveries/:index/start`
Start a delivery

```bash
curl -X POST http://localhost:3000/api/dispatches/DISPATCH_ID/deliveries/0/start \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "location": {
      "latitude": 31.5204,
      "longitude": 74.3587,
      "accuracy": 10
    }
  }'
```

#### POST `/api/dispatches/:id/deliveries/:index/arrive`
Mark delivery as arrived (requires geofence verification)

#### POST `/api/dispatches/:id/deliveries/:index/complete`
Complete delivery with POD

```bash
curl -X POST http://localhost:3000/api/dispatches/DISPATCH_ID/deliveries/0/complete \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "location": {...},
    "podImage": "data:image/jpeg;base64,...",
    "signature": "data:image/png;base64,...",
    "receivedBy": "Customer Name",
    "notes": "Delivered at back door"
  }'
```



---

## 📸 Screenshots

### Mobile App

| Login | Today's Route | Delivery Detail |
|-------|---------------|----------------|
| ![Login](https://via.placeholder.com/250x500/4CAF50/FFFFFF?text=Login) | ![Route](https://via.placeholder.com/250x500/4CAF50/FFFFFF?text=Route) | ![Detail](https://via.placeholder.com/250x500/4CAF50/FFFFFF?text=Detail) |

| POD Capture | History | Profile |
|-------------|---------|---------|
| ![POD](https://via.placeholder.com/250x500/4CAF50/FFFFFF?text=POD) | ![History](https://via.placeholder.com/250x500/4CAF50/FFFFFF?text=History) | ![Profile](https://via.placeholder.com/250x500/4CAF50/FFFFFF?text=Profile) |

---

## 🚀 Deployment

### Backend Deployment (Railway)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Deploy
railway up

# Add environment variables in Railway dashboard
```

### Mobile App Deployment

#### Android (Google Play)

```bash
cd android

# Generate release keystore
keytool -genkeypair -v -storetype PKCS12 \
  -keystore my-release-key.keystore \
  -alias my-key-alias \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000

# Build release APK
./gradlew assembleRelease

# APK location
# android/app/build/outputs/apk/release/app-release.apk
```

#### iOS (App Store)

1. Open `ios/TrackPOD.xcworkspace` in Xcode
2. Select "Any iOS Device"
3. Product → Archive
4. Upload to App Store Connect

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines

- Follow existing code style
- Add tests for new features
- Update documentation
- Test on both iOS and Android

---

## 📝 License

This project is licensed under the MIT License.

```
MIT License

Copyright (c) 2024 Track POD

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
```

---

## 🐛 Known Issues

- [ ] iOS signature capture may require additional permissions
- [ ] Background location tracking drains battery (optimization needed)
- [ ] Large POD images may take time to upload on slow connections



---

## 🗺 Roadmap

### Version 1.1
- [ ] Barcode scanning for packages
- [ ] Customer SMS notifications
- [ ] Multi-language support (Spanish, French)
- [ ] Dark mode UI

### Version 2.0
- [ ] Route optimization algorithm
- [ ] Cash collection tracking
- [ ] Driver performance gamification
- [ ] Advanced analytics dashboard
- [ ] Web admin dashboard

---

## 💬 Support

- **Documentation:** [Full Docs]
- **Issues:** [GitHub Issues]
- **Email:** azeemkhannnn7@gmail.com

---

## 👥 Authors

- **Your Name** - *Initial work* - [@yourusername](https://github.com/yourusername)

See also the list of [contributors](https://github.com/yourusername/track-pod-system/contributors) who participated in this project.

---

## 🙏 Acknowledgments

- Thanks to all contributors
- Inspired by real-world delivery challenges
- Built with ❤️ using open-source technologies

---

## 📊 Project Stats

![GitHub stars](https://img.shields.io/github/stars/yourusername/track-pod-system?style=social)
![GitHub forks](https://img.shields.io/github/forks/yourusername/track-pod-system?style=social)
![GitHub issues](https://img.shields.io/github/issues/yourusername/track-pod-system)
![GitHub pull requests](https://img.shields.io/github/issues-pr/yourusername/track-pod-system)

---

<p align="center">
  Made with ❤️ for delivery businesses worldwide
</p>

<p align="center">
  <a href="#-table-of-contents">Back to top ⬆️</a>
</p>