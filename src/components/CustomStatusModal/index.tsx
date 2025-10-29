import type React from "react"
import { useState, useEffect } from "react"
import { Modal, AutoComplete } from "antd"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { App as AntApp } from "antd"

import "./styles.css"
import { ApiService } from "../../services"
import { useNotifications } from "../../hooks/use-notifications.hook"
import { ECaseStatus } from "../../types/case"

interface CustomStatusModalProps {
  caseCode: string
  status?: string
  isOpened: boolean
  onCancel: () => void
}

const CustomStatusModal: React.FC<CustomStatusModalProps> = ({
  caseCode,
  status,
  isOpened,
  onCancel,
}) => {
  const { message } = AntApp.useApp()
  const { notify } = useNotifications()
  const queryClient = useQueryClient()
  const [customStatus, setCustomStatus] = useState(status || "")

  useEffect(() => {
    if (isOpened) {
      setCustomStatus(status || "")
    }
  }, [isOpened, status])

  const statusOptions: Array<{ value: string; label: string }> = Object.values(
    ECaseStatus,
  ).map((statusValue) => ({
    value: statusValue,
    label: statusValue,
  }))

  if (status && !(status in ECaseStatus)) {
    statusOptions.push({ value: status, label: status })
  }

  const customStatusMutation = useMutation({
    mutationFn: (status: string) =>
      ApiService.updateCaseStatus(caseCode, status),
    onSuccess: () => {
      message.success("Case status updated successfully")
      queryClient.invalidateQueries({ queryKey: ["case", caseCode] })
      queryClient.invalidateQueries({ queryKey: ["case-history", caseCode] })
      handleCancel()
    },
    onError: (error) => {
      notify.error(error, "Failed to update case status")
    },
  })

  const handleCustomStatus = () => {
    if (customStatus.trim()) {
      customStatusMutation.mutate(customStatus.trim())
    }
  }

  const handleCancel = () => {
    setCustomStatus("")
    onCancel()
  }

  return (
    <Modal
      title="Set Status"
      open={isOpened}
      onOk={handleCustomStatus}
      onCancel={handleCancel}
      okText="Set Status"
      cancelText="Cancel"
      confirmLoading={customStatusMutation.isPending}
      okButtonProps={{ disabled: !customStatus.trim() }}
    >
      <AutoComplete
        placeholder="Enter status or select from predefined"
        value={customStatus}
        options={statusOptions}
        onChange={setCustomStatus}
        onSelect={setCustomStatus}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleCustomStatus()
          }
        }}
        disabled={customStatusMutation.isPending}
        allowClear
        className="custom-status-input"
      />
    </Modal>
  )
}

export default CustomStatusModal
