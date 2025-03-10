"use client"

import { useState, useEffect } from 'react'
import { AlertCircle, CheckCircle, Loader2, XCircle } from 'lucide-react'
import { 
  Alert, 
  AlertDescription, 
  AlertTitle 
} from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'

export type TransactionStatus = 'idle' | 'pending' | 'confirming' | 'success' | 'error'

interface TransactionStatusProps {
  status: TransactionStatus
  title?: string
  description?: string
  error?: Error | null
  hash?: `0x${string}`
  confirmations?: number
  totalConfirmations?: number
  onRetry?: () => void
  onDismiss?: () => void
}

export function TransactionStatus({
  status,
  title,
  description,
  error,
  hash,
  confirmations = 0,
  totalConfirmations = 3,
  onRetry,
  onDismiss,
}: TransactionStatusProps) {
  const [fadeOut, setFadeOut] = useState(false)
  
  useEffect(() => {
    if (status === 'success') {
      const timer = setTimeout(() => {
        setFadeOut(true)
      }, 5000)
      
      return () => clearTimeout(timer)
    }
  }, [status])
  
  if (status === 'idle') return null
  
  const defaultTitles = {
    pending: 'Transaction Pending',
    confirming: 'Transaction Confirming',
    success: 'Transaction Successful',
    error: 'Transaction Failed',
  }
  
  const defaultDescriptions = {
    pending: 'Your transaction is being processed. Please wait...',
    confirming: `Waiting for confirmations (${confirmations}/${totalConfirmations})`,
    success: 'Your transaction has been confirmed successfully!',
    error: error?.message || 'There was an error processing your transaction.',
  }
  
  const currentTitle = title || defaultTitles[status]
  const currentDescription = description || defaultDescriptions[status]
  
  const renderIcon = () => {
    switch (status) {
      case 'pending':
        return <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
      case 'confirming':
        return <Loader2 className="h-6 w-6 animate-spin text-yellow-500" />
      case 'success':
        return <CheckCircle className="h-6 w-6 text-green-500" />
      case 'error':
        return <XCircle className="h-6 w-6 text-red-500" />
      default:
        return <AlertCircle className="h-6 w-6" />
    }
  }
  
  const getAlertVariant = () => {
    switch (status) {
      case 'pending':
        return 'default'
      case 'confirming':
        return 'default'
      case 'success':
        return 'default'
      case 'error':
        return 'destructive'
      default:
        return 'default'
    }
  }
  
  return (
    <Alert 
      variant={getAlertVariant()}
      className={`transition-opacity duration-1000 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}
    >
      <div className="flex items-start">
        <div className="mr-2 mt-0.5">
          {renderIcon()}
        </div>
        <div className="flex-grow">
          <AlertTitle>{currentTitle}</AlertTitle>
          <AlertDescription className="mt-1">
            {currentDescription}
            
            {status === 'confirming' && (
              <Progress 
                value={(confirmations / totalConfirmations) * 100} 
                className="h-1.5 mt-2" 
              />
            )}
            
            {hash && (
              <div className="mt-2 text-xs text-gray-500 break-all">
                Transaction Hash: {hash}
              </div>
            )}
          </AlertDescription>
        </div>
      </div>
      
      <div className="mt-3 flex space-x-2 justify-end">
        {status === 'error' && onRetry && (
          <Button size="sm" onClick={onRetry}>
            Retry
          </Button>
        )}
        
        {(status === 'success' || status === 'error') && onDismiss && (
          <Button 
            size="sm" 
            variant={status === 'error' ? 'outline' : 'default'} 
            onClick={onDismiss}
          >
            Dismiss
          </Button>
        )}
        
        {hash && (
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => window.open(`https://testnet.sonicscan.org/tx/${hash}`, '_blank')}
          >
            View on SonicScan
          </Button>
        )}
      </div>
    </Alert>
  )
} 