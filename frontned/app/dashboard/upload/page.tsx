'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Header } from '@/components/header'
import { Loader2 } from 'lucide-react'
import { useUser } from '@/lib/supabase/hooks'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'

export default function UploadPage() {
  const router = useRouter()
  const { user, loading: userLoading } = useUser()
  const supabase = createClient()
  const [text, setText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!text.trim()) {
      toast.error('Please enter some text')
      return
    }

    if (!user) {
      toast.error('You must be logged in to submit')
      return
    }

    setIsSubmitting(true)

    try {
      // Get the session token for authentication
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        throw new Error('No authentication token available')
      }

      // Call backend API for analysis
      const response = await fetch(`${BACKEND_URL}/analyze-document`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          text: text,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Analysis failed')
      }

      const result = await response.json()
      
      toast.success('Analysis complete', {
        description: 'Your document has been analyzed and saved',
      })
      
      setText('')
      router.refresh()
    } catch (error: any) {
      toast.error('Failed to analyze text', {
        description: error.message || 'Please try again later',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Header title="Analyze New Document" />
      <div className="p-6 md:p-8">
        <Card className="border-border/40 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Analyze New Document</CardTitle>
            <CardDescription>Paste your document text to check for plagiarism and AI-generated content</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Paste your document text here..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="min-h-80 resize-none bg-muted border-border/50 text-foreground placeholder:text-muted-foreground"
            />
          </CardContent>
          <CardFooter className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setText('')}
              disabled={isSubmitting || userLoading}
              className="border-border/50"
            >
              Clear
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!text.trim() || isSubmitting || userLoading}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                'Analyze Text'
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </>
  )
}
