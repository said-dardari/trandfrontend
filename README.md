# Trading Challenge Platform - Frontend

A modern React frontend for the trading challenge platform built with Vite, React Router, and Tailwind CSS.

## 🚀 Features

### Authentication
- User registration and login
- JWT token management
- Protected routes
- Session persistence

### Trading Features
- **Dashboard**: Real-time stock price monitoring for US and Moroccan markets
- **Challenge System**: Start trading challenges, execute trades, and monitor performance
- **Payment Simulation**: Mock payment processing with multiple payment methods
- **Leaderboard**: Global rankings and user statistics

### UI Components
- Responsive design with Tailwind CSS
- Modern navigation layout
- Interactive forms with validation
- Loading states and error handling

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   └── Layout.jsx          # Main layout with navigation
│   ├── contexts/
│   │   └── AuthContext.jsx     # Authentication state management
│   ├── pages/
│   │   ├── HomePage.jsx        # Landing page
│   │   ├── LoginPage.jsx       # User login
│   │   ├── RegisterPage.jsx    # User registration
│   │   ├── DashboardPage.jsx   # Stock prices dashboard
│   │   ├── ChallengePage.jsx   # Trading challenge interface
│   │   ├── PaymentPage.jsx     # Subscription payment (accessed via Pricing nav item)
│   │   └── LeaderboardPage.jsx # User rankings
│   ├── services/
│   │   └── api.js              # Axios API service layer
│   ├── App.jsx                 # Main application component
│   ├── main.jsx                # Application entry point
│   └── index.css               # Global styles with Tailwind
├── public/
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

## 🛠️ Technologies Used

- **React 18** - UI library
- **Vite** - Build tool and development server
- **React Router 6** - Client-side routing
- **Axios** - HTTP client
- **Tailwind CSS** - Styling framework
- **JWT** - Authentication tokens

## 🚀 Getting Started

### Prerequisites
- Node.js 16+
- npm or yarn

### Installation
```bash
cd frontend
npm install
```

### Development
```bash
npm run dev
# Server runs on http://localhost:3003
```

### Production Build
```bash
npm run build
npm run preview
```

## 🔧 API Integration

The frontend connects to the backend API through Axios interceptors:

### Base URL Configuration
```javascript
// vite.config.js
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:5000',
      changeOrigin: true
    }
  }
}
```

### Service Layer
All API calls are centralized in `src/services/api.js`:
- Auth API (login, register, profile)
- Challenge API (start, trade, status)
- Prices API (US and Moroccan stocks)
- Payment API (checkout, plans, methods)
- Leaderboard API (rankings, user stats)

## 🎨 Styling

### Tailwind CSS
- Utility-first CSS framework
- Responsive design classes
- Custom component classes in `index.css`
- Dark mode support ready

### Color Palette
- Primary: Blue (#3B82F6)
- Success: Green (#10B981)
- Warning: Yellow (#F59E0B)
- Danger: Red (#EF4444)
- Neutral: Gray scales

## 🔐 Authentication Flow

1. User registers/logs in
2. JWT token stored in localStorage
3. Token automatically added to API requests
4. 401 responses trigger auto-logout
5. Protected routes redirect to login when unauthenticated

## 📱 Responsive Design

- Mobile-first approach
- Responsive grid layouts
- Touch-friendly interactive elements
- Adaptive navigation for mobile devices

## 🧪 Testing

### Manual Testing Checklist
- [ ] User registration and login
- [ ] Dashboard stock price display
- [ ] Challenge creation and trading
- [ ] Payment simulation flow
- [ ] Leaderboard functionality
- [ ] Responsive layout on different screen sizes
- [ ] Error handling and loading states

## 🚀 Deployment

### Environment Variables
Create `.env.production`:
```
VITE_API_BASE_URL=https://your-api-domain.com
```

### Build Commands
```bash
npm run build
# Output in dist/ folder
```

## 📞 Support

For issues or questions:
- Check the console for error messages
- Verify API connection in network tab
- Ensure backend server is running on port 5000

## 🔄 Future Enhancements

- WebSocket integration for real-time updates
- Advanced charting with Chart.js or D3
- Push notifications
- Multi-language support
- Dark mode toggle
- Performance optimizations