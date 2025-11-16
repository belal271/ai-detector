'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Header } from '@/components/header'
import { ReportDialog } from '@/components/report-dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Search, Loader2 } from 'lucide-react'
import { getSubmissions, type Submission } from '@/lib/supabase/database'
import { toast } from 'sonner'

interface SubmissionForDialog {
  id: string
  studentName: string
  dateSubmitted: string
  aiLikelihood: 'Low' | 'Medium' | 'High'
  onlineSources: number
}

export default function HistoryPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedReport, setSelectedReport] = useState<SubmissionForDialog | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    loadSubmissions()
  }, [])

  const loadSubmissions = async () => {
    try {
      setLoading(true)
      const data = await getSubmissions()
      setSubmissions(data)
    } catch (error: any) {
      toast.error('Failed to load submissions', {
        description: error.message || 'Please try again later',
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredData = submissions.filter(item =>
    item.user_name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const openReport = (submission: Submission) => {
    // Extract data from the report JSONB field
    const report = submission.report
    if (!report) {
      toast.error('Report not available', {
        description: 'This submission has not been analyzed yet',
      })
      return
    }

    const reportData: SubmissionForDialog = {
      id: submission.id,
      studentName: submission.user_name,
      dateSubmitted: submission.created_at,
      aiLikelihood: report.ai_likelihood || 'Low',
      onlineSources: report.online_sources_count || 0,
    }
    setSelectedReport(reportData)
    setIsDialogOpen(true)
  }

  return (
    <>
      <Header title="Submission History" />
      <div className="p-6 md:p-8 space-y-6">
        <Card className="border-border/40 shadow-lg">
          <div className="p-4 md:p-6">
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by student name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-muted border-border/50 text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <div className="border border-border/40 rounded-lg overflow-x-auto">
              {loading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : filteredData.length === 0 ? (
                <div className="flex items-center justify-center p-8 text-muted-foreground">
                  {searchQuery ? 'No submissions found matching your search' : 'No submissions yet'}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/40 hover:bg-transparent">
                      <TableHead className="text-foreground font-semibold">Student Name</TableHead>
                      <TableHead className="text-foreground font-semibold">Date Submitted</TableHead>
                      <TableHead className="text-foreground font-semibold">Text Preview</TableHead>
                      <TableHead className="text-foreground font-semibold">Report Status</TableHead>
                      <TableHead className="text-foreground font-semibold">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredData.map((submission) => (
                      <TableRow key={submission.id} className="border-border/40 hover:bg-muted/50">
                        <TableCell className="font-medium">{submission.user_name}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(submission.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <p className="truncate text-sm text-foreground">
                            {submission.content?.text 
                              ? (submission.content.text.length > 100 
                                  ? submission.content.text.substring(0, 100) + '...'
                                  : submission.content.text)
                              : 'No content'}
                          </p>
                        </TableCell>
                        <TableCell>
                          {submission.report ? (
                            <Badge variant="default">Available</Badge>
                          ) : (
                            <Badge variant="secondary">Pending</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openReport(submission)}
                            disabled={!submission.report}
                            className="border-border/50 hover:bg-muted"
                          >
                            {submission.report ? 'View Report' : 'Report Pending'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </div>
        </Card>
      </div>

      {selectedReport && (
        <ReportDialog
          submission={{
            ...selectedReport,
            report: submissions.find(s => s.id === selectedReport.id)?.report
          }}
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
        />
      )}
    </>
  )
}
