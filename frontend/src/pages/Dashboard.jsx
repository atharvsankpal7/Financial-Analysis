import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Settings, TrendingUp, User, History } from 'lucide-react'
import { buildApiUrl, API_ENDPOINTS } from '../constants'
import RecommendationChart from '../components/RecommendationChart'
import PredictionCard from '../components/PredictionCard'
import HistoryTable from '../components/HistoryTable'

export default function Dashboard() {
  const [searchParams] = useSearchParams()
  const userId = searchParams.get('user_id')
  
  const [recommendation, setRecommendation] = useState(null)
  const [history, setHistory] = useState([])
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (userId) {
      fetchUserData()
      fetchRecommendation()
      fetchHistory()
    }
  }, [userId])

  const fetchUserData = async () => {
    try {
      const response = await fetch(buildApiUrl(`${API_ENDPOINTS.USER}/${userId}`))
      const data = await response.json()
      
      if (data.status === 'ok') {
        setUser(data.profile)
      } else {
        console.error('Error fetching user data:', data.message)
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
    }
  }

  const fetchRecommendation = async () => {
    try {
      setIsLoading(true)
      
      // Get current location if possible
      let lat = null, lon = null
      if (navigator.geolocation) {
        try {
          const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 })
          })
          lat = position.coords.latitude
          lon = position.coords.longitude
        } catch (error) {
          console.log('Geolocation not available:', error)
        }
      }

      const params = new URLSearchParams()
      if (lat) params.append('lat', lat)
      if (lon) params.append('lon', lon)
      
      const response = await fetch(buildApiUrl(`${API_ENDPOINTS.RECOMMENDATION}/${userId}?${params}`))
      const data = await response.json()
      
      if (data.status === 'ok') {
        setRecommendation(data)
      } else {
        throw new Error(data.message)
      }
    } catch (error) {
      console.error('Error fetching recommendation:', error)
      setError('Failed to load recommendation')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchHistory = async () => {
    try {
      const response = await fetch(buildApiUrl(`${API_ENDPOINTS.USER_HISTORY}/${userId}/history`))
      const data = await response.json()
      
      if (data.status === 'ok') {
        setHistory(data.history)
      } else {
        console.error('Error fetching history:', data.message)
      }
    } catch (error) {
      console.error('Error fetching history:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Generating your recommendation...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={fetchRecommendation}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-xl">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">FinSight AI</h1>
                <p className="text-sm text-gray-600">Investment Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                to={`/profile/${userId}`}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Settings className="h-5 w-5" />
                <span className="text-sm">Settings</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - User Summary & Chart */}
          <div className="lg:col-span-2 space-y-6">
            {/* User Summary */}
            {user && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <User className="h-6 w-6 text-blue-600" />
                  <h2 className="text-xl font-semibold text-gray-900">Portfolio Summary</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">User ID</p>
                    <p className="text-lg font-semibold text-gray-900">#{userId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Investment Amount</p>
                    <p className="text-lg font-semibold text-gray-900">
                      ₹{user?.investable_amount?.toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Expected Returns</p>
                    <p className="text-lg font-semibold text-green-600">
                      {recommendation?.expected_returns?.total_expected_roi_percent?.toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Risk Level</p>
                    <p className="text-lg font-semibold text-gray-900 capitalize">{user?.risk_preference}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Portfolio Chart */}
            {recommendation && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Recommended Portfolio Allocation</h2>
                <RecommendationChart data={recommendation.portfolio} />
              </div>
            )}
          </div>

          {/* Right Column - Predictions & History */}
          <div className="space-y-6">
            {/* Market Predictions */}
            {recommendation && (
              <PredictionCard 
                goldData={recommendation.source_prices?.gold}
                silverData={recommendation.source_prices?.silver}
                expectedReturns={recommendation.expected_returns}
              />
            )}

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl hover:bg-blue-700 transition-colors">
                  Invest Now
                </button>
                <button className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-xl hover:bg-gray-50 transition-colors">
                  Adjust Allocation
                </button>
                <button 
                  onClick={fetchRecommendation}
                  className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Refresh Prices
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* History Section */}
        {history.length > 0 && (
          <div className="mt-8">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center space-x-3 mb-6">
                <History className="h-6 w-6 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">Recommendation History</h2>
              </div>
              <HistoryTable history={history} onUseRecommendation={fetchRecommendation} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}