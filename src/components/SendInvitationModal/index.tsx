import { Modal, Input } from "antd"
import { useState } from "react"

interface SendInvitationModalProps {
  open: boolean
  onCancel: () => void
  onSend: (email: string) => void
  isLoading?: boolean
}

const isValidEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const SendInvitationModal = ({
  open,
  onCancel,
  onSend,
  isLoading = false,
}: SendInvitationModalProps) => {
  const [invitationEmail, setInvitationEmail] = useState("")

  const handleSend = () => {
    if (invitationEmail.trim()) {
      onSend(invitationEmail.trim())
    }
  }

  const handleCancel = () => {
    setInvitationEmail("")
    onCancel()
  }

  return (
    <Modal
      title="Send Invitation"
      open={open}
      onOk={handleSend}
      onCancel={handleCancel}
      okText="Send"
      cancelText="Cancel"
      confirmLoading={isLoading}
      okButtonProps={{
        disabled:
          !invitationEmail.trim() || !isValidEmail(invitationEmail.trim()),
      }}
    >
      <Input
        placeholder="Enter email address"
        value={invitationEmail}
        onChange={(e) => setInvitationEmail(e.target.value)}
        onPressEnter={handleSend}
        disabled={isLoading}
        type="email"
      />
    </Modal>
  )
}

export default SendInvitationModal

