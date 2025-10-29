export enum ECaseFileStatus {
  Pending = "PENDING",
  Uploaded = "UPLOADED",
  Reupload = "REUPLOAD",
}

export interface CaseFile {
  uid: string // UUID
  key: string
  status: ECaseFileStatus
  caseCode: string
  createdAt: string // ISO8601 (OffsetDateTime)
  updatedAt: string // ISO8601 (OffsetDateTime)
}

export interface CaseFileList {
  data: CaseFile[]
  totalCount: number
  totalPages: number
  pageNumber: number
  hasNext: boolean
  hasPrev: boolean
}
