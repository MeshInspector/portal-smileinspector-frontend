import {
  Card,
  Table,
  Button,
  Empty,
  Input,
  Select,
  Space, Col, Row,
  Modal,
  Tag,
} from "antd"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useState, useEffect } from "react"
import { useRouter, useSearch } from "@tanstack/react-router"
import type { FilterDropdownProps } from "antd/es/table/interface"
import { App as AntApp } from "antd"

import "./styles.css"
import { useNotifications } from "../../hooks/use-notifications.hook.ts"
import TableSkeleton from "../../components/TableSkeleton/TableSkeleton.tsx"
import { ApiService } from "../../services"
import type { InvitationResponse } from "../../types/invitation.ts"
import { EInvitationStatus } from "../../types/invitation.ts"
import { usePageTitle } from "../../signals/title.signal.ts"

const InvitationsListPage = () => {
  const { setPageTitle } = usePageTitle()
  const router = useRouter()
  const search = useSearch({ strict: false })
  const { notify, contextHolder: notificationContextHolder } =
    useNotifications()
  const { message } = AntApp.useApp()
  const queryClient = useQueryClient()
  const [invitations, setInvitations] = useState<InvitationResponse[]>([])
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [currentCursor, setCurrentCursor] = useState<string | undefined>(
    undefined,
  )
  const [isSendInvitationModalOpen, setIsSendInvitationModalOpen] =
    useState(false)
  const [invitationEmail, setInvitationEmail] = useState("")
  const [resendingEmail, setResendingEmail] = useState<string | null>(null)

  const emailFilter = search.email || undefined
  const statusFilter = search.status || undefined

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
      setIsSendInvitationModalOpen(false)
      setInvitationEmail("")
      setCurrentCursor(undefined)
      queryClient.refetchQueries({ queryKey: ["invitations"] })
    },
    onError: (error) => {
      notify.error(error, "Failed to send invitation")
    },
  })

  const resendInvitationMutation = useMutation({
    mutationFn: (email: string) => ApiService.sendInvitation(email),
    onSuccess: () => {
      message.success("Invitation resent successfully")
      setResendingEmail(null)
      setCurrentCursor(undefined)
      queryClient.refetchQueries({ queryKey: ["invitations"] })
    },
    onError: (error) => {
      notify.error(error, "Failed to resend invitation")
      setResendingEmail(null)
    },
  })

  useEffect(() => {
    setPageTitle("Invitations")
  }, [setPageTitle])

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
    setInvitationEmail("")
  }

  const handleSendInvitation = () => {
    if (invitationEmail.trim()) {
      sendInvitationMutation.mutate(invitationEmail.trim())
    }
  }

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const getInvitationStatusColor = (status: string): string => {
    switch (status) {
      case EInvitationStatus.PENDING:
        return "processing"
      case EInvitationStatus.ACCEPTED:
        return "success"
      case EInvitationStatus.CANCELLED:
        return "default"
      case EInvitationStatus.EXPIRED:
        return "error"
      default:
        return "default"
    }
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

  const columns = [
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      ellipsis: true,
      filterDropdown: ({
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters,
      }: FilterDropdownProps) => {
        if (!selectedKeys.length && emailFilter) {
          setSelectedKeys([emailFilter])
        }
        const currentValue = (selectedKeys[0] as string) || emailFilter || ""
        return (
          <div style={{ padding: 8 }}>
            <Input
              placeholder="Search email"
              value={currentValue}
              onChange={(e) =>
                setSelectedKeys(e.target.value ? [e.target.value] : [])
              }
              onPressEnter={() => {
                const value = selectedKeys[0] as string | undefined
                confirm()
                updateFilters(value || undefined, statusFilter)
              }}
              style={{ marginBottom: 8, display: "block" }}
            />
            <Space>
              <Button
                type="primary"
                onClick={() => {
                  const value = selectedKeys[0] as string | undefined
                  confirm()
                  updateFilters(value || undefined, statusFilter)
                }}
                size="small"
                style={{ width: 90 }}
              >
                Search
              </Button>
              <Button
                onClick={() => {
                  clearFilters?.()
                  updateFilters(undefined, statusFilter)
                }}
                size="small"
                style={{ width: 90 }}
              >
                Reset
              </Button>
            </Space>
          </div>
        )
      },
      filteredValue: emailFilter ? [emailFilter] : null,
      filterIcon: (filtered: boolean) => (
        <span style={{ color: filtered ? "#1890ff" : undefined }}>🔍</span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={getInvitationStatusColor(status)}>{status}</Tag>
      ),
      filterDropdown: ({
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters,
      }: FilterDropdownProps) => {
        if (!selectedKeys.length && statusFilter) {
          setSelectedKeys([statusFilter])
        }
        const currentValue = selectedKeys[0] || statusFilter
        return (
          <div style={{ padding: 8 }}>
            <Select
              placeholder="Select status"
              value={currentValue}
              onChange={(value) => setSelectedKeys(value ? [value] : [])}
              style={{ width: 200, marginBottom: 8 }}
              allowClear
              options={availableStatuses.map((status) => ({
                label: status,
                value: status,
              }))}
            />
            <Row gutter={8}>
              <Col flex={1}>
                <Button
                  type="primary"
                  onClick={() => {
                    const value = selectedKeys[0] as string | undefined
                    confirm()
                    updateFilters(emailFilter, value || undefined)
                  }}
                  size="small"
                  style={{ width: '100%' }}
                >
                  Search
                </Button>
              </Col>
              <Col flex={1}>
                <Button
                  onClick={() => {
                    clearFilters?.()
                    updateFilters(emailFilter, undefined)
                  }}
                  size="small"
                  style={{ width: '100%' }}
                >
                  Reset
                </Button>
              </Col>
            </Row>
          </div>
        )
      },
      filteredValue: statusFilter ? [statusFilter] : null,
      filterIcon: (filtered: boolean) => (
        <span style={{ color: filtered ? "#1890ff" : undefined }}>🔍</span>
      ),
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: "Expires At",
      dataIndex: "expiresAt",
      key: "expiresAt",
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: "Accepted At",
      dataIndex: "acceptedAt",
      key: "acceptedAt",
      render: (date: string | null) =>
        date ? new Date(date).toLocaleString() : "-",
    },
    {
      title: "Actions",
      key: "actions",
      dataIndex: "uid",
      render: (_: unknown, record: InvitationResponse) => {
        const isAccepted = record.status === EInvitationStatus.ACCEPTED
        const isResending = resendingEmail === record.email

        if (isAccepted) {
          return null
        }

        return (
          <Button
            type="link"
            size="small"
            onClick={() => {
              setResendingEmail(record.email)
              resendInvitationMutation.mutate(record.email)
            }}
            loading={isResending}
            disabled={isResending}
          >
            Resend
          </Button>
        )
      },
    },
  ]

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
          <TableSkeleton columns={columns} />
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
      <Modal
        title="Send Invitation"
        open={isSendInvitationModalOpen}
        onOk={handleSendInvitation}
        onCancel={handleCloseSendInvitationModal}
        okText="Send"
        cancelText="Cancel"
        confirmLoading={sendInvitationMutation.isPending}
        okButtonProps={{
          disabled: !invitationEmail.trim() || !isValidEmail(invitationEmail.trim()),
        }}
      >
        <Input
          placeholder="Enter email address"
          value={invitationEmail}
          onChange={(e) => setInvitationEmail(e.target.value)}
          onPressEnter={handleSendInvitation}
          disabled={sendInvitationMutation.isPending}
          type="email"
        />
      </Modal>
    </div>
  )
}

export default InvitationsListPage
