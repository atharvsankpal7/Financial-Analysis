# FinSight AI - Financial Decision Support System

FinSight AI is a comprehensive financial decision support system that helps users make informed investment decisions through AI-powered portfolio recommendations.

## Features

- **User Onboarding**: Collect user profile, risk preferences, and investment rates
- **Live Market Data**: Fetch gold and silver prices using DuckDuckGo API with fallbacks
- **Portfolio Recommendations**: Generate risk-based allocations across FD, Bank, SIP, Gold, and Silver
- **ROI Calculations**: Manual compound interest calculations for accurate projections
- **Historical Tracking**: View and reuse previous recommendations
- **Profile Management**: Update rates and preferences anytime

## Tech Stack

**Frontend:**
- Vite + React (JSX)
- Tailwind CSS (default theme only)
- React Router for navigation
- Recharts for portfolio visualization
- Lucide React for icons

**Backend:**
- Flask + SQLAlchemy
- SQLite database
- DuckDuckGo API for metal prices
- Manual ROI calculations (no ML dependencies)

## Project Structure

```
FinSightAI/
├── backend/
│   ├── app.py                # Flask app + routes
│   ├── models.py             # SQLAlchemy models
│   ├── utils.py              # ROI calculations & price fetching
│   ├── seed.py               # Database seeding
│   ├── requirements.txt
│   └── database.db           # SQLite database (generated)
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    └── src/
        ├── App.jsx
        ├── pages/            # Onboarding, Dashboard, Profile
        └── components/       # UserForm, Chart, Prediction, History
```

## Installation & Setup

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python seed.py           # Create database and seed data
flask run               # Start backend server (port 5000)
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev             # Start frontend server (port 5173)
```

The frontend will proxy API requests to the Flask backend automatically.

## API Endpoints

### User Management
- `POST /api/user` - Create new user profile
- `PUT /api/user/<id>` - Update user profile
- `GET /api/user/<id>/history` - Get recommendation history

### Recommendations
- `GET /api/recommendation/<user_id>?lat=&lon=` - Generate recommendation
- `POST /api/portfolio/operation` - Log portfolio operations

### Market Data
- `GET /api/market?asset=gold|silver&lat=&lon=` - Get current metal prices

## Database Schema

**User Table:**
- Profile info (name, age, income, risk preference)
- Selected instruments (FD, Bank, SIP)
- User-entered rates for each instrument
- Investment amount and goals

**Recommendation Table:**
- Portfolio allocation percentages
- Expected returns calculation
- Market price sources and timestamps
- Historical tracking

## ROI Calculation Methods

### Fixed Deposit (FD)
- Compound interest: `FV = P * (1 + r/100)^t`
- Annual compounding for 1-year projection

### Bank Savings
- Monthly compounding: `FV = P * (1 + r/12/100)^(12*t)`
- Default monthly compounding frequency

### SIP (Systematic Investment Plan)
- Future value of annuity: `FV = M * (((1 + m)^n - 1) / m) * (1 + m)`
- Where m = monthly rate, n = number of months

### Gold/Silver
- ROI based on price change: `ROI% = (current_price - baseline_price) / baseline_price * 100`
- Uses seed baseline prices for historical comparison

## Recommendation Algorithm

Portfolio allocation based on risk preference:

- **Low Risk**: 60-70% FD/Bank, 10-20% SIP, 15-20% Gold, 0-5% Silver
- **Medium Risk**: 25-35% FD/Bank, 35-45% SIP, 20-25% Gold, 5-10% Silver  
- **High Risk**: 10-20% FD/Bank, 55-65% SIP, 15-20% Gold, 5-10% Silver

Unselected instruments get 0% allocation with redistribution to selected ones.

## Price Fetching Strategy

1. **Primary**: DuckDuckGo Instant Answer API
   - Query: `{asset} price {country/city}`
   - Parse numeric prices from Answer/RelatedTopics
   
2. **Fallback**: Seed prices if external API fails
   - Gold: ₹6,230.50/g, Silver: ₹74.25/g
   - 10-minute caching to minimize API calls

3. **Geolocation**: Optional device location for country-specific pricing

## Testing

### Seed Data
Run `python seed.py` to create test users:

1. **Test User 1** (ID: 1) - Low risk, FD+Bank, ₹100K investment
2. **Test User 2** (ID: 2) - Medium risk, FD+SIP+Bank, ₹300K investment  
3. **Test User 3** (ID: 3) - High risk, SIP+FD, ₹500K investment

### Manual Testing Flow
1. Visit `/onboarding` to create profile
2. Select instruments and enter rates
3. View dashboard with portfolio chart and predictions
4. Check historical recommendations
5. Edit profile to update rates

## Production Considerations

### Security & Privacy
- Geolocation requested with user consent only
- No sensitive PII stored beyond basic profile
- Input validation and error handling

### Performance
- Price data cached for 10 minutes
- Efficient database queries with proper indexing
- Responsive design for mobile devices

### Extensibility
- Ready for ML model integration (TODO placeholders provided)
- Modular utility functions for easy testing
- Clear separation of concerns (API, calculations, UI)

## Future Enhancements (TODO)

### ML Integration Points
```python
# Model input contract
{
  "historical_prices": [...],
  "user_profile": {...}
}

# Model output contract  
{
  "predicted_price_series": [...],
  "confidence": 0.8,
  "recommended_portfolio": {...}
}
```

### Additional Features
- Email notifications for price alerts
- Advanced charting with historical data
- Export recommendations as PDF
- Integration with actual investment platforms
- Multi-currency support
- Tax optimization suggestions

## License

MIT License - Feel free to use this codebase for educational or commercial purposes.