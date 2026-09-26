<div align="center">
    <h1>Voyara - Intelligent Travel Planning Platform</h1>
</div>

<div align="center">
  <h3>🌍 Smart Trip Planning Made Easy</h3>
  <p>A comprehensive travel planning application with intelligent suggestions, budget tracking, and collaborative features</p>
</div>

## ✨ Features

- **Trip Management**: Create, edit, and manage multiple travel itineraries
- **Smart Itinerary Builder**: Build detailed day-by-day travel plans with stops and activities
- **Budget Dashboard**: Track expenses with multi-currency support (INR, USD, EUR, GBP)
- **Timeline View**: Visual timeline representation of your travel schedule
- **Route Map Visualization**: Interactive map showing your travel route
- **Destination Explorer**: Browse and discover popular destinations worldwide
- **Activity Catalog**: Explore and add activities to your itinerary
- **Smart Suggestions**: AI-powered recommendations for optimizing your trip
- **Public Sharing**: Share trips publicly or export them
- **User Authentication**: Secure login and signup functionality
- **Multi-currency Support**: View costs in your preferred currency
- **Local Storage**: Data persists locally in your browser

## 🚀 Tech Stack

- **Frontend**: React 19 with TypeScript
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS 4
- **Icons**: Lucide React
- **Animations**: Motion
- **PDF Export**: jsPDF
- **State Management**: React Hooks with LocalStorage
- **Package Manager**: Bun

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Tanya-garg10/Voyara-Intelligent-Travel-Planning-Platform.git
   cd voyara
   ```

2. **Install dependencies**
   ```bash
   bun install
   # or
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Configure any required API keys in the `.env` file

4. **Run the development server**
   ```bash
   bun run dev
   # or
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 🛠️ Available Scripts

- `bun run dev` - Start development server on port 3000
- `bun run build` - Build for production
- `bun run preview` - Preview production build
- `bun run lint` - Run TypeScript type checking
- `bun run clean` - Clean build artifacts

## 📁 Project Structure

```
voyara/
├── src/
│   ├── components/       # React components
│   ├── data/            # Mock data and constants
│   ├── utils/           # Utility functions
│   ├── App.tsx          # Main application component
│   ├── main.tsx         # Application entry point
│   └── types.ts         # TypeScript type definitions
├── assets/              # Static assets
├── public/              # Public files
└── index.html           # HTML template
```

## 🎯 Key Components

- **DashboardView**: Main dashboard with trip overview
- **ItineraryBuilder**: Drag-and-drop itinerary planning
- **BudgetDashboard**: Expense tracking and budget analysis
- **TimelineView**: Visual timeline of trip activities
- **RouteMapVisualizer**: Interactive route mapping
- **DestinationExplorer**: Browse and add destinations
- **ActivityExplorer**: Discover and add activities
- **SmartSuggestionsPanel**: AI-powered trip optimization

## 🔧 Configuration

The application uses localStorage for data persistence. To reset the demo data:

1. Navigate to the Profile view
2. Click "Reset Sample Data" button
3. Confirm the reset action

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

Built with modern web technologies to make travel planning easier and more enjoyable.

<div align="center">
  <p>Made with ❤️ for travelers worldwide</p>
</div>
