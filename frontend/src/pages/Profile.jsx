import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, User } from 'lucide-react'
import UserForm from '../components/UserForm'

export default function Profile() {
  const { userId } = useParams()
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    // In production, fetch user data
    // For now, create mock data based on seed
    const mockUsers = {
      '1': {
        id: 1,
        name: 'Test User 1',
        age: 28,
        income: 500000,
        risk_preference: 'low',
        investment_goals: 'short-term',
        selected_instruments: ['FD', 'Bank'],
        rates: { FD: 6.5, Bank: 3.25, SIP: 10 },
        investable_amount: 100000
      },
      '2': {
        id: 2,
        name: 'Test User 2',
        age: 34,
        income: 900000,
        risk_preference: 'medium',
        investment_goals: 'long-term',
        selected_instruments: ['FD', 'SIP', 'Bank'],
        rates: { FD: 6.0, Bank: 3.5, SIP: 12 },
        investable_amount: 300000
      },
      '3': {
        id: 3,
        name: 'Test User 3',
        age: 42,
        income: 1200000,
        risk_preference: 'high',
        investment_goals: 'long-term',
        selected_instruments: ['SIP', 'FD'],
        rates: { FD: 6.2, Bank: 3.0, SIP: 15 },
        investable_amount: 500000
      }
    }

    if (mockUsers[userId]) {
      setUser(mockUsers[userId])
    }
    setIsLoading(false)
  }, [userId])

  const handleSubmit = async (formData) => {
    setIsSaving(true)
    
    try {
      const response = await fetch(`/api/user/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()
      
      if (result.status === 'ok') {
        alert('Profile updated successfully!')
        navigate(`/dashboard?user_id=${userId}`)
      } else {
        throw new Error(result.message || 'Failed to update profile')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Error updating profile. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">User not found</p>
          <button 
            onClick={() => navigate('/onboarding')}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors"
          >
            Go to Onboarding
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(`/dashboard?user_id=${userId}`)}
              className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-xl">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
                <p className="text-sm text-gray-600">Update your investment preferences</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Edit Profile</h2>
            <p className="text-gray-600">Modify your rates and investment preferences below</p>
          </div>

          <UserForm 
            initialData={user}
            onSubmit={handleSubmit} 
            isLoading={isSaving}
            submitText="Save Changes"
            icon={<Save className="h-5 w-5" />}
          />
        </div>
      </div>
    </div>
  )
}