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
    ai_reasoning?: string
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

// Mock data for internal matches (to be implemented later)
const mockInternalMatches = [
  {
    id: '1',
    studentName: 'Previous Submission',
    dateSubmitted: '2024-10-15',
    matchPercentage: 45,
  },
  {
    id: '2',
    studentName: 'Similar Document',
    dateSubmitted: '2024-09-20',
    matchPercentage: 28,
  },
]

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
          <DialogTitle className="text-2xl">Analysis Report</DialogTitle>
          <DialogDescription className="text-base">
            Report for {submission.studentName} • {new Date(submission.dateSubmitted).toLocaleDateString()}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="ai-analysis" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-muted">
            <TabsTrigger value="ai-analysis" className="text-foreground">AI Analysis</TabsTrigger>
            <TabsTrigger value="online-sources" className="text-foreground">Online Sources</TabsTrigger>
            <TabsTrigger value="internal-matches" className="text-foreground">Internal Matches</TabsTrigger>
          </TabsList>

          <TabsContent value="ai-analysis" className="space-y-4">
            <Card className="p-6 border-border/40">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-2">AI Likelihood</h3>
                  <Badge variant={getBadgeColor(submission.aiLikelihood)} className="text-lg px-4 py-1">
                    {submission.aiLikelihood}
                  </Badge>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-2">Reasoning</h3>
                  <p className="text-foreground leading-relaxed">
                    {submission.report?.ai_reasoning || 
                      (submission.aiLikelihood === 'High'
                        ? 'This document shows multiple indicators of AI-generated content including consistent vocabulary, formal structure, and patterns common in large language models.'
                        : submission.aiLikelihood === 'Medium'
                        ? 'This document shows some characteristics that could indicate AI assistance, but they are not conclusive. Further review is recommended.'
                        : 'This document appears to be written by a human with natural writing patterns and variations typical of student work.')}
                  </p>
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
                      <h4 className="font-semibold text-foreground">{source.title || 'Untitled'}</h4>
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
                    <p className="text-sm text-foreground">{source.snippet || 'No snippet available'}</p>
                  </div>
                </Card>
              ))
            ) : (
              <Card className="p-4 border-border/40">
                <p className="text-muted-foreground">No online sources found</p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="internal-matches" className="space-y-3">
            {mockInternalMatches.map((match) => (
              <Card key={match.id} className="p-4 border-border/40">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-foreground">{match.studentName}</h4>
                    <Badge variant="secondary">{match.matchPercentage}% match</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {new Date(match.dateSubmitted).toLocaleDateString()}
                  </p>
                </div>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
