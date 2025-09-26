import requests
import json
import time
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
import re

# In-memory cache for price data
price_cache = {}
CACHE_DURATION = 600  # 10 minutes

def fetch_metal_price(asset: str, country: Optional[str] = None, lat: Optional[float] = None, lon: Optional[float] = None) -> Dict[str, Any]:
    """Fetch metal prices using DuckDuckGo API with fallbacks."""
    cache_key = f"{asset}_{country or 'default'}"
    
    # Check cache
    if cache_key in price_cache:
        cached_data, timestamp = price_cache[cache_key]
        if time.time() - timestamp < CACHE_DURATION:
            return cached_data
    
    # Determine location string for query
    location = country or "india"  # default to India if no location
    
    try:
        # Primary: DuckDuckGo Instant Answer API
        query = f"{asset} price {location}"
        url = f"https://api.duckduckgo.com"
        params = {
            'q': query,
            'format': 'json',
            'no_html': '1',
            'skip_disambig': '1'
        }
        
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        # Parse price from Answer or RelatedTopics
        price = None
        source = "duckduckgo"
        
        if 'Answer' in data and data['Answer']:
            # Extract numeric price from answer text
            answer_text = data['Answer']
            price_match = re.search(r'[\d,]+\.?\d*', answer_text)
            if price_match:
                price_str = price_match.group().replace(',', '')
                try:
                    price = float(price_str)
                except ValueError:
                    price = None
        
        # If no price from Answer, try RelatedTopics
        if not price and 'RelatedTopics' in data:
            for topic in data['RelatedTopics']:
                if isinstance(topic, dict) and 'Text' in topic:
                    price_match = re.search(r'[\d,]+\.?\d*', topic['Text'])
                    if price_match:
                        price_str = price_match.group().replace(',', '')
                        try:
                            price = float(price_str)
                            break
                        except ValueError:
                            continue
        
        # Fallback: Use seed prices if DuckDuckGo fails
        if not price:
            fallback_prices = {
                'gold': 6230.50,  # per gram in INR
                'silver': 74.25   # per gram in INR
            }
            price = fallback_prices.get(asset.lower(), 5000.0)
            source = "seed"
        
        result = {
            "asset": asset,
            "price": price,
            "unit": "g",
            "source": source,
            "timestamp": datetime.utcnow().isoformat(),
            "location": location
        }
        
        # Cache result
        price_cache[cache_key] = (result, time.time())
        
        return result
        
    except Exception as e:
        print(f"Error fetching {asset} price: {e}")
        # Emergency fallback
        fallback_prices = {
            'gold': 6230.50,
            'silver': 74.25
        }
        result = {
            "asset": asset,
            "price": fallback_prices.get(asset.lower(), 5000.0),
            "unit": "g",
            "source": "fallback",
            "timestamp": datetime.utcnow().isoformat(),
            "location": location,
            "error": str(e)
        }
        return result

def calc_fd_return(principal: float, rate_percent: float, years: float = 1) -> Dict[str, float]:
    """Calculate Fixed Deposit returns using compound interest."""
    rate_decimal = rate_percent / 100
    future_value = principal * ((1 + rate_decimal) ** years)
    roi_percent = ((future_value - principal) / principal) * 100
    
    return {
        "principal": principal,
        "rate": rate_percent,
        "future_value": future_value,
        "roi_percent": roi_percent,
        "profit": future_value - principal
    }

def calc_bank_return(principal: float, rate_percent: float, years: float = 1, monthly_compound: bool = True) -> Dict[str, float]:
    """Calculate Bank savings returns with monthly compounding."""
    if monthly_compound:
        monthly_rate = rate_percent / 12 / 100
        periods = 12 * years
        future_value = principal * ((1 + monthly_rate) ** periods)
    else:
        rate_decimal = rate_percent / 100
        future_value = principal * ((1 + rate_decimal) ** years)
    
    roi_percent = ((future_value - principal) / principal) * 100
    
    return {
        "principal": principal,
        "rate": rate_percent,
        "future_value": future_value,
        "roi_percent": roi_percent,
        "profit": future_value - principal
    }

def calc_sip_return(monthly_amount: float, annual_rate_percent: float, months: int = 12) -> Dict[str, float]:
    """Calculate SIP returns using future value of annuity formula."""
    monthly_rate = annual_rate_percent / 12 / 100
    
    if monthly_rate == 0:
        future_value = monthly_amount * months
    else:
        future_value = monthly_amount * (((1 + monthly_rate) ** months - 1) / monthly_rate) * (1 + monthly_rate)
    
    total_invested = monthly_amount * months
    roi_percent = ((future_value - total_invested) / total_invested) * 100
    
    return {
        "monthly_amount": monthly_amount,
        "total_invested": total_invested,
        "annual_rate": annual_rate_percent,
        "future_value": future_value,
        "roi_percent": roi_percent,
        "profit": future_value - total_invested
    }

def calc_metal_roi(current_price: float, baseline_price: float) -> float:
    """Calculate metal ROI percentage."""
    if baseline_price == 0:
        return 0
    return ((current_price - baseline_price) / baseline_price) * 100

def recommend_allocation(user_data: Dict, current_prices: Dict, rates: Dict) -> Dict[str, Any]:
    """Generate portfolio allocation based on user profile and current market data."""
    risk_preference = user_data.get('risk_preference', 'medium')
    selected_instruments = json.loads(user_data.get('selected_instruments', '[]'))
    
    # Base allocation templates
    allocations = {
        'low': {'FD': 45, 'Bank': 25, 'SIP': 10, 'Gold': 15, 'Silver': 5},
        'medium': {'FD': 25, 'Bank': 15, 'SIP': 40, 'Gold': 15, 'Silver': 5},
        'high': {'FD': 10, 'Bank': 10, 'SIP': 60, 'Gold': 15, 'Silver': 5}
    }
    
    base_allocation = allocations[risk_preference]
    
    # Zero out unselected instruments and redistribute
    final_allocation = {}
    total_selected = 0
    
    # First pass: set selected instruments
    for instrument in ['FD', 'Bank', 'SIP']:
        if instrument in selected_instruments:
            final_allocation[instrument] = base_allocation[instrument]
            total_selected += base_allocation[instrument]
        else:
            final_allocation[instrument] = 0
    
    # Always include Gold and Silver
    final_allocation['Gold'] = base_allocation['Gold']
    final_allocation['Silver'] = base_allocation['Silver']
    total_selected += base_allocation['Gold'] + base_allocation['Silver']
    
    # Normalize to 100%
    if total_selected > 0:
        scale_factor = 100 / total_selected
        for instrument in final_allocation:
            final_allocation[instrument] = round(final_allocation[instrument] * scale_factor, 1)
    
    # Calculate expected returns
    investable_amount = user_data.get('investable_amount', 100000)
    expected_returns = {}
    total_portfolio_value = 0
    
    for instrument, allocation_percent in final_allocation.items():
        amount = investable_amount * (allocation_percent / 100)
        
        if instrument == 'FD' and allocation_percent > 0:
            fd_rate = rates.get('FD', 6.5)
            returns = calc_fd_return(amount, fd_rate)
            expected_returns[instrument] = {
                'rate': fd_rate,
                'amount': amount,
                'projected_value': returns['future_value'],
                'roi_percent': returns['roi_percent']
            }
            total_portfolio_value += returns['future_value']
            
        elif instrument == 'Bank' and allocation_percent > 0:
            bank_rate = rates.get('Bank', 3.5)
            returns = calc_bank_return(amount, bank_rate)
            expected_returns[instrument] = {
                'rate': bank_rate,
                'amount': amount,
                'projected_value': returns['future_value'],
                'roi_percent': returns['roi_percent']
            }
            total_portfolio_value += returns['future_value']
            
        elif instrument == 'SIP' and allocation_percent > 0:
            sip_rate = rates.get('SIP', 12.0)
            monthly_amount = amount / 12
            returns = calc_sip_return(monthly_amount, sip_rate)
            expected_returns[instrument] = {
                'rate': sip_rate,
                'amount': amount,
                'projected_value': returns['future_value'],
                'roi_percent': returns['roi_percent']
            }
            total_portfolio_value += returns['future_value']
            
        elif instrument in ['Gold', 'Silver']:
            # For metals, assume historical baseline (30 days ago simulation)
            current_price = current_prices.get(instrument.lower(), {}).get('price', 5000)
            baseline_price = current_price * 0.95  # Simulate 5% historical change
            metal_roi = calc_metal_roi(current_price, baseline_price)
            projected_value = amount * (1 + metal_roi / 100)
            
            expected_returns[instrument] = {
                'price': current_price,
                'source': current_prices.get(instrument.lower(), {}).get('source', 'fallback'),
                'amount': amount,
                'projected_value': projected_value,
                'roi_percent': metal_roi
            }
            total_portfolio_value += projected_value
    
    total_expected_roi_percent = ((total_portfolio_value - investable_amount) / investable_amount) * 100
    expected_returns['total_expected_roi_percent'] = total_expected_roi_percent
    
    return {
        'portfolio': final_allocation,
        'expected_returns': expected_returns
    }