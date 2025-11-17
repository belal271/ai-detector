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

// Remove trailing slash from backend URL to avoid double slashes
const BACKEND_URL = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000').replace(/\/+$/, '')

export default function UploadPage() {
  const router = useRouter()
  const { user, loading: userLoading } = useUser()
  const supabase = createClient()
  const [text, setText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!text.trim()) {
      toast.error('Vennligst skriv inn tekst')
      return
    }

    if (!user) {
      toast.error('Du må være innlogget for å sende inn')
      return
    }

    setIsSubmitting(true)

    try {
      // Get the session token for authentication
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        throw new Error('Ingen autentiseringstoken tilgjengelig')
      }

      // Call backend API for analysis (ensure single slash)
      const apiUrl = `${BACKEND_URL}/analyze-document`.replace(/([^:]\/)\/+/g, '$1')
      const response = await fetch(apiUrl, {
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
        throw new Error(errorData.detail || 'Analyse mislyktes')
      }

      const result = await response.json()
      
      toast.success('Analyse fullført', {
        description: 'Dokumentet ditt har blitt analysert og lagret',
      })
      
      setText('')
      router.refresh()
    } catch (error: any) {
      toast.error('Kunne ikke analysere tekst', {
        description: error.message || 'Vennligst prøv igjen senere',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Header title="Analyser nytt dokument" />
      <div className="p-6 md:p-8">
        <Card className="border-border/40 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Analyser nytt dokument</CardTitle>
            <CardDescription>Lim inn dokumentteksten din for å sjekke for plagiat og AI-generert innhold</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Lim inn dokumentteksten din her..."
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
              Tøm
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!text.trim() || isSubmitting || userLoading}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyserer...
                </>
              ) : (
                'Analyser tekst'
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </>
  )
}
