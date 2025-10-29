import type React from "react"
import { Button, Card, Popconfirm, Row, Space, Table, Typography } from "antd"
import { DeleteOutlined, EditOutlined, ExportOutlined } from "@ant-design/icons"

import Copyable from "../Copyable"
import CopyLinkButton from "../CopyLinkButton"
import CaseStatusButtons from "../CaseStatusButtons"

const { Title } = Typography

interface CaseCardProps {
  code: string
  status?: string
  displayCode?: string
  dataSource: any[]
  columns: any
  onDelete: () => void
}

const CaseCard: React.FC<CaseCardProps> = ({
  code,
  status,
  displayCode,
  dataSource,
  columns,
  onDelete,
}) => {
  return (
    <Card
      title={
        <Row justify="start" align="middle">
          <Title className="case-title" level={3}>
            Case:{" "}
            <Copyable value={displayCode ?? code}>
              {displayCode ?? code}
            </Copyable>
          </Title>
          <Button className="case-link-button" icon={<EditOutlined />} />
        </Row>
      }
      extra={
        <Space>
          <CopyLinkButton />
          <Button
            href={`${import.meta.env.VITE_VIEWER_URL}/?caseCode=${code}`}
            target={"_blank"}
            icon={<ExportOutlined />}
          >
            Open in Viewer
          </Button>
        </Space>
      }
      className="case-container"
    >
      <Table
        dataSource={dataSource}
        columns={columns}
        pagination={false}
        showHeader={false}
        size="small"
      />
      <div className="case-card-footer-container">
        <Popconfirm
          title="Delete Case"
          description={`Are you sure you want to delete case ${code}?`}
          onConfirm={onDelete}
          okText="Yes"
          cancelText="No"
          okButtonProps={{ danger: true }}
        >
          <Button type="text" icon={<DeleteOutlined />} danger>
            Delete Case
          </Button>
        </Popconfirm>
        <CaseStatusButtons caseCode={code} caseStatus={status} />
      </div>
    </Card>
  )
}

export default CaseCard
