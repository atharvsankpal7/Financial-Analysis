import json
import sys
import os
from datetime import datetime, timedelta

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import app
from models import db, User, Recommendation, HistoricalPrice

def create_seed_data():
    """Create and populate database with seed data."""
    
    with app.app_context():
        # Drop and recreate all tables
        db.drop_all()
        db.create_all()
        
        # Create test users
        users_data = [
            {
                "name": "Test User 1",
                "age": 28,
                "income": 500000,
                "risk_preference": "low",
                "investment_goals": "short-term",
                "selected_instruments": ["FD", "Bank"],
                "rates": {"FD": 6.5, "Bank": 3.25, "SIP": 10},
                "investable_amount": 100000
            },
            {
                "name": "Test User 2", 
                "age": 34,
                "income": 900000,
                "risk_preference": "medium",
                "investment_goals": "long-term",
                "selected_instruments": ["FD", "SIP", "Bank"],
                "rates": {"FD": 6.0, "Bank": 3.5, "SIP": 12},
                "investable_amount": 300000
            },
            {
                "name": "Test User 3",
                "age": 42,
                "income": 1200000,
                "risk_preference": "high",
                "investment_goals": "long-term", 
                "selected_instruments": ["SIP", "FD"],
                "rates": {"FD": 6.2, "Bank": 3.0, "SIP": 15},
                "investable_amount": 500000
            }
        ]
        
        created_users = []
        for user_data in users_data:
            user = User(
                name=user_data["name"],
                age=user_data["age"],
                income=user_data["income"],
                risk_preference=user_data["risk_preference"],
                investment_goals=user_data["investment_goals"],
                selected_instruments=json.dumps(user_data["selected_instruments"]),
                rates_json=json.dumps(user_data["rates"]),
                investable_amount=user_data["investable_amount"],
                created_at=datetime.utcnow() - timedelta(days=30)
            )
            db.session.add(user)
            created_users.append(user)
        
        db.session.commit()
        
        # Create historical recommendations
        sample_recommendations = [
            {
                "user_id": 1,
                "portfolio": {"FD": 60, "Bank": 20, "SIP": 0, "Gold": 15, "Silver": 5},
                "expected_returns": {
                    "FD": {"rate": 6.5, "amount": 60000, "projected_value": 63900, "roi_percent": 6.5},
                    "Bank": {"rate": 3.25, "amount": 20000, "projected_value": 20650, "roi_percent": 3.25},
                    "Gold": {"price": 6200, "source": "seed", "amount": 15000, "projected_value": 15300, "roi_percent": 2.0},
                    "Silver": {"price": 74, "source": "seed", "amount": 5000, "projected_value": 5050, "roi_percent": 1.0},
                    "total_expected_roi_percent": 4.9
                },
                "source_prices": {
                    "gold": {"price": 6200.0, "unit": "g", "source": "seed", "timestamp": "2024-01-15T10:00:00"},
                    "silver": {"price": 74.0, "unit": "g", "source": "seed", "timestamp": "2024-01-15T10:00:00"}
                },
                "created_at": datetime.utcnow() - timedelta(days=15)
            },
            {
                "user_id": 2,
                "portfolio": {"FD": 30, "Bank": 10, "SIP": 40, "Gold": 15, "Silver": 5},
                "expected_returns": {
                    "FD": {"rate": 6.0, "amount": 90000, "projected_value": 95400, "roi_percent": 6.0},
                    "Bank": {"rate": 3.5, "amount": 30000, "projected_value": 31050, "roi_percent": 3.5},
                    "SIP": {"rate": 12.0, "amount": 120000, "projected_value": 134400, "roi_percent": 12.0},
                    "Gold": {"price": 6180, "source": "seed", "amount": 45000, "projected_value": 46800, "roi_percent": 4.0},
                    "Silver": {"price": 73, "source": "seed", "amount": 15000, "projected_value": 15450, "roi_percent": 3.0},
                    "total_expected_roi_percent": 7.8
                },
                "source_prices": {
                    "gold": {"price": 6180.0, "unit": "g", "source": "seed", "timestamp": "2024-01-10T14:30:00"},
                    "silver": {"price": 73.0, "unit": "g", "source": "seed", "timestamp": "2024-01-10T14:30:00"}
                },
                "created_at": datetime.utcnow() - timedelta(days=20)
            },
            {
                "user_id": 3,
                "portfolio": {"FD": 15, "Bank": 0, "SIP": 65, "Gold": 15, "Silver": 5},
                "expected_returns": {
                    "FD": {"rate": 6.2, "amount": 75000, "projected_value": 79650, "roi_percent": 6.2},
                    "SIP": {"rate": 15.0, "amount": 325000, "projected_value": 373750, "roi_percent": 15.0},
                    "Gold": {"price": 6250, "source": "seed", "amount": 75000, "projected_value": 78750, "roi_percent": 5.0},
                    "Silver": {"price": 75, "source": "seed", "amount": 25000, "projected_value": 26250, "roi_percent": 5.0},
                    "total_expected_roi_percent": 11.7
                },
                "source_prices": {
                    "gold": {"price": 6250.0, "unit": "g", "source": "seed", "timestamp": "2024-01-05T09:15:00"},
                    "silver": {"price": 75.0, "unit": "g", "source": "seed", "timestamp": "2024-01-05T09:15:00"}
                },
                "created_at": datetime.utcnow() - timedelta(days=25)
            }
        ]
        
        for rec_data in sample_recommendations:
            recommendation = Recommendation(
                user_id=rec_data["user_id"],
                portfolio_json=json.dumps(rec_data["portfolio"]),
                expected_returns_json=json.dumps(rec_data["expected_returns"]),
                source_prices_json=json.dumps(rec_data["source_prices"]),
                created_at=rec_data["created_at"]
            )
            db.session.add(recommendation)
        
        db.session.commit()
        
        # Create some historical price data for testing
        historical_prices = []
        base_date = datetime.utcnow().date()
        
        # Generate 60 days of historical data for gold and silver
        for days_back in range(1, 61):
            historical_date = base_date - timedelta(days=days_back)
            
            # Gold prices with some variation
            gold_base = 6200
            gold_variation = (hash(str(historical_date)) % 200 - 100) * 2  # ±200 variation
            gold_price = gold_base + gold_variation
            
            # Silver prices with some variation  
            silver_base = 74
            silver_variation = (hash(str(historical_date)) % 10 - 5) * 0.5  # ±2.5 variation
            silver_price = silver_base + silver_variation
            
            historical_prices.extend([
                HistoricalPrice(
                    asset='gold',
                    date=historical_date,
                    price=gold_price,
                    unit='g',
                    source='seed'
                ),
                HistoricalPrice(
                    asset='silver', 
                    date=historical_date,
                    price=silver_price,
                    unit='g',
                    source='seed'
                )
            ])
        
        for price_record in historical_prices:
            db.session.add(price_record)
        
        db.session.commit()
        
        print("✅ Database seeded successfully!")
        print(f"Created {len(users_data)} users")
        print(f"Created {len(sample_recommendations)} historical recommendations")
        print(f"Created {len(historical_prices)} historical price records")
        print("\nTest users:")
        for i, user_data in enumerate(users_data, 1):
            print(f"  {i}. {user_data['name']} (ID: {i}) - {user_data['risk_preference']} risk")

if __name__ == "__main__":
    create_seed_data()