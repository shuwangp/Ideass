# AI-Powered Idea Organizer - Frontend

A modern React application for capturing, organizing, and developing ideas with AI assistance.

## 🚀 Features

- **Idea Management**: Create, edit, delete, and organize ideas
- **AI-Powered Assistance**: Get AI suggestions for categorization, tagging, and idea development
- **Smart Search & Filtering**: Advanced search with filters by category, status, priority, and tags
- **User Authentication**: Secure login/registration system
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Real-time Updates**: Live updates for votes, comments, and idea changes
- **Analytics Dashboard**: Track your idea creation patterns and engagement
- **Rich Text Editor**: Format your ideas with a powerful text editor
- **Comments & Voting**: Engage with ideas through comments and voting

## 🛠️ Technology Stack

- **Frontend Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand for auth, React Query for server state
- **Routing**: React Router v6
- **Forms**: React Hook Form with Yup validation
- **Animations**: Framer Motion
- **Icons**: Heroicons
- **HTTP Client**: Axios
- **Build Tool**: Vite

## 📋 Prerequisites

- Node.js 18+ and npm
- Backend API server running (see backend repository)

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/ai-idea-organizer-frontend.git
   cd ai-idea-organizer-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   VITE_API_BASE_URL=http://localhost:3000/api
   VITE_OPENAI_API_KEY=your_openai_api_key_here
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

## 🏗️ Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── auth/            # Authentication components
│   ├── common/          # Common UI components (Button, Modal, etc.)
│   ├── ideas/           # Idea-related components
│   └── layout/          # Layout components (Header, Sidebar)
├── hooks/               # Custom React hooks
├── pages/               # Page components
├── services/            # API service functions
├── types/               # TypeScript type definitions
├── config/              # Configuration files
└── main.tsx            # Application entry point
```

## 🔌 API Integration

This frontend is designed to work with the existing backend API. The main service files handle:

- **authService**: User authentication (login, register, logout)
- **ideaService**: Idea CRUD operations and AI suggestions
- **commentService**: Comment management
- **voteService**: Voting system
- **analyticsService**: Analytics data

## 📱 Responsive Design

The application is fully responsive with breakpoints:
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

## 🎨 UI/UX Features

- **Modern Design**: Clean, professional interface with subtle animations
- **Dark Mode Ready**: Easy to implement dark mode support
- **Accessibility**: WCAG 2.1 compliant with proper ARIA labels
- **Loading States**: Skeleton screens and loading indicators
- **Error Handling**: User-friendly error messages and retry mechanisms
- **Progressive Enhancement**: Works without JavaScript for basic functionality

## 🧪 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🔒 Authentication Flow

1. User visits protected route
2. AuthGuard checks authentication status
3. If not authenticated, redirect to login
4. After successful login, redirect to intended route
5. Auth token stored in localStorage with automatic refresh

## 📊 State Management

- **Authentication**: Zustand store for user state and auth methods
- **Server State**: React Query for API data caching and synchronization
- **Local State**: React useState for component-specific state
- **Form State**: React Hook Form for form management

## 🚀 Deployment

### Production Build
```bash
npm run build
```

### Environment Variables for Production
```env
VITE_API_BASE_URL=https://your-api-domain.com/api
VITE_OPENAI_API_KEY=your_production_openai_key
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/your-username/ai-idea-organizer-frontend/issues) page
2. Create a new issue with detailed description
3. Contact the development team

## 🔮 Future Enhancements

- [ ] Real-time collaboration features
- [ ] Advanced AI integrations (GPT-4, Claude)
- [ ] Export to various formats (PDF, Markdown, etc.)
- [ ] Idea visualization and mind mapping
- [ ] Team workspaces
- [ ] Advanced analytics and insights
- [ ] Mobile app (React Native)
- [ ] Offline support with PWA

## 🙏 Acknowledgments

- React team for the amazing framework
- Tailwind CSS for the utility-first CSS framework
- Heroicons for beautiful icons
- All open-source contributors who made this project possible

---

Built with ❤️ for idea organizers and creative minds everywhere!