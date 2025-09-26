from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False)
    age = db.Column(db.Integer)
    income = db.Column(db.Float)                # annual income
    risk_preference = db.Column(db.String)      # low / medium / high
    investment_goals = db.Column(db.String)     # short-term / long-term
    selected_instruments = db.Column(db.String) # JSON string ['FD','Bank','SIP']
    rates_json = db.Column(db.Text)             # JSON: {"FD":6.5,"Bank":3.5,"SIP":12}
    investable_amount = db.Column(db.Float)     # amount user plans to invest
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class HistoricalPrice(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    asset = db.Column(db.String, nullable=False)        # 'gold' or 'silver'
    date = db.Column(db.Date, nullable=False)           # date for the price
    price = db.Column(db.Float, nullable=False)         # price value
    unit = db.Column(db.String, default='g')            # unit (grams)
    source = db.Column(db.String, nullable=False)       # data source
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Create unique constraint on asset and date
    __table_args__ = (db.UniqueConstraint('asset', 'date', name='unique_asset_date'),)
class Recommendation(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    portfolio_json = db.Column(db.Text)         # {"FD":40,"Bank":20,"SIP":20,"Gold":10,"Silver":10}
    expected_returns_json = db.Column(db.Text)  # expected returns by instrument and total
    source_prices_json = db.Column(db.Text)     # {"gold": {"price":..., "source":"duckduckgo"}, "silver": {...}}
    created_at = db.Column(db.DateTime, default=datetime.utcnow)