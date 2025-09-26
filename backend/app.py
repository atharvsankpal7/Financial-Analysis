from flask import Flask, request, jsonify
from flask_cors import CORS
from models import db, User, Recommendation
from utils import fetch_metal_price, recommend_allocation
import json
import os
from datetime import datetime

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
CORS(app)

db.init_app(app)

@app.route('/api/user/<int:user_id>', methods=['GET'])
def get_user(user_id):
    try:
        user = User.query.get_or_404(user_id)
        
        return jsonify({
            'status': 'ok',
            'profile': {
                'id': user.id,
                'name': user.name,
                'age': user.age,
                'income': user.income,
                'risk_preference': user.risk_preference,
                'investment_goals': user.investment_goals,
                'selected_instruments': json.loads(user.selected_instruments),
                'rates': json.loads(user.rates_json),
                'investable_amount': user.investable_amount,
                'created_at': user.created_at.isoformat()
            }
        })
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 400

@app.route('/api/user', methods=['POST'])
def create_user():
    try:
        data = request.get_json()
        
        user = User(
            name=data['name'],
            age=data.get('age'),
            income=data.get('income'),
            risk_preference=data.get('risk_preference'),
            investment_goals=data.get('investment_goals'),
            selected_instruments=json.dumps(data.get('selected_instruments', [])),
            rates_json=json.dumps(data.get('rates', {})),
            investable_amount=data.get('investable_amount')
        )
        
        db.session.add(user)
        db.session.commit()
        
        return jsonify({
            'status': 'ok',
            'user_id': user.id,
            'profile': {
                'id': user.id,
                'name': user.name,
                'age': user.age,
                'income': user.income,
                'risk_preference': user.risk_preference,
                'investment_goals': user.investment_goals,
                'selected_instruments': json.loads(user.selected_instruments),
                'rates': json.loads(user.rates_json),
                'investable_amount': user.investable_amount
            }
        })
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 400

@app.route('/api/user/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    try:
        user = User.query.get_or_404(user_id)
        data = request.get_json()
        
        if 'name' in data:
            user.name = data['name']
        if 'age' in data:
            user.age = data['age']
        if 'income' in data:
            user.income = data['income']
        if 'risk_preference' in data:
            user.risk_preference = data['risk_preference']
        if 'investment_goals' in data:
            user.investment_goals = data['investment_goals']
        if 'selected_instruments' in data:
            user.selected_instruments = json.dumps(data['selected_instruments'])
        if 'rates' in data:
            user.rates_json = json.dumps(data['rates'])
        if 'investable_amount' in data:
            user.investable_amount = data['investable_amount']
        
        db.session.commit()
        
        return jsonify({
            'status': 'ok',
            'profile': {
                'id': user.id,
                'name': user.name,
                'age': user.age,
                'income': user.income,
                'risk_preference': user.risk_preference,
                'investment_goals': user.investment_goals,
                'selected_instruments': json.loads(user.selected_instruments),
                'rates': json.loads(user.rates_json),
                'investable_amount': user.investable_amount
            }
        })
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 400

@app.route('/api/recommendation/<int:user_id>')
def get_recommendation(user_id):
    try:
        user = User.query.get_or_404(user_id)
        lat = request.args.get('lat', type=float)
        lon = request.args.get('lon', type=float)
        country = request.args.get('country', 'india')
        
        # Fetch current metal prices
        gold_price = fetch_metal_price('gold', country=country, lat=lat, lon=lon)
        silver_price = fetch_metal_price('silver', country=country, lat=lat, lon=lon)
        
        current_prices = {
            'gold': gold_price,
            'silver': silver_price
        }
        
        # Get user data
        user_data = {
            'risk_preference': user.risk_preference,
            'selected_instruments': user.selected_instruments,
            'investable_amount': user.investable_amount
        }
        
        rates = json.loads(user.rates_json)
        
        # Generate recommendation
        recommendation_data = recommend_allocation(user_data, current_prices, rates)
        
        # Save recommendation
        recommendation = Recommendation(
            user_id=user_id,
            portfolio_json=json.dumps(recommendation_data['portfolio']),
            expected_returns_json=json.dumps(recommendation_data['expected_returns']),
            source_prices_json=json.dumps(current_prices)
        )
        
        db.session.add(recommendation)
        db.session.commit()
        
        return jsonify({
            'status': 'ok',
            'user_id': user_id,
            'portfolio': recommendation_data['portfolio'],
            'expected_returns': recommendation_data['expected_returns'],
            'source_prices': current_prices
        })
        
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/api/market')
def get_market_price():
    try:
        asset = request.args.get('asset', 'gold')
        lat = request.args.get('lat', type=float)
        lon = request.args.get('lon', type=float)
        country = request.args.get('country', 'india')
        
        price_data = fetch_metal_price(asset, country=country, lat=lat, lon=lon)
        return jsonify(price_data)
        
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/api/portfolio/operation', methods=['POST'])
def portfolio_operation():
    try:
        data = request.get_json()
        user_id = data['user_id']
        operation = data['operation']
        instrument = data['instrument']
        amount = data['amount']
        
        # Get latest recommendation
        latest_rec = Recommendation.query.filter_by(user_id=user_id).order_by(Recommendation.created_at.desc()).first()
        
        if not latest_rec:
            return jsonify({'status': 'error', 'message': 'No existing recommendation found'}), 400
        
        # For simplicity, create a new recommendation with updated portfolio
        # In production, you'd maintain operation history
        portfolio = json.loads(latest_rec.portfolio_json)
        expected_returns = json.loads(latest_rec.expected_returns_json)
        
        # Create new recommendation (operation logged)
        new_recommendation = Recommendation(
            user_id=user_id,
            portfolio_json=latest_rec.portfolio_json,
            expected_returns_json=latest_rec.expected_returns_json,
            source_prices_json=latest_rec.source_prices_json
        )
        
        db.session.add(new_recommendation)
        db.session.commit()
        
        return jsonify({
            'status': 'ok',
            'operation': {
                'type': operation,
                'instrument': instrument,
                'amount': amount,
                'timestamp': datetime.utcnow().isoformat()
            },
            'updated_portfolio': portfolio
        })
        
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/api/user/<int:user_id>/history')
def get_user_history(user_id):
    try:
        recommendations = Recommendation.query.filter_by(user_id=user_id).order_by(Recommendation.created_at.desc()).all()
        
        history = []
        for rec in recommendations:
            history.append({
                'id': rec.id,
                'portfolio': json.loads(rec.portfolio_json),
                'expected_returns': json.loads(rec.expected_returns_json),
                'created_at': rec.created_at.isoformat()
            })
        
        return jsonify({
            'status': 'ok',
            'history': history
        })
        
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, port=5000)