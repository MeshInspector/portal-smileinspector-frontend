import {
  Card,
  Col,
  Empty,
  Input,
  Row,
  Table,
  type TablePaginationConfig,
  Tag,
} from "antd"
import { useQuery } from "@tanstack/react-query"
import type { Case, CaseList } from "../../types/case.ts"
import type { Breakpoint } from "antd/es/_util/responsiveObserver"
import { useRouter, useSearch } from "@tanstack/react-router"
import { useEffect } from "react"

import "./styles.css"
import { useNotifications } from "../../hooks/use-notifications.hook.ts"
import TableSkeleton from "../../components/TableSkeleton/TableSkeleton.tsx"
import HighlightedText from "../../components/HighlightedText"
import { ApiService } from "../../services"
import CopyLinkButton from "../../components/CopyLinkButton"
import type { FilterValue, SorterResult } from "antd/es/table/interface"
import {
  getCaseStatusLabel,
  getCaseStatusColor,
} from "../../utils/case-status.util"
import { usePageTitle } from "../../signals/title.signal.ts"

const breakpoints: Breakpoint[] = ["xs", "sm", "md", "lg", "xl", "xxl"]

const tableColumnsMap: Record<string, string> = {
  doctor: "doctorFirstName",
  patient: "patientFirstName",
}

const DEFAULT_PAGE = 1
const DEFAULT_PAGE_SIZE = 10

const CASE_SORTABLE_COLS = [
  "code",
  "caseName",
  "doctorFirstName",
  "patientFirstName",
  "isLocked",
  "status",
  "externalId",
  "createdAt",
  "updatedAt",
]

const isColumnSortable = (col: string) =>
  [
    "code",
    "caseName",
    "doctor",
    "patient",
    "isLocked",
    "status",
    "externalId",
    "createdAt",
    "updatedAt",
  ].includes(col)

const CaseListPage = () => {
  const { setPageTitle } = usePageTitle()
  const router = useRouter()
  const search = useSearch({ strict: false })
  const { notify, contextHolder: notificationContextHolder } =
    useNotifications()
  const current = Number(search.page) || DEFAULT_PAGE
  const pageSize = Number(search.size) || DEFAULT_PAGE_SIZE
  const sort = search.sort || ""
  const q = search.q || ""

  const columns = [
    {
      title: "Code",
      dataIndex: "code",
      key: "code",
      responsive: breakpoints,
      ellipsis: true,
      render: (text: string) => <HighlightedText text={text} highlight={q} />,
    },
    {
      title: "Name",
      dataIndex: "caseName",
      key: "caseName",
      responsive: breakpoints,
      ellipsis: true,
      render: (text: string) => <HighlightedText text={text} highlight={q} />,
    },
    {
      title: "Doctor",
      dataIndex: "doctorFirstName",
      key: "doctor",
      render: (_: string, record: Case) => (
        <HighlightedText
          text={`${record.doctorFirstName || ""} ${record.doctorLastName || ""}`}
          highlight={q}
        />
      ),
      responsive: breakpoints.slice(1),
      ellipsis: true,
    },
    {
      title: "Patient",
      dataIndex: "patientFirstName",
      key: "patient",
      render: (_: string, record: Case) => (
        <HighlightedText
          text={`${record.patientFirstName} ${record.patientLastName}`}
          highlight={q}
        />
      ),
      responsive: breakpoints.slice(1),
      ellipsis: true,
    },
    {
      title: "Locked",
      dataIndex: "isLocked",
      key: "isLocked",
      render: (isLocked: boolean) => (
        <Tag color={isLocked ? "red" : "green"}>{isLocked ? "Yes" : "No"}</Tag>
      ),
      responsive: breakpoints,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string | null) =>
        status ? (
          <Tag color={getCaseStatusColor(status)}>
            {getCaseStatusLabel(status)}
          </Tag>
        ) : (
          "-"
        ),
      responsive: breakpoints,
    },
    {
      title: "External ID",
      dataIndex: "externalId",
      key: "externalId",
      render: (externalId: string | null) => (
        <HighlightedText text={externalId || "-"} highlight={q} />
      ),
      responsive: breakpoints.slice(2),
      ellipsis: true,
    },
    {
      title: "Created at",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => new Date(date).toLocaleString(),
      responsive: breakpoints.slice(2),
    },
    {
      title: "Updated at",
      dataIndex: "updatedAt",
      key: "updatedAt",
      render: (date: string) => new Date(date).toLocaleString(),
      responsive: breakpoints.slice(3),
    },
  ]

  const {
    data: caseListResponse,
    isLoading,
    error,
    isFetching,
  } = useQuery<CaseList>({
    queryKey: ["cases", current, pageSize, sort, q],
    queryFn: () =>
      ApiService.getCases({ page: current, size: pageSize, sort, q }),
  })

  useEffect(() => {
    setPageTitle("Cases")
  }, [setPageTitle])

  useEffect(() => {
    if (error) {
      notify.error(error, "Failed to load cases")
    }
  }, [error, notify])

  let sortField: string | undefined
  let sortOrder: "ascend" | "descend" | undefined
  if (sort) {
    const [field, order] = sort.split(",")
    sortOrder = order === "desc" ? "descend" : "ascend"

    const reverseMap = Object.fromEntries(
      Object.entries(tableColumnsMap).map(([key, value]) => [value, key]),
    )
    sortField = reverseMap[field] || field
  }

  const handleTableChange = (
    pagination: TablePaginationConfig,
    _filters: Record<string, FilterValue | null>,
    sorter: SorterResult<Case> | SorterResult<Case>[],
  ) => {
    let page = pagination.current || 1
    const size = pagination.pageSize || DEFAULT_PAGE_SIZE

    if (size !== pageSize) {
      page = 1
    }

    let field = ""
    let order = ""
    if (!Array.isArray(sorter) && sorter && sorter.field && sorter.order) {
      field = sorter.field as string
      order = sorter.order === "descend" ? "desc" : "asc"

      field = tableColumnsMap[field] || field
    }
    const newSort = field && order ? `${field},${order}` : undefined

    const searchParams: Record<string, string | number> = { page, size }
    if (newSort) searchParams.sort = newSort
    if (q) searchParams.q = q
    router.navigate({ to: "/cases", search: searchParams })
  }

  return (
    <div className={"cases-list-page"}>
      {notificationContextHolder}
      <Card
        title={
          <Row justify="start" align="middle" className={"cases-table-header"}>
            <Col
              flex="auto"
              className="cases-search-container"
              sm={24}
              md={12}
              lg={8}
            >
              <Input.Search
                allowClear
                placeholder="Code, Name, Doctor, Patient, External ID..."
                defaultValue={q}
                onSearch={(value) => {
                  router.navigate({
                    to: "/cases",
                    search: { ...search, q: value, page: 1 },
                  })
                }}
              />
            </Col>
          </Row>
        }
        extra={
          <Row justify="start" align="middle">
            <CopyLinkButton />
          </Row>
        }
        className="cases-table-container"
      >
        {isLoading || isFetching ? (
          <TableSkeleton
            columns={columns}
            sortableColumns={CASE_SORTABLE_COLS}
          />
        ) : (
          <Table<Case>
            dataSource={caseListResponse?.items || []}
            columns={columns.map((col) => {
              if (!isColumnSortable(col.key)) {
                return { ...col, sortOrder: undefined }
              }

              if (tableColumnsMap[col.key]) {
                return {
                  ...col,
                  sorter: true,
                  sortOrder: col.key === sortField ? sortOrder : undefined,
                  dataIndex: tableColumnsMap[col.key],
                }
              }

              return {
                ...col,
                sorter: true,
                sortOrder: col.key === sortField ? sortOrder : undefined,
              }
            })}
            rowKey="code"
            pagination={{
              current,
              pageSize,
              total: caseListResponse?.totalCount,
              showSizeChanger: true,
            }}
            scroll={{ x: "max-content" }}
            onChange={handleTableChange}
            showSorterTooltip
            onRow={(record) => ({
              onClick: () => router.navigate({ to: `/cases/${record.code}` }),
            })}
            locale={{
              emptyText: <Empty description="No cases found" />,
              triggerAsc: "Sort ASC",
              triggerDesc: "Sort DESC",
              cancelSort: "Cancel sort",
            }}
            className="cases-table"
          />
        )}
      </Card>
    </div>
  )
}

export default CaseListPage
