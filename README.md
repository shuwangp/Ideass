# IdeaBubble AI-Assist

**"AI-Powered Idea Organizer"** — แพลตฟอร์มช่วยจัดการไอเดีย คัดกรอง และจัดลำดับความสำคัญของไอเดีย เพื่อให้คุณสามารถโฟกัสกับสิ่งที่สำคัญและต่อยอดได้อย่างมีประสิทธิภาพ

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Node](https://img.shields.io/badge/node-%3E%3D%2018.0.0-brightgreen.svg)
![React](https://img.shields.io/badge/react-18.3.1-blue.svg)

---

## 🚀 คุณสมบัติหลัก (Key Features)

### 💡 การจัดการไอเดีย (Idea Management)
- **สร้างและแก้ไขไอเดีย** - ระบบ Rich Text Editor ที่สมบูรณ์
- **หมวดหมู่และการแท็ก** - ระบบจัดหมวดหมู่ไอเดียด้วย Tags และ Categories
- **ระบบคะแนน** - ระบบโหวตขึ้น/ลง และการจัดลำดับความสำคัญ
- **สถานะไอเดีย** - ติดตามสถานะ (pending, approved, rejected, implemented)

### 🤖 AI Assistant
- **AI Idea Analysis** - วิเคราะห์ไอเดียด้วย Google Gemini AI
- **ความเคนคะแนน AI** - ประเมินความเป็นไปได้, ความใหม่ และผลกระทบ
- **AI Improvement Suggestions** - แนะนำการปรับปรุงไอเดียอย่างชาญฉลาด
- **AI Search** - ค้นหาไอเดียด้วยคำแนะนำจาก AI
- **Smart Categorization** - ช่วยจัดหมวดหมู่และแท็กอัตโนมัติ

### 📊 Analytics และ Insights
- **Dashboard Analytics** - วิเคราะห์รูปแบบการสร้างไอเดีย
- **User Engagement Tracking** - ติดตามการมีส่วนร่วมของผู้ใช้
- **Performance Metrics** - ค่าเมตริกประสิทธิภาพแบบเรียลไทม์

### 🔐 ความปลอดภัยและผู้ใช้
- **Authentication System** - ระบบล็อกอิน/สมัครสมาชิกที่ปลอดภัย
- **User Profiles** - จัดการโปรไฟล์และอัปโหลด Avatar
- **JWT Authentication** - การยืนยันตัวตนที่ปลอดภัย
- **Rate Limiting** - ป้องกันการใช้งาน API ส่วนเกิน

---

## 🛠️ เทคโนโลยีที่ใช้ (Technology Stack)

### Frontend
- **React 18.3.1** - UI Framework หลัก
- **Vite** - Build Tool และ Dev Server
- **Tailwind CSS** - CSS Framework
- **React Router v6** - Client-side Routing
- **React Query** - Server State Management
- **Zustand** - Client State Management
- **React Hook Form** - Form Management
- **Framer Motion** - Animations
- **Axios** - HTTP Client

### Backend
- **Node.js** - Runtime Environment
- **Express.js** - Web Framework
- **MongoDB** - NoSQL Database
- **Mongoose** - ODM สำหรับ MongoDB
- **JWT** - Authentication
- **Google Generative AI** - AI Integration
- **Multer** - File Upload Handling
- **bcryptjs** - Password Hashing

---

## 📋 ความต้องการของระบบ (Prerequisites)

- **Node.js** >= 18.0.0
- **npm** หรือ **yarn**
- **MongoDB** >= 4.4
- **Google AI API Key** (สำหรับ AI Features)

---

## 🔌 API Endpoints หลัก

### Authentication
- `POST /api/auth/login` - เข้าสู่ระบบ
- `POST /api/auth/register` - สมัครสมาชิก
- `GET /api/auth/profile` - ดูข้อมูลโปรไฟล์

### Ideas
- `GET /api/ideas` - อ่านรายการไอเดียทั้งหมด
- `POST /api/ideas` - สร้างไอเดียใหม่
- `GET /api/ideas/:id` - อ่านไอเดียตาม ID
- `PUT /api/ideas/:id` - แก้ไขไอเดีย

### AI Features
- `POST /api/ai/analyze/:id` - วิเคราะห์ไอเดียด้วย AI
- `POST /api/ai/improve/:id` - ขอคำแนะนำจาก AI
- `POST /api/ai/search` - ค้นหาด้วย AI

### Analytics
- `GET /api/analytics/dashboard` - ข้อมูล Dashboard
- `GET /api/analytics/trends` - เทรนด์การใช้งาน

---

## 🎯 การใช้งานหลัก (How to Use)

### 1. การสร้างไอเดียใหม่
1. คลิก "New Idea" จากเมนูซ้าย
2. กรอกข้อมูล Title, Description, Category และ Tags
3. เลือก Priority Level
4. คลิก "Create Idea"

### 2. การใช้ AI Assistant
1. ไปที่หน้าไอเดียที่ต้องการวิเคราะห์
2. คลิกปุ่ม "AI Analysis"
3. ดูผลการวิเคราะห์จาก AI
4. นำเสนอการปรับปรุงไปใช้ตามต้องการ
---

## 📄 License
---

## 📞 ติดต่อและสนับสนุน (Support)
- **Git**: [GitHub Discussions](https://github.com/shuwangp)
