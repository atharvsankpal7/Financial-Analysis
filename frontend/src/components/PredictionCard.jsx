import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react'

export default function PredictionCard({ goldData, silverData, expectedReturns }) {
  const getTrendIcon = (roi) => {
    if (roi > 0) return <TrendingUp className="h-4 w-4 text-green-600" />
    if (roi < 0) return <TrendingDown className="h-4 w-4 text-red-600" />
    return <DollarSign className="h-4 w-4 text-gray-600" />
  }

  const getTrendColor = (roi) => {
    if (roi > 0) return 'text-green-600'
    if (roi < 0) return 'text-red-600'
    return 'text-gray-600'
  }

  const formatPrice = (price) => {
    return `₹${price?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Market Insights</h3>
      
      <div className="space-y-4">
        {/* Gold */}
        {goldData && (
          <div className="border border-slate-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-900">Gold</h4>
              {expectedReturns?.Gold && getTrendIcon(expectedReturns.Gold.roi_percent)}
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Current Price</span>
                <span className="font-medium">{formatPrice(goldData.price)}/g</span>
              </div>
              {expectedReturns?.Gold && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Expected ROI</span>
                  <span className={`font-medium ${getTrendColor(expectedReturns.Gold.roi_percent)}`}>
                    {expectedReturns.Gold.roi_percent.toFixed(1)}%
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Source</span>
                <span className="font-medium capitalize">{goldData.source}</span>
              </div>
            </div>
          </div>
        )}

        {/* Silver */}
        {silverData && (
          <div className="border border-slate-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-900">Silver</h4>
              {expectedReturns?.Silver && getTrendIcon(expectedReturns.Silver.roi_percent)}
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Current Price</span>
                <span className="font-medium">{formatPrice(silverData.price)}/g</span>
              </div>
              {expectedReturns?.Silver && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Expected ROI</span>
                  <span className={`font-medium ${getTrendColor(expectedReturns.Silver.roi_percent)}`}>
                    {expectedReturns.Silver.roi_percent.toFixed(1)}%
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Source</span>
                <span className="font-medium capitalize">{silverData.source}</span>
              </div>
            </div>
          </div>
        )}

        {/* Total Portfolio Performance */}
        {expectedReturns?.total_expected_roi_percent && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-blue-900">Portfolio Performance</h4>
              {getTrendIcon(expectedReturns.total_expected_roi_percent)}
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-blue-700">Expected Total ROI</span>
              <span className="font-bold text-blue-900">
                {expectedReturns.total_expected_roi_percent.toFixed(1)}%
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-slate-200">
        <p className="text-xs text-gray-500 text-center">
          Data updated every 10 minutes • Prices in INR
        </p>
      </div>
    </div>
  )
}