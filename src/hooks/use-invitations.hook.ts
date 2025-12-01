import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useState, useEffect } from "react"
import { App as AntApp } from "antd"
import { ApiService } from "../services"
import type { InvitationResponse } from "../types/invitation.ts"
import { useNotifications } from "./use-notifications.hook.ts"

interface UseInvitationsParams {
  currentCursor?: string
  emailFilter?: string
  statusFilter?: string
  onCursorReset?: () => void
}

export const useInvitations = ({
  currentCursor,
  emailFilter,
  statusFilter,
  onCursorReset,
}: UseInvitationsParams) => {
  const { notify } = useNotifications()
  const { message } = AntApp.useApp()
  const queryClient = useQueryClient()
  const [invitations, setInvitations] = useState<InvitationResponse[]>([])
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)

  const {
    data: invitationListResponse,
    isLoading,
    error,
    isFetching,
  } = useQuery({
    queryKey: [
      "invitations",
      currentCursor ?? "initial",
      emailFilter,
      statusFilter,
    ],
    queryFn: () =>
      ApiService.getInvitations(currentCursor, emailFilter, statusFilter),
  })

  const sendInvitationMutation = useMutation({
    mutationFn: (email: string) => ApiService.sendInvitation(email),
    onSuccess: () => {
      message.success("Invitation sent successfully")
      setInvitations([])
      onCursorReset?.()
      queryClient.refetchQueries({ queryKey: ["invitations"] })
    },
    onError: (error) => {
      notify.error(error, "Failed to send invitation")
    },
  })

  const resendInvitationMutation = useMutation({
    mutationFn: (email: string) => ApiService.sendInvitation(email, true),
    onSuccess: () => {
      message.success("Invitation resent successfully")
      setInvitations([])
      onCursorReset?.()
      queryClient.refetchQueries({ queryKey: ["invitations"] })
    },
    onError: (error) => {
      notify.error(error, "Failed to resend invitation")
    },
  })

  useEffect(() => {
    if (invitationListResponse) {
      if (currentCursor) {
        setInvitations((prev) => [...prev, ...invitationListResponse.items])
      } else {
        setInvitations(invitationListResponse.items)
      }
      setNextCursor(invitationListResponse.nextCursor)
      setHasMore(invitationListResponse.hasMore)
    }
  }, [invitationListResponse, currentCursor])

  useEffect(() => {
    if (error) {
      notify.error(error, "Failed to load invitations")
    }
  }, [error, notify])

  return {
    invitations,
    nextCursor,
    hasMore,
    isLoading,
    isFetching,
    sendInvitationMutation,
    resendInvitationMutation,
  }
}
