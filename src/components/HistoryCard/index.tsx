import type React from "react"
import { useEffect, useMemo, useState } from "react"
import { Empty, Table, type TablePaginationConfig } from "antd"
import TableSkeleton from "../TableSkeleton/TableSkeleton"
import { ApiService } from "../../services"
import { useQuery } from "@tanstack/react-query"
import { useNotifications } from "../../hooks/use-notifications.hook"
import "./styles.css"

interface HistoryCardProps {
  caseCode: string
}

const HistoryCard: React.FC<HistoryCardProps> = ({ caseCode }) => {
  const { notify } = useNotifications()

  const [historyPage, setHistoryPage] = useState(1)
  const [historyPageSize, setHistoryPageSize] = useState(10)

  const {
    data: historyData,
    isLoading: isHistoryLoading,
    error: historyError,
  } = useQuery({
    queryKey: ["case-history", caseCode, historyPage, historyPageSize],
    queryFn: () =>
      ApiService.getCaseHistory(caseCode, {
        page: historyPage,
        size: historyPageSize,
      }),
    enabled: !!caseCode,
  })

  useEffect(() => {
    if (historyError) {
      notify.error(historyError as Error, "Failed to load case history")
    }
  }, [historyError, notify])

  const historyColumns = useMemo(
    () => [
      {
        title: "Created at",
        dataIndex: "createdAt",
        key: "createdAt",
        render: (date: string) => new Date(date).toLocaleString(),
      },
      { title: "Actor", dataIndex: "actorFullName", key: "actorFullName" },
      {
        title: "Action",
        dataIndex: "actionDescription",
        key: "actionDescription",
      },
    ],
    [],
  )

  const handleHistoryTableChange = (pagination: TablePaginationConfig) => {
    setHistoryPage(pagination.current!)
    setHistoryPageSize(pagination.pageSize!)
  }

  return (
    <div className="historycard-panel">
      <div className="historycard-header">
        <div className="history-title">
          History ({historyData?.totalCount || 0})
        </div>
      </div>
      {isHistoryLoading ? (
        <TableSkeleton columns={historyColumns} rowCount={3} />
      ) : (
        <Table
          dataSource={historyData?.items || []}
          columns={historyColumns}
          rowKey="uid"
          pagination={{
            current: historyPage,
            pageSize: historyPageSize,
            total: historyData?.totalCount || 0,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} items`,
            pageSizeOptions: ["10", "50", "100"],
          }}
          onChange={handleHistoryTableChange}
          scroll={{ x: "max-content" }}
          locale={{
            emptyText: <Empty description="No history yet" />,
          }}
        />
      )}
    </div>
  )
}

export default HistoryCard
