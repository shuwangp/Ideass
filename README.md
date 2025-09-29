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

## 🔧 การติดตั้งและตั้งค่า (Installation & Setup)

### 1. ติดตั้งจาก Repository

```bash
# Clone repository
git clone https://github.com/your-username/AI-Powered-Idea-Management.git
cd AI-Powered-Idea-Management

# ติดตั้ง dependencies สำหรับทั้ง frontend และ backend
npm run install:all
```

### 2. ตั้งค่า Backend

```bash
cd backend

# ติดตั้ง dependencies
npm install

# สร้างไฟล์ .env
cp .env.example .env
```

แก้ไขไฟล์ `.env` ในโฟลเดอร์ backend:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/ai-idea-management

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# Server
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# AI Configuration
GOOGLE_API_KEY=your-google-api-key-here
AI_MODEL=gemini-1.5-flash
AI_MAX_TOKENS=1000
AI_TEMPERATURE=0.7

# Rate Limiting
AI_RATE_LIMIT_PER_HOUR=50
AI_RATE_LIMIT_PER_DAY=200
```

เริ่มต้น Backend server:

```bash
npm run dev
```

### 3. ตั้งค่า Frontend

```bash
cd frontend

# ติดตั้ง dependencies
npm install

# สร้างไฟล์ .env
cp .env.example .env
```

แก้ไขไฟล์ `.env` ในโฟลเดอร์ frontend:

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_OPENAI_API_KEY=your_openai_api_key_here
```

เริ่มต้น Frontend development server:

```bash
npm run dev
```

### 4. เข้าถึงแอปพลิเคชัน

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000

---

## 🗂️ โครงสร้างโปรเจกต์ (Project Structure)

```
AI-Powered-Idea-Management/
├── frontend/                 # React Frontend
│   ├── src/
│   │   ├── components/      # UI Components
│   │   │   ├── ai/          # AI-related components
│   │   ├── pages/           # Page Components
│   │   ├── services/        # API Services
│   │   ├── hooks/           # Custom Hooks
│   │   └── config/          # Configuration
│   ├── package.json
│   └── vite.config.ts
├── backend/                 # Node.js Backend
│   ├── controllers/         # Route Controllers
│   ├── models/              # Database Models
│   ├── routes/              # API Routes
│   ├── middleware/          # Custom Middleware
│   ├── utils/               # Utility Functions
│   ├── config/              # Configuration
│   └── server.js
├── package.json            # Root package.json
└── README.md
```

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

### 3. การค้นหาไอเดีย
- **Search Bar**: ค้นหาด้วยคำสำคัญ
- **Filter**: กรองตาม Category, Status, Priority
- **AI Search**: ค้นหาด้วยคำแนะนำจาก AI

---

## 🧪 การทดสอบ (Testing)

```bash
# ทดสอบ Frontend
cd frontend
npm run test

# ทดสอบ Backend
cd backend
npm run test

# ทดสอบทั้งระบบ
npm run test:all
```

---

## 🚀 การ Deploy

### Development Environment
```bash
# เริ่มต้น Backend
npm run dev:backend

# เริ่มต้น Frontend
npm run dev:frontend
```

### Production Environment
```bash
# Build Frontend
npm run build:frontend

# เริ่มต้น Production Server
npm run start:production
```

---

## 📈 การจัดการข้อมูล (Data Management)

### Database Features
- **MongoDB Atlas** - Cloud Database Support
- **Indexing** - Optimized queries สำหรับ Performance
- **Full-text Search** - ระบบค้นหาข้อความสมบูรณ์
- **Data Validation** - การตรวจสอบข้อมูลด้วย Mongoose

### File Upload
- **Avatar Pictures** - อัปโหลดรูปโปรไฟล์
- **Attachments** - แนบไฟล์ในไอเดีย
- **Image Compression** - บีบอัดรูปภาพอัตโนมัติ

---

## 🔒 ความปลอดภัย (Security Features)

- **JWT Authentication** - Secure token-based auth
- **Password Hashing** - bcrypt encryption
- **Rate Limiting** - ป้องกัน DDoS attacks
- **CORS Configuration** - Cross-origin protection
- **Input Validation** - ป้องกัน injection attacks
- **File Upload Security** - ตรวจสอบไฟล์ที่อัปโหลด

---

## 🎨 UI/UX Features

- **Responsive Design** - รองรับทุกขนาดหน้าจอ
- **Modern UI** - Clean และ Professional Interface
- **Dark Mode Ready** - เตรียมพร้อมสำหรับ Dark Theme
- **Accessibility** - WCAG 2.1 Compliance
- **Loading States** - Skeleton screens และ Loading indicators
- **Error Handling** - User-friendly error messages

---

## 🤝 การมีส่วนร่วม (Contributing)

1. Fork โปรเจกต์
2. สร้าง Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit การเปลี่ยนแปลง (`git commit -m 'Add some AmazingFeature'`)
4. Push ไปยัง Branch (`git push origin feature/AmazingFeature`)
5. เปิด Pull Request

---

## 📄 License

โครงการนี้อยู่ภายใต้ MIT License - ดูไฟล์ [LICENSE](LICENSE) สำหรับรายละเอียด

---

## 📞 ติดต่อและสนับสนุน (Support)

- **Issues**: [GitHub Issues](https://github.com/your-username/AI-Powered-Idea-Management/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/AI-Powered-Idea-Management/discussions)
- **Email**: support@ideabubble.ai

---

## 🗺️ Roadmap อัพเดต

- [ ] **v1.1** - Dark Mode Support
- [ ] **v1.2** - Advanced Analytics Dashboard
- [ ] **v1.3** - Mobile App (React Native)
- [ ] **v1.4** - Team Collaboration Features
- [ ] **v1.5** - Integration with External APIs

---

## 🙏 คำขอบคุณ (Acknowledgments)

ขอบคุณสำหรับการเรียนรู้และ inspiration จาก:
- Google Gemini AI
- React และ Node.js communities
- Open source contributors
- Tailwind CSS team

---

**🌟 หากโปรเจกต์นี้มีประโยชน์ กรุณาให้ Star เพื่อเป็นการสนับสนุน! 🌟**