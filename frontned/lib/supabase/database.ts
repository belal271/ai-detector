'use client'

import { createClient } from './client'

export interface Submission {
  id: string
  user_id: string
  user_name: string
  content: any // JSONB type
  report: any | null // JSONB type
  created_at: string
}

export async function createSubmission(text: string, userId: string, userName: string) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('submissions')
    .insert([
      {
        user_id: userId,
        user_name: userName,
        content: { text: text }, // Store as JSONB object
        report: null,
      },
    ])
    .select()
    .single()

  if (error) {
    throw error
  }

  return data as Submission
}

export async function getSubmissions() {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('submissions')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return data as Submission[]
}

