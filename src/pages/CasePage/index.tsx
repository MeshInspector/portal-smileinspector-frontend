import type React from "react"
import { useEffect, useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useParams } from "@tanstack/react-router"
import { App as AntApp, Button, Col, Row, Space, Tag, Typography } from "antd"

import "./styles.css"
import type { Case, CaseLockState } from "../../types/case.ts"
import { useNotifications } from "../../hooks/use-notifications.hook.ts"
import CaseSkeleton from "../../components/CaseSkeleton"
import Copyable from "../../components/Copyable"
import { ApiService } from "../../services"
import CommentsCard from "../../components/CommentsCard"
import DetailsPanel from "../../components/DetailsPanel"
import CaseCard from "../../components/CaseCard"
import {
  getCaseStatusColor,
  getCaseStatusLabel,
} from "../../utils/case-status.util.ts"
import { EditOutlined } from "@ant-design/icons"
import CustomStatusModal from "../../components/CustomStatusModal"

type CaseColumn =
  | {
      key: string
      field: string
      value: string
      copyable: boolean
      status?: undefined
    }
  | {
      key: string
      field: string
      value: string
      copyable: boolean
      status: boolean
    }

const { Text } = Typography

const CasePage: React.FC<object> = () => {
  const params = useParams({ strict: false })
  const code = params.code as string
  const { message } = AntApp.useApp()
  const { notify, contextHolder: notificationContextHolder } =
    useNotifications()
  const [isCustomStatusModalVisible, setIsStatusModalVisible] = useState(false)

  const {
    data: caseData,
    isLoading: isCaseLoading,
    error: caseError,
  } = useQuery<Case>({
    queryKey: ["case", code],
    queryFn: () => ApiService.getCase(code),
    enabled: !!code,
  })

  const {
    data: caseLockData,
    isLoading: isCaseLockLoading,
    error: caseLockError,
  } = useQuery<CaseLockState>({
    queryKey: ["case-lock", code],
    queryFn: () => ApiService.getCaseLock(code),
    enabled: !!code,
  })

  const queryClient = useQueryClient()

  const lockCaseMutation = useMutation({
    mutationFn: ApiService.lockCase,
    onSuccess: () => {
      message.success("Case locked successfully")
      queryClient.invalidateQueries({ queryKey: ["case", code] })
      queryClient.invalidateQueries({ queryKey: ["case-lock", code] })
      queryClient.invalidateQueries({ queryKey: ["case-history", code] })
    },
    onError: (error) => {
      notify.error(error, "Failed to lock case")
    },
  })

  const unlockCaseMutation = useMutation({
    mutationFn: ApiService.unlockCase,
    onSuccess: () => {
      message.success("Case unlocked successfully")
      queryClient.invalidateQueries({ queryKey: ["case", code] })
      queryClient.invalidateQueries({ queryKey: ["case-lock", code] })
      queryClient.invalidateQueries({ queryKey: ["case-history", code] })
    },
    onError: (error) => {
      notify.error(error, "Failed to unlock case")
    },
  })

  const deleteCaseMutation = useMutation({
    mutationFn: ApiService.deleteCase,
    onSuccess: () => {
      message.success("Case deleted successfully")
      window.location.href = "/cases"
    },
    onError: (error) => {
      notify.error(error, "Failed to delete case")
    },
  })

  const handleLockUnlock = () => {
    if (caseLockData?.isLocked) {
      unlockCaseMutation.mutate(code)
    } else {
      lockCaseMutation.mutate(code)
    }
  }

  const showSetStatusModal = () => {
    setIsStatusModalVisible(true)
  }

  const handleCancelSetStatus = () => {
    setIsStatusModalVisible(false)
  }

  useEffect(() => {
    if (caseError) {
      notify.error(caseError, "Failed to load case")
    }
    if (caseLockError) {
      notify.error(caseLockError, "Failed to load case lock status")
    }
  }, [caseError, caseLockError, notify])

  const caseDataForTable = caseData
    ? [
        {
          key: "doctor",
          field: "Doctor",
          value: `${caseData.doctorFirstName || ""} ${caseData.doctorLastName || ""}`,
          copyable: true,
        },
        {
          key: "patient",
          field: "Patient",
          value: `${caseData.patientFirstName} ${caseData.patientLastName}`,
          copyable: true,
        },
        {
          key: "caseName",
          field: "Name",
          value: caseData.caseName,
          copyable: true,
        },
        {
          key: "description",
          field: "Description",
          value: caseData.description,
          copyable: true,
        },
        {
          key: "locked",
          field: "Locked",
          value: caseLockData?.isLocked ? "Yes" : "No",
          copyable: false,
          status: caseLockData?.isLocked,
        },
        {
          key: "status",
          field: "Status",
          value: getCaseStatusLabel(caseData.status),
          copyable: false,
        },
        {
          key: "externalId",
          field: "External ID",
          value: caseData.externalId || "-",
          copyable: true,
        },
        {
          key: "createdAt",
          field: "Created at",
          value: new Date(caseData.createdAt).toLocaleString(),
          copyable: true,
        },
        {
          key: "updatedAt",
          field: "Updated at",
          value: new Date(caseData.updatedAt).toLocaleString(),
          copyable: true,
        },
      ]
    : []

  const caseColumns = [
    {
      title: "Field",
      dataIndex: "field",
      key: "field",
      width: 120,
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: "Value",
      dataIndex: "value",
      key: "value",
      render: (value: string, record: CaseColumn) => {
        if (record.field === "Locked") {
          return (
            <Space>
              <Tag color={record.status ? "red" : "green"}>{value}</Tag>
              <Button
                type="primary"
                size="small"
                onClick={handleLockUnlock}
                disabled={
                  isCaseLockLoading ||
                  (record.status && !caseLockData?.canBeUnlocked)
                }
              >
                {record.status ? "Unlock" : "Lock"}
              </Button>
            </Space>
          )
        }
        if (record.field === "Status") {
          return (
            <Space>
              {caseData?.status ? (
                <Tag color={getCaseStatusColor(caseData?.status)}>{value}</Tag>
              ) : (
                value
              )}
              <Button
                type="default"
                size="small"
                icon={<EditOutlined />}
                onClick={showSetStatusModal}
              >
                Set Status
              </Button>
            </Space>
          )
        }
        if (record.copyable) {
          return <Copyable value={value}>{value}</Copyable>
        }
        return value
      },
    },
  ]
  return (
    <>
      {notificationContextHolder}
      {isCaseLoading ? (
        <CaseSkeleton />
      ) : (
        <Row className="case-details-row">
          <Col xs={24} sm={24} md={14} className="case-details-table">
            <CaseCard
              code={code}
              status={caseData?.status}
              displayCode={caseData?.code}
              dataSource={caseDataForTable}
              columns={caseColumns}
              onDelete={() => deleteCaseMutation.mutate(code)}
            />
          </Col>
          <Col xs={24} sm={24} md={10}>
            <CommentsCard caseCode={code} />
          </Col>
        </Row>
      )}

      <DetailsPanel caseCode={code} />

      <CustomStatusModal
        status={caseData?.status}
        isOpened={isCustomStatusModalVisible}
        caseCode={code}
        onCancel={handleCancelSetStatus}
      />
    </>
  )
}

export default CasePage
