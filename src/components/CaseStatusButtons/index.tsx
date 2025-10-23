import React from 'react'
import { App as AntApp, Button, Popconfirm, Space } from 'antd'
import { CheckOutlined, CloseOutlined } from '@ant-design/icons'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { ApiService } from '../../services'
import { useNotifications } from '../../hooks/use-notifications.hook'
import { ECaseStatus } from '../../types/case'
import { canApproveCase, canRejectCase } from '../../utils/case-status.util'

interface CaseStatusButtonsProps {
  caseCode: string
  caseStatus?: string
}

const CaseStatusButtons: React.FC<CaseStatusButtonsProps> = ({ caseCode, caseStatus }) => {
  const { message } = AntApp.useApp()
  const { notify, contextHolder: notificationContextHolder } = useNotifications()
  const queryClient = useQueryClient()

  const approveMutation = useMutation({
    mutationFn: () => ApiService.updateCaseStatus(caseCode, ECaseStatus.APPROVED),
    onSuccess: () => {
      message.success('Case approved successfully')
      queryClient.invalidateQueries({ queryKey: ['case', caseCode] })
      queryClient.invalidateQueries({ queryKey: ['case-history', caseCode] })
    },
    onError: (error) => {
      notify.error(error, 'Failed to approve case')
    }
  })

  const rejectMutation = useMutation({
    mutationFn: () => ApiService.updateCaseStatus(caseCode, ECaseStatus.REJECTED),
    onSuccess: () => {
      message.success('Case rejected successfully')
      queryClient.invalidateQueries({ queryKey: ['case', caseCode] })
      queryClient.invalidateQueries({ queryKey: ['case-history', caseCode] })
    },
    onError: (error) => {
      notify.error(error, 'Failed to reject case')
    }
  })

  const handleApprove = () => {
    approveMutation.mutate()
  }

  const handleReject = () => {
    rejectMutation.mutate()
  }

  const isAnyMutationPending = approveMutation.isPending || rejectMutation.isPending

  const isApproveDisabled = !canApproveCase(caseStatus) || isAnyMutationPending
  const isRejectDisabled = !canRejectCase(caseStatus) || isAnyMutationPending

  return (
    <>
      {notificationContextHolder}
      <Space>
        <Popconfirm
          title="Reject Case"
          description={`Are you sure you want to reject case ${caseCode}?`}
          onConfirm={handleReject}
          okText="Yes"
          cancelText="No"
          okButtonProps={{ danger: true }}
          disabled={isRejectDisabled}
        >
          <Button
            danger
            icon={<CloseOutlined />}
            loading={rejectMutation.isPending}
            disabled={isRejectDisabled}
          >
            Reject
          </Button>
        </Popconfirm>
        
        <Popconfirm
          title="Approve Case"
          description={`Are you sure you want to approve case ${caseCode}?`}
          onConfirm={handleApprove}
          okText="Yes"
          cancelText="No"
          okButtonProps={{ type: 'primary' }}
          disabled={isApproveDisabled}
        >
          <Button
            type="primary"
            icon={<CheckOutlined />}
            loading={approveMutation.isPending}
            disabled={isApproveDisabled}
          >
            Approve
          </Button>
        </Popconfirm>
      </Space>
    </>
  )
}

export default CaseStatusButtons
