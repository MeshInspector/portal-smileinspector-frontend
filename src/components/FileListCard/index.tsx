import type React from "react"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useNavigate, useParams } from "@tanstack/react-router"
import {
  App as AntApp,
  Button,
  Empty,
  Image,
  Modal,
  Popconfirm,
  Space,
  Table,
  type TablePaginationConfig,
  Tag,
  Upload,
  Spin,
} from "antd"
import type { UploadFile } from "antd/es/upload/interface"
import {
  DeleteOutlined,
  DownloadOutlined,
  InboxOutlined,
  UploadOutlined,
} from "@ant-design/icons"

import TableSkeleton from "../TableSkeleton/TableSkeleton"
import { ApiService } from "../../services"
import {
  ECaseFileStatus,
  type CaseFile,
  type CaseFileList,
} from "../../types/case-file"
import { getCaseFileStatusLabel } from "../../utils/case-file-status.util"
import { useNotifications } from "../../hooks/use-notifications.hook"
import type { Breakpoint } from "antd/es/_util/responsiveObserver"
import "./styles.css"

interface FileListCardProps {
  caseCode: string
}

const FileListCard: React.FC<FileListCardProps> = ({ caseCode }) => {
  const { message } = AntApp.useApp()
  const { notify } = useNotifications()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const params = useParams({ strict: false })

  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [isPreviewLoading, setIsPreviewLoading] = useState(false)

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [uploadFileList, setUploadFileList] = useState<UploadFile[]>([])

  const {
    data: filesData,
    isLoading: isFilesLoading,
    error: filesError,
  } = useQuery<CaseFileList>({
    queryKey: ["case-files", caseCode, currentPage, pageSize],
    queryFn: () =>
      ApiService.getCaseFiles(caseCode, { page: currentPage, size: pageSize }),
    enabled: !!caseCode,
  })

  useEffect(() => {
    if (filesError) {
      notify.error(filesError as Error, "Failed to load case files")
    }
  }, [filesError, notify])

  const uploadFilesMutation = useMutation({
    mutationFn: ({ caseCode, files }: { caseCode: string; files: File[] }) =>
      ApiService.uploadCaseFiles(caseCode, files),
    onSuccess: () => {
      message.success("Files uploaded successfully")
      setIsUploadModalOpen(false)
      setUploadFileList([])
      queryClient.invalidateQueries({ queryKey: ["case-files", caseCode] })
      queryClient.invalidateQueries({ queryKey: ["case-history", caseCode] })
    },
    onError: (error) => {
      notify.error(error as Error, "Failed to upload files")
    },
  })

  const handleTableChange = (pagination: TablePaginationConfig) => {
    setCurrentPage(pagination.current!)
    setPageSize(pagination.pageSize!)
    setSelectedFileIds([])
  }

  const handleSelectionChange = (selectedRowKeys: React.Key[]) => {
    setSelectedFileIds(selectedRowKeys as string[])
  }

  const rowSelection = {
    type: "checkbox" as const,
    selectedRowKeys: selectedFileIds,
    onChange: handleSelectionChange,
    getCheckboxProps: (record: CaseFile) => ({
      disabled: false,
      name: record.key,
    }),
  }

  const handleDeleteFiles = async () => {
    if (!selectedFileIds.length) {
      message.warning("Please select files to delete")
      return
    }

    const selectedFiles =
      filesData?.data.filter((file) => selectedFileIds.includes(file.uid)) || []
    const fileNames = selectedFiles.map((file) => file.key).join(", ")

    message.info(`Deleting ${selectedFileIds.length} file(s): ${fileNames}`)

    try {
      for (const file of selectedFiles) {
        await ApiService.deleteFile(caseCode, file.uid)
      }

      queryClient.invalidateQueries({ queryKey: ["case-files", caseCode] })
      queryClient.invalidateQueries({ queryKey: ["case-history", caseCode] })

      setSelectedFileIds([])

      message.success(`Successfully deleted ${selectedFiles.length} file(s)`)
    } catch (error) {
      notify.error(error as Error, "Failed to delete files")
    }
  }

  const handleDownloadFiles = async () => {
    if (!selectedFileIds.length) {
      message.warning("Please select files to download")
      return
    }

    const selectedFiles =
      filesData?.data.filter((file) => selectedFileIds.includes(file.uid)) || []
    const filesToDownload = selectedFiles.filter(
      (file) => file.status !== ECaseFileStatus.Pending,
    )
    const filesToSkip = selectedFiles.filter(
      (file) => file.status === ECaseFileStatus.Pending,
    )

    if (filesToDownload.length === 0) {
      message.warning(
        `Cannot download files with '${ECaseFileStatus.Pending}' status`,
      )
      return
    }

    const fileNames = filesToDownload.map((file) => file.key).join(", ")
    const skipMessage =
      filesToSkip.length > 0
        ? ` (${filesToSkip.length} files with 'Created' status will be skipped)`
        : ""

    message.info(
      `Downloading ${filesToDownload.length} file(s): ${fileNames}${skipMessage}`,
    )

    try {
      for (const file of filesToDownload) {
        await ApiService.downloadFile(caseCode, file.uid)
      }
      message.success(
        `Successfully initiated download for ${filesToDownload.length} file(s)`,
      )
    } catch (error) {
      notify.error(error as Error, "Failed to download files")
    }
  }

  const handleUploadConfirm = () => {
    const files = uploadFileList
      .map((f) => f.originFileObj as File | undefined)
      .filter((f): f is File => !!f)

    if (files.length === 0) {
      message.warning("Please select files to upload")
      return
    }

    uploadFilesMutation.mutate({ caseCode, files })
  }

  const handleUploadCancel = () => {
    setIsUploadModalOpen(false)
    setUploadFileList([])
  }

  const handleFilePreview = useCallback(
    async (fileUid: string) => {
      try {
        setIsPreviewLoading(true)
        setPreviewImageUrl(null)
        const res = await ApiService.getFileDownloadUrl(caseCode, fileUid)

        // Preload the image to ensure it's fully loaded before displaying
        const img = new window.Image()
        img.onload = () => {
          setPreviewImageUrl(res.url)
          setIsPreviewLoading(false)
        }
        img.onerror = () => {
          console.error("Failed to load image preview")
          setIsPreviewLoading(false)
          setPreviewImageUrl(null)
          notify.error(
            new Error("Failed to load image preview"),
            "Failed to load image preview",
          )
          setIsPreviewOpen(false)
        }
        img.src = res.url
      } catch (e) {
        console.error(e)
        setIsPreviewLoading(false)
        setPreviewImageUrl(null)
      }
    },
    [caseCode, notify],
  )

  // Open Preview by url
  useEffect(() => {
    const fileUid = params.fileUid as string
    if (fileUid) {
      setPreviewImageUrl(null)
      setIsPreviewLoading(true)
      setIsPreviewOpen(true)
      handleFilePreview(fileUid).catch(console.error)
    }
  }, [params.fileUid, handleFilePreview])

  // Close Preview by url
  useEffect(() => {
    const fileUid = params.fileUid as string
    if (!fileUid && isPreviewOpen) {
      setIsPreviewOpen(false)
      setPreviewImageUrl(null)
      setIsPreviewLoading(false)
    }
  }, [params.fileUid, isPreviewOpen])

  const fileColumns = useMemo(
    () => [
      {
        title: "UID",
        dataIndex: "uid",
        key: "uid",
        responsive: ["md", "lg", "xl", "xxl"] as Breakpoint[],
        ellipsis: true,
      },
      {
        title: "File",
        dataIndex: "key",
        key: "key",
        render: (filePath: string, record: CaseFile) => {
          const isImage = /\.(webp|jpg|jpeg|png)$/i.test(filePath || "")
          if (isImage) {
            return (
              <a
                onClick={async (e) => {
                  e.preventDefault()
                  await navigate({
                    from: "/",
                    to: `/cases/${caseCode}/preview/${record.uid}`,
                  })
                }}
              >
                {filePath}
              </a>
            )
          }
          return filePath
        },
        responsive: ["xs", "sm", "md", "lg", "xl", "xxl"] as Breakpoint[],
        ellipsis: true,
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        render: (status: ECaseFileStatus) => (
          <Tag color={status === ECaseFileStatus.Uploaded ? "green" : "blue"}>
            {getCaseFileStatusLabel(status)}
          </Tag>
        ),
        responsive: ["xs", "sm", "md", "lg", "xl", "xxl"] as Breakpoint[],
      },
      {
        title: "Created at",
        dataIndex: "createdAt",
        key: "createdAt",
        render: (date: string) => new Date(date).toLocaleString(),
        responsive: ["md", "lg", "xl", "xxl"] as Breakpoint[],
      },
      {
        title: "Updated at",
        dataIndex: "updatedAt",
        key: "updatedAt",
        render: (date: string) => new Date(date).toLocaleString(),
        responsive: ["lg", "xl", "xxl"] as Breakpoint[],
      },
    ],
    [handleFilePreview],
  )

  return (
    <>
      <div className="filelistcard-panel">
        <div className="filelistcard-header">
          <div className="files-title">
            Files ({filesData?.totalCount || 0})
          </div>
          <Space>
            <Button
              icon={<DownloadOutlined />}
              onClick={handleDownloadFiles}
              disabled={selectedFileIds.length === 0}
            >
              Download ({selectedFileIds.length})
            </Button>
            <Button
              icon={<UploadOutlined />}
              onClick={() => setIsUploadModalOpen(true)}
            >
              Upload Files
            </Button>
            <Popconfirm
              title="Delete files"
              description={`Are you sure you want to delete ${selectedFileIds.length} selected file(s)?`}
              onConfirm={handleDeleteFiles}
              okText="Yes"
              cancelText="No"
              okButtonProps={{ danger: true }}
            >
              <Button
                icon={<DeleteOutlined />}
                danger
                disabled={selectedFileIds.length === 0}
              >
                Delete ({selectedFileIds.length})
              </Button>
            </Popconfirm>
          </Space>
        </div>
        {isFilesLoading ? (
          <TableSkeleton columns={fileColumns} rowCount={5} />
        ) : (
          <Table<CaseFile>
            dataSource={filesData?.data || []}
            columns={fileColumns}
            rowKey="uid"
            rowSelection={rowSelection}
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: filesData?.totalCount || 0,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} items`,
              pageSizeOptions: ["10", "20", "50", "100"],
            }}
            onChange={handleTableChange}
            scroll={{ x: "max-content" }}
            showSorterTooltip
            locale={{
              emptyText: <Empty description="No files found" />,
            }}
          />
        )}
      </div>

      <Modal
        open={isPreviewOpen}
        onCancel={() => navigate({ from: "/", to: `/cases/${caseCode}` })}
        footer={null}
        title="Preview"
      >
        {isPreviewLoading || !previewImageUrl ? (
          <div className="filelistcard-preview-loading">
            <Spin />
          </div>
        ) : (
          <Image
            src={previewImageUrl}
            className="filelistcard-preview-image"
            preview={false}
          />
        )}
      </Modal>
      <Modal
        open={isUploadModalOpen}
        onCancel={handleUploadCancel}
        title="Upload Files"
        footer={[
          <Button key="cancel" onClick={handleUploadCancel}>
            Cancel
          </Button>,
          <Button
            key="upload"
            type="primary"
            onClick={handleUploadConfirm}
            disabled={uploadFileList.length === 0}
            loading={uploadFilesMutation.isPending}
          >
            Upload
          </Button>,
        ]}
      >
        <Upload.Dragger
          multiple
          fileList={uploadFileList}
          beforeUpload={() => false}
          onChange={({ fileList }) =>
            setUploadFileList(fileList as UploadFile[])
          }
        >
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">
            Click or drag file to this area to select
          </p>
          <p className="ant-upload-hint">You can add multiple files.</p>
        </Upload.Dragger>
      </Modal>
    </>
  )
}

export default FileListCard
