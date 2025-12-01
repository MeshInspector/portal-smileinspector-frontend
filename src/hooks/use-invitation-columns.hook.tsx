import { Button, Input, Select, Space, Tag, Col, Row } from "antd"
import type { FilterDropdownProps } from "antd/es/table/interface"
import type { ColumnsType } from "antd/es/table"
import type { InvitationResponse } from "../types/invitation.ts"
import { EInvitationStatus } from "../types/invitation.ts"

interface UseInvitationColumnsParams {
  emailFilter?: string
  statusFilter?: string
  availableStatuses: string[]
  resendingEmail: string | null
  onUpdateFilters: (email?: string, status?: string) => void
  onResendInvitation: (email: string) => void
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

export const useInvitationColumns = ({
  emailFilter,
  statusFilter,
  availableStatuses,
  resendingEmail,
  onUpdateFilters,
  onResendInvitation,
}: UseInvitationColumnsParams): ColumnsType<InvitationResponse> => {
  return [
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
                onUpdateFilters(value || undefined, statusFilter)
              }}
              style={{ marginBottom: 8, display: "block" }}
            />
            <Space>
              <Button
                type="primary"
                onClick={() => {
                  const value = selectedKeys[0] as string | undefined
                  confirm()
                  onUpdateFilters(value || undefined, statusFilter)
                }}
                size="small"
                style={{ width: 90 }}
              >
                Search
              </Button>
              <Button
                onClick={() => {
                  clearFilters?.()
                  onUpdateFilters(undefined, statusFilter)
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
                    onUpdateFilters(emailFilter, value || undefined)
                  }}
                  size="small"
                  style={{ width: "100%" }}
                >
                  Search
                </Button>
              </Col>
              <Col flex={1}>
                <Button
                  onClick={() => {
                    clearFilters?.()
                    onUpdateFilters(emailFilter, undefined)
                  }}
                  size="small"
                  style={{ width: "100%" }}
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
            onClick={() => onResendInvitation(record.email)}
            loading={isResending}
            disabled={isResending}
          >
            Resend
          </Button>
        )
      },
    },
  ]
}

