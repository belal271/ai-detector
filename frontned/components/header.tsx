'use client'

import { useRouter } from 'next/navigation'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'
import { useUser } from '@/lib/supabase/hooks'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface HeaderProps {
  title: string
}

export function Header({ title }: HeaderProps) {
  const router = useRouter()
  const { user, loading } = useUser()
  const supabase = createClient()

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      toast.error('Error signing out', {
        description: error.message,
      })
    } else {
      router.push('/')
      router.refresh()
    }
  }

  // Get user initials for avatar
  const getInitials = (email: string | undefined) => {
    if (!email) return 'U'
    const parts = email.split('@')[0].split(/[._-]/)
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    return email.substring(0, 2).toUpperCase()
  }

  // Get display name (use email prefix or full email)
  const getDisplayName = (email: string | undefined) => {
    if (!email) return 'User'
    const name = email.split('@')[0]
    // Capitalize first letter of each word
    return name
      .split(/[._-]/)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ')
  }

  const displayName = getDisplayName(user?.email)
  const userEmail = user?.email || ''
  const initials = getInitials(user?.email)

  return (
    <header className="sticky top-0 border-b border-border bg-card z-30">
      <div className="flex items-center justify-between h-16 px-6">
        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative w-10 h-10 rounded-full p-0" disabled={loading}>
              <Avatar>
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {loading ? '...' : initials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>{displayName}</DropdownMenuLabel>
            <DropdownMenuLabel className="font-normal text-sm text-muted-foreground">
              {userEmail}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
