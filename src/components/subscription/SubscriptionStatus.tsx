import React from 'react'
import { useSubscription } from '../../hooks/useSubscription'
import { Crown, Clock, AlertCircle } from 'lucide-react'

export function SubscriptionStatus() {
  const { subscription, loading, planName } = useSubscription()

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="animate-pulse flex space-x-4">
          <div className="rounded-full bg-gray-200 h-10 w-10"></div>
          <div className="flex-1 space-y-2 py-1">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!subscription || !subscription.subscription_status || subscription.subscription_status === 'not_started') {
    return (
      <div className="bg-gray-50 rounded-lg border p-4">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-gray-400" />
          <div>
            <p className="font-medium text-gray-900">No Active Subscription</p>
            <p className="text-sm text-gray-600">Subscribe to access premium features</p>
          </div>
        </div>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'trialing':
        return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'past_due':
      case 'unpaid':
        return 'text-red-600 bg-red-50 border-red-200'
      case 'canceled':
        return 'text-gray-600 bg-gray-50 border-gray-200'
      default:
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Crown className="w-5 h-5" />
      case 'trialing':
        return <Clock className="w-5 h-5" />
      default:
        return <AlertCircle className="w-5 h-5" />
    }
  }

  const formatDate = (timestamp: number | null) => {
    if (!timestamp) return 'N/A'
    return new Date(timestamp * 1000).toLocaleDateString()
  }

  return (
    <div className={`rounded-lg border p-4 ${getStatusColor(subscription.subscription_status)}`}>
      <div className="flex items-center gap-3 mb-3">
        {getStatusIcon(subscription.subscription_status)}
        <div>
          <p className="font-medium">
            {planName || 'Subscription Plan'}
          </p>
          <p className="text-sm capitalize">
            Status: {subscription.subscription_status.replace('_', ' ')}
          </p>
        </div>
      </div>
      
      {subscription.current_period_end && (
        <div className="text-sm">
          <p>
            {subscription.cancel_at_period_end ? 'Expires' : 'Renews'} on{' '}
            {formatDate(subscription.current_period_end)}
          </p>
        </div>
      )}
      
      {subscription.payment_method_brand && subscription.payment_method_last4 && (
        <div className="text-sm mt-2">
          <p>
            Payment: {subscription.payment_method_brand.toUpperCase()} ending in {subscription.payment_method_last4}
          </p>
        </div>
      )}
    </div>
  )
}