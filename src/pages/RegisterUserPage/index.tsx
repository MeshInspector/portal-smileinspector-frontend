import { Card, Button, Typography, Space, Form, Input, Spin } from "antd"
import { useMutation, useQuery } from "@tanstack/react-query"
import { useParams, useRouter } from "@tanstack/react-router"
import { useEffect } from "react"
import { App as AntApp } from "antd"

import "./styles.css"
import { useNotifications } from "../../hooks/use-notifications.hook.ts"
import { ApiService } from "../../services"
import { usePageTitle } from "../../signals/title.signal.ts"

const { Title, Paragraph } = Typography

interface RegisterFormValues {
  password: string
  confirmPassword: string
}

const RegisterUserPage = () => {
  const { setPageTitle } = usePageTitle()
  const router = useRouter()
  const { invitationUid } = useParams({ strict: false })
  const { notify, contextHolder: notificationContextHolder } =
    useNotifications()
  const { message } = AntApp.useApp()
  const [form] = Form.useForm<RegisterFormValues>()

  useEffect(() => {
    setPageTitle("Register User")
  }, [setPageTitle])

  const {
    data: invitation,
    isLoading: isInvitationLoading,
    error: invitationError,
  } = useQuery({
    queryKey: ["invitation", invitationUid],
    queryFn: () => ApiService.getInvitationByUid(invitationUid),
    enabled: !!invitationUid,
  })

  const acceptInvitationMutation = useMutation({
    mutationFn: async (values: RegisterFormValues) => {
      if (!invitationUid) {
        throw new Error("Invitation UID not found")
      }
      await ApiService.acceptInvitation(invitationUid, values.password)
    },
    onSuccess: () => {
      message.success("Registration successful")
      router.navigate({ to: "/cases" })
    },
    onError: (error) => {
      notify.error(error as Error, "Failed to accept invitation")
    },
  })

  useEffect(() => {
    if (invitationError) {
      notify.error(invitationError as Error, "Failed to load invitation")
    }
  }, [invitationError, notify])

  const handleSubmit = (values: RegisterFormValues) => {
    if (values.password !== values.confirmPassword) {
      form.setFields([
        {
          name: "confirmPassword",
          errors: ["Passwords do not match"],
        },
      ])
      return
    }

    acceptInvitationMutation.mutate(values)
  }

  if (isInvitationLoading) {
    return (
      <div className="register-user-page">
        {notificationContextHolder}
        <Card>
          <div style={{ textAlign: "center", padding: "40px" }}>
            <Spin size="large" />
          </div>
        </Card>
      </div>
    )
  }

  if (!invitation) {
    return (
      <div className="register-user-page">
        {notificationContextHolder}
        <Card>
          <Title level={3}>Invitation not found</Title>
          <Paragraph>The invitation link is invalid or has expired.</Paragraph>
        </Card>
      </div>
    )
  }

  const organizationName =
    invitation.accountName || invitation.accountUid || "the organization"

  return (
    <div className="register-user-page">
      {notificationContextHolder}
      <Card>
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <Title level={3}>Complete Your Registration</Title>
          <Paragraph style={{ fontSize: "16px" }}>
            You have been invited to join <strong>{organizationName}</strong>.
            Please set your password to complete the registration.
          </Paragraph>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            style={{ width: "100%" }}
          >
            <Form.Item
              label="Email"
              name="email"
              initialValue={invitation.email}
            >
              <Input disabled />
            </Form.Item>
            <Form.Item
              label="Password"
              name="password"
              rules={[
                { required: true, message: "Please enter your password" },
                {
                  min: 8,
                  message: "Password must be at least 8 characters",
                },
              ]}
            >
              <Input.Password placeholder="Enter your password" />
            </Form.Item>
            <Form.Item
              label="Confirm Password"
              name="confirmPassword"
              dependencies={["password"]}
              rules={[
                { required: true, message: "Please confirm your password" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve()
                    }
                    return Promise.reject(
                      new Error("Passwords do not match"),
                    )
                  },
                }),
              ]}
            >
              <Input.Password placeholder="Confirm your password" />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                size="large"
                htmlType="submit"
                loading={acceptInvitationMutation.isPending}
                disabled={acceptInvitationMutation.isPending}
                block
              >
                Register
              </Button>
            </Form.Item>
          </Form>
        </Space>
      </Card>
    </div>
  )
}

export default RegisterUserPage
