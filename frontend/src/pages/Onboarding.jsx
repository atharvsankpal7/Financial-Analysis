import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PiggyBank } from 'lucide-react'
import UserForm from '../components/UserForm'

export default function Onboarding() {
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (formData) => {
    setIsLoading(true)
    
    try {
      // Get geolocation if possible
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

      const response = await fetch('/api/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          lat,
          lon
        }),
      })

      const result = await response.json()
      
      if (result.status === 'ok') {
        navigate(`/dashboard?user_id=${result.user_id}`)
      } else {
        throw new Error(result.message || 'Failed to create user')
      }
    } catch (error) {
      console.error('Error creating user:', error)
      alert('Error creating profile. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-blue-600 p-3 rounded-2xl">
              <PiggyBank className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to FinSight AI</h1>
          <p className="text-gray-600 text-lg">Let's create your personalized investment profile</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-8">
          <UserForm onSubmit={handleSubmit} isLoading={isLoading} />
        </div>
      </div>
    </div>
  )
}