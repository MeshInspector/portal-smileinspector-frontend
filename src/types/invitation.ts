export enum EInvitationStatus {
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
  EXPIRED = "EXPIRED",
  CANCELLED = "CANCELLED",
}

export interface InvitationResponse {
  uid: string
  accountUid: string
  email: string
  status: string
  createdAt: string
  expiresAt: string
  acceptedAt: string | null
  invitedByUid: string
}

export interface InvitationListResponse {
  items: InvitationResponse[]
  nextCursor: string | null
  hasMore: boolean
}
