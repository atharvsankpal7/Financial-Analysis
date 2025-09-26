import { Calendar, TrendingUp, RotateCcw } from 'lucide-react'

export default function HistoryTable({ history, onUseRecommendation }) {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTopAllocations = (portfolio) => {
    return Object.entries(portfolio)
      .filter(([_, value]) => value > 0)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([name, value]) => `${name} (${value}%)`)
      .join(', ')
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-8">
        <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-600">No recommendation history available</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {history.map((rec, index) => (
        <div key={rec.id} className="border border-slate-200 rounded-xl p-4 hover:bg-slate-50 transition-colors">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">
                  Recommendation #{history.length - index}
                </h4>
                <p className="text-sm text-gray-600">{formatDate(rec.created_at)}</p>
              </div>
            </div>
            <button
              onClick={() => onUseRecommendation(rec)}
              className="flex items-center space-x-2 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Use This</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Top Allocations</p>
              <p className="text-sm font-medium text-gray-900">
                {getTopAllocations(rec.portfolio)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Expected ROI</p>
              <p className="text-sm font-medium text-green-600">
                {rec.expected_returns.total_expected_roi_percent?.toFixed(1) || 'N/A'}%
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}