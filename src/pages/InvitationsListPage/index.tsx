import { Card, Table, Button, Empty } from "antd"
import { useState, useEffect } from "react"
import { useRouter, useSearch } from "@tanstack/react-router"

import "./styles.css"
import { useNotifications } from "../../hooks/use-notifications.hook.ts"
import TableSkeleton from "../../components/TableSkeleton/TableSkeleton.tsx"
import type { InvitationResponse } from "../../types/invitation.ts"
import { EInvitationStatus } from "../../types/invitation.ts"
import { usePageTitle } from "../../signals/title.signal.ts"
import SendInvitationModal from "../../components/SendInvitationModal"
import { useInvitations } from "../../hooks/use-invitations.hook.ts"
import { useInvitationColumns } from "../../hooks/use-invitation-columns.hook.tsx"

const InvitationsListPage = () => {
  const { setPageTitle } = usePageTitle()
  const router = useRouter()
  const search = useSearch({ strict: false })
  const { contextHolder: notificationContextHolder } = useNotifications()
  const [currentCursor, setCurrentCursor] = useState<string | undefined>(
    undefined,
  )
  const [isSendInvitationModalOpen, setIsSendInvitationModalOpen] =
    useState(false)
  const [resendingEmail, setResendingEmail] = useState<string | null>(null)

  const emailFilter = search.email || undefined
  const statusFilter = search.status || undefined

  const {
    invitations,
    nextCursor,
    hasMore,
    isLoading,
    isFetching,
    sendInvitationMutation,
    resendInvitationMutation,
  } = useInvitations({
    currentCursor,
    emailFilter,
    statusFilter,
    onCursorReset: () => setCurrentCursor(undefined),
  })

  useEffect(() => {
    setPageTitle("Invitations")
  }, [setPageTitle])

  const handleLoadMore = () => {
    if (nextCursor) {
      setCurrentCursor(nextCursor)
    }
  }

  const handleOpenSendInvitationModal = () => {
    setIsSendInvitationModalOpen(true)
  }

  const handleCloseSendInvitationModal = () => {
    setIsSendInvitationModalOpen(false)
  }

  const handleSendInvitation = (email: string) => {
    sendInvitationMutation.mutate(email)
    setIsSendInvitationModalOpen(false)
  }

  const handleResendInvitation = (email: string) => {
    setResendingEmail(email)
    resendInvitationMutation.mutate(email, {
      onSettled: () => setResendingEmail(null),
    })
  }

  const availableStatuses = Object.values(EInvitationStatus).sort()

  const updateFilters = (email?: string, status?: string) => {
    const searchParams: Record<string, string | undefined> = {}
    if (email && email.trim()) {
      searchParams.email = email.trim()
    }
    if (status && status.trim()) {
      searchParams.status = status.trim()
    }
    router.navigate({ to: "/invitations", search: searchParams })
  }

  const columns = useInvitationColumns({
    emailFilter,
    statusFilter,
    availableStatuses,
    resendingEmail,
    onUpdateFilters: updateFilters,
    onResendInvitation: handleResendInvitation,
  })

  const skeletonColumns = columns
    .map((col) => {
      if (!("dataIndex" in col) || !col.dataIndex) {
        return null
      }
      const dataIndex = Array.isArray(col.dataIndex)
        ? col.dataIndex[0]
        : col.dataIndex
      return {
        title: (col.title as string) || "",
        dataIndex: dataIndex as string,
        key: (col.key as string) || "",
      }
    })
    .filter((col): col is { title: string; dataIndex: string; key: string } =>
      col !== null
    )

  return (
    <div className={"invitations-list-page"}>
      {notificationContextHolder}
      <Card
        className="invitations-table-container"
        extra={
          <Button type="primary" onClick={handleOpenSendInvitationModal}>
            Invite new user
          </Button>
        }
      >
        {isLoading && invitations.length === 0 ? (
          <TableSkeleton columns={skeletonColumns} />
        ) : (
          <>
            <Table<InvitationResponse>
              dataSource={invitations}
              columns={columns}
              rowKey="uid"
              scroll={{ x: "max-content" }}
              locale={{
                emptyText: <Empty description="No invitations found" />,
              }}
              className="invitations-table"
              pagination={false}
            />
            <div className="invitations-load-more">
              <Button
                type="primary"
                onClick={handleLoadMore}
                loading={isFetching}
                disabled={!hasMore}
              >
                Load More
              </Button>
            </div>
          </>
        )}
      </Card>
      <SendInvitationModal
        open={isSendInvitationModalOpen}
        onCancel={handleCloseSendInvitationModal}
        onSend={handleSendInvitation}
        isLoading={sendInvitationMutation.isPending}
      />
    </div>
  )
}

export default InvitationsListPage
