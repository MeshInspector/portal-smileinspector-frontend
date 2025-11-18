import { Card, Button, Typography, Space, Spin } from "antd"
import { useQuery } from "@tanstack/react-query"
import { useParams, useRouter } from "@tanstack/react-router"
import { useEffect } from "react"

import "./styles.css"
import { useNotifications } from "../../hooks/use-notifications.hook.ts"
import { ApiService } from "../../services"
import { EInvitationStatus } from "../../types/invitation.ts"

const { Title, Paragraph } = Typography

const AcceptInvitationPage = () => {
  const router = useRouter()
  const { invitationUid } = useParams({ strict: false })
  const { notify, contextHolder: notificationContextHolder } = useNotifications()

  const {
    data: invitation,
    isLoading: isInvitationLoading,
    error: invitationError,
  } = useQuery({
    queryKey: ["invitation", invitationUid],
    queryFn: () => ApiService.getInvitationByUid(invitationUid),
    enabled: !!invitationUid,
  })

  useEffect(() => {
    if (invitationError) {
      notify.error(invitationError as Error, "Failed to load invitation")
    }
  }, [invitationError, notify])

  const handleAccept = () => {
    if (invitationUid) {
      router.navigate({
        to: "/invitations/$invitationUid/register",
        params: { invitationUid },
      })
    }
  }

  if (isInvitationLoading) {
    return (
      <div className="accept-invitation-page">
        {notificationContextHolder}
        <Card>
          <div style={{ textAlign: "center", padding: "40px" }}>
            <Spin size="large" />
          </div>
        </Card>
      </div>
    )
  }

  if (!invitation || invitation.status !== EInvitationStatus.PENDING) {
    return (
      <div className="accept-invitation-page">
        {notificationContextHolder}
        <Card>
          <Title level={3}>Invitation not found</Title>
          <Paragraph>The invitation link is invalid or has expired.</Paragraph>
        </Card>
      </div>
    )
  }

  const organizationName = invitation.accountName || invitation.accountUid

  return (
    <div className="accept-invitation-page">
      {notificationContextHolder}
      <Card>
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <Title level={3}>You have been invited to organization</Title>
          <Paragraph style={{ fontSize: "16px" }}>
            You have been invited to join <strong>{organizationName}</strong>.
            Click the button below to accept the invitation.
          </Paragraph>
          <Button
            type="primary"
            size="large"
            onClick={handleAccept}
          >
            Accept
          </Button>
        </Space>
      </Card>
    </div>
  )
}

export default AcceptInvitationPage
