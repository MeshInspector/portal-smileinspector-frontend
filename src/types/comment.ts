export interface Comment {
  uid: string
  createdAt: string // ISO8601
  createdByUid: string
  createdByName: string
  content: string
}

export interface CommentList {
  items: Comment[]
  totalCount: number
  totalPages: number
  pageNumber: number
  hasNext: boolean
  hasPrev: boolean
}

export interface CommentInput {
  content: string
}
