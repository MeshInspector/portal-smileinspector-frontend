export interface Case {
  code: string
  description: string
  caseName: string
  doctorFirstName: string | null
  doctorLastName: string | null
  patientFirstName: string
  patientLastName: string
  externalId?: string | null
  isLocked: boolean
  lockedBy?: string | null
  lockedAt?: string | null // ISO8601 (OffsetDateTime)
  status?: string
  createdAt: string // ISO8601 (OffsetDateTime)
  updatedAt: string // ISO8601 (OffsetDateTime)
}

export enum ECaseStatus {
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export interface CaseList {
  items: Case[]
  totalCount: number
  totalPages: number
  pageNumber: number
  hasNext: boolean
  hasPrev: boolean
}

export interface CaseLockState {
  isLocked: boolean
  canBeUnlocked: boolean
  caseCode: string
}
