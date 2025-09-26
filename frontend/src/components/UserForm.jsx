import { useState } from 'react'
import { ChevronDown, DollarSign } from 'lucide-react'

const INSTRUMENT_OPTIONS = [
  { value: 'FD', label: 'Fixed Deposit (FD)' },
  { value: 'Bank', label: 'Bank Savings Account' },
  { value: 'SIP', label: 'Systematic Investment Plan (SIP)' }
]

export default function UserForm({ initialData, onSubmit, isLoading, submitText = "Create Profile", icon }) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    age: initialData?.age || '',
    income: initialData?.income || '',
    investable_amount: initialData?.investable_amount || '',
    risk_preference: initialData?.risk_preference || 'medium',
    investment_goals: initialData?.investment_goals || 'long-term',
    selected_instruments: initialData?.selected_instruments || [],
    rates: initialData?.rates || {}
  })

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleInstrumentToggle = (instrument) => {
    setFormData(prev => {
      const selected = prev.selected_instruments.includes(instrument)
      const newSelected = selected
        ? prev.selected_instruments.filter(i => i !== instrument)
        : [...prev.selected_instruments, instrument]
      
      return {
        ...prev,
        selected_instruments: newSelected
      }
    })
  }

  const handleRateChange = (instrument, rate) => {
    setFormData(prev => ({
      ...prev,
      rates: { ...prev.rates, [instrument]: parseFloat(rate) || 0 }
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Validation
    if (!formData.name || !formData.age || !formData.income || !formData.investable_amount) {
      alert('Please fill in all required fields')
      return
    }

    if (formData.selected_instruments.length === 0) {
      alert('Please select at least one investment instrument')
      return
    }

    // Ensure rates are provided for selected instruments
    for (const instrument of formData.selected_instruments) {
      if (!formData.rates[instrument] || formData.rates[instrument] <= 0) {
        alert(`Please provide a valid rate for ${instrument}`)
        return
      }
    }

    onSubmit({
      name: formData.name,
      age: parseInt(formData.age),
      income: parseFloat(formData.income),
      investable_amount: parseFloat(formData.investable_amount),
      risk_preference: formData.risk_preference,
      investment_goals: formData.investment_goals,
      selected_instruments: formData.selected_instruments,
      rates: formData.rates
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="Enter your full name"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Age *
            </label>
            <input
              type="number"
              value={formData.age}
              onChange={(e) => handleInputChange('age', e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="Enter your age"
              min="18"
              max="100"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Annual Income (₹) *
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="number"
                value={formData.income}
                onChange={(e) => handleInputChange('income', e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="500000"
                min="0"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Investable Amount (₹) *
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="number"
                value={formData.investable_amount}
                onChange={(e) => handleInputChange('investable_amount', e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="100000"
                min="0"
                required
              />
            </div>
          </div>
        </div>
      </div>

      {/* Investment Preferences */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Investment Preferences</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Risk Preference
            </label>
            <div className="relative">
              <select
                value={formData.risk_preference}
                onChange={(e) => handleInputChange('risk_preference', e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none transition-colors"
              >
                <option value="low">Low Risk</option>
                <option value="medium">Medium Risk</option>
                <option value="high">High Risk</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Investment Goals
            </label>
            <div className="relative">
              <select
                value={formData.investment_goals}
                onChange={(e) => handleInputChange('investment_goals', e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none transition-colors"
              >
                <option value="short-term">Short-term (1-3 years)</option>
                <option value="long-term">Long-term (3+ years)</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Investment Instruments */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Investment Instruments</h3>
        <p className="text-sm text-gray-600">Select the instruments you're interested in and provide expected rates</p>
        
        <div className="space-y-4">
          {INSTRUMENT_OPTIONS.map((option) => (
            <div key={option.value} className="border border-slate-200 rounded-xl p-4">
              <div className="flex items-center space-x-3 mb-3">
                <input
                  type="checkbox"
                  id={option.value}
                  checked={formData.selected_instruments.includes(option.value)}
                  onChange={() => handleInstrumentToggle(option.value)}
                  className="h-5 w-5 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                />
                <label htmlFor={option.value} className="text-lg font-medium text-gray-900">
                  {option.label}
                </label>
              </div>
              
              {formData.selected_instruments.includes(option.value) && (
                <div className="ml-8">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expected Annual Rate (%)
                  </label>
                  <input
                    type="number"
                    value={formData.rates[option.value] || ''}
                    onChange={(e) => handleRateChange(option.value, e.target.value)}
                    className="w-32 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="6.5"
                    min="0"
                    max="30"
                    step="0.1"
                    required
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-6">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-4 px-6 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            <>
              {icon}
              <span>{submitText}</span>
            </>
          )}
        </button>
      </div>
    </form>
  )
}