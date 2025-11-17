'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ExternalLink } from 'lucide-react'

interface Submission {
  id: string
  studentName: string
  dateSubmitted: string
  aiLikelihood: 'Low' | 'Medium' | 'High'
  onlineSources: number
  report?: {
    ai_likelihood?: string
    online_sources?: Array<{
      url: string
      title: string
      snippet: string
    }>
    online_sources_count?: number
  }
}

interface ReportDialogProps {
  submission: Submission
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}


export function ReportDialog({
  submission,
  isOpen,
  onOpenChange,
}: ReportDialogProps) {
  const getBadgeColor = (likelihood: string) => {
    switch (likelihood) {
      case 'High':
        return 'destructive'
      case 'Medium':
        return 'secondary'
      case 'Low':
        return 'default'
      default:
        return 'default'
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto bg-card border-border/40">
        <DialogHeader>
          <DialogTitle className="text-2xl">Analyserapport</DialogTitle>
          <DialogDescription className="text-base">
            Rapport for {submission.studentName} • {new Date(submission.dateSubmitted).toLocaleDateString()}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="ai-analysis" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-muted">
            <TabsTrigger value="ai-analysis" className="text-foreground">AI-analyse</TabsTrigger>
            <TabsTrigger value="online-sources" className="text-foreground">Nettkilder</TabsTrigger>
          </TabsList>

          <TabsContent value="ai-analysis" className="space-y-4">
            <Card className="p-6 border-border/40">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-2">AI-sannsynlighet</h3>
                  <Badge variant={getBadgeColor(submission.aiLikelihood)} className="text-lg px-4 py-1">
                    {submission.aiLikelihood === 'High' ? 'Høy' : submission.aiLikelihood === 'Medium' ? 'Middels' : 'Lav'}
                  </Badge>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="online-sources" className="space-y-3">
            {submission.report?.online_sources && submission.report.online_sources.length > 0 ? (
              submission.report.online_sources.map((source, index) => (
                <Card key={index} className="p-4 border-border/40 hover:border-primary/30 transition-colors">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-semibold text-foreground">{source.title || 'Uten tittel'}</h4>
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary/80 transition-colors flex-shrink-0"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                    <p className="text-sm text-muted-foreground">{source.url}</p>
                    <p className="text-sm text-foreground">{source.snippet || 'Ingen utdrag tilgjengelig'}</p>
                  </div>
                </Card>
              ))
            ) : (
              <Card className="p-4 border-border/40">
                <p className="text-muted-foreground">Ingen nettkilder funnet</p>
              </Card>
            )}
          </TabsContent>

        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
