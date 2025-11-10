import axios from "axios"
import type { Case, CaseList, CaseLockState } from "../types/case"
import type { CaseFileList } from "../types/case-file.ts"
import type { Comment, CommentList, CommentInput } from "../types/comment.ts"
import type {
  InvitationListResponse,
  InvitationResponse,
} from "../types/invitation.ts"
import { parseError } from "../utils/error.util.ts"
import { cognitoUserPoolsTokenProvider } from "aws-amplify/auth/cognito"

export interface FileDownloadUrlResponse {
  uid: string
  filePath: string
  url: string
  expiresIn: number
}

export interface PresignedUrlsRequestDto {
  filePaths: string[]
}

export interface PresignedUrlResponseDto {
  uid: string
  filePath: string
  url: string
  expiresIn: number
}

export interface UploadsCompleteDto {
  uids: string[]
}

const API_BASE_URL = import.meta.env.VITE_API_URL

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
})

apiClient.interceptors.request.use(async (config) => {
  let tokens = await cognitoUserPoolsTokenProvider.getTokens() // try to go without forceRefresh (using cookies)
  const now = Math.floor(Date.now() / 1000)
  const exp = tokens?.accessToken?.payload?.exp
  const tokenIsExpired = !exp || exp < now

  if (tokenIsExpired) {
    tokens = await cognitoUserPoolsTokenProvider.getTokens({
      forceRefresh: true,
    })
  }

  const token = tokens?.accessToken?.toString()
  if (token && config.headers) {
    config.headers["Authorization"] = `Bearer ${token}`
  }
  if (config.method?.toUpperCase() !== "GET") {
    if (!config.headers?.["Content-Type"]) {
      config.headers["Content-Type"] = "application/json"
    }
  }

  return config
})

export interface CasesQueryParams {
  page?: number
  size?: number
  sort?: string
  q?: string
}

export interface CaseFilesQueryParams {
  page?: number
  size?: number
}

export interface CommentQueryParams {
  page?: number
  size?: number
  sort?: string
}

export interface CaseHistoryQueryParams {
  page?: number
  size?: number
  sort?: string
}

export interface CaseHistoryItem {
  uid: string
  createdAt: string // ISO8601
  actorUid: string
  actorFullName: string
  eventType: string
  actionDescription: string
}

export interface CaseHistoryList {
  items: CaseHistoryItem[]
  totalCount: number
  totalPages: number
  pageNumber: number
  hasNext: boolean
  hasPrev: boolean
}

export class ApiService {
  static async getCases(params: CasesQueryParams = {}): Promise<CaseList> {
    try {
      const { page = 1, size = 10, sort, q } = params

      const queryParams: Record<string, string | number> = {
        page: page - 1,
        size,
      }

      if (sort) queryParams.sort = sort
      if (q) queryParams.q = q

      const response = await apiClient.get<CaseList>("/v1/cases", {
        params: queryParams,
      })

      return response.data
    } catch (error) {
      throw new Error(parseError(error))
    }
  }

  static async getCase(code: string): Promise<Case> {
    try {
      const response = await apiClient.get<Case>(`/v1/cases/${code}`)
      return response.data
    } catch (error) {
      throw new Error(parseError(error))
    }
  }

  static async getCaseFiles(
    caseCode: string,
    params: CaseFilesQueryParams = {},
  ): Promise<CaseFileList> {
    try {
      const { page = 1, size = 10 } = params

      const response = await apiClient.get<CaseFileList>(
        `/v1/cases/${caseCode}/files`,
        {
          params: {
            page: page - 1,
            size,
          },
        },
      )

      return response.data
    } catch (error) {
      throw new Error(parseError(error))
    }
  }

  static async getFileDownloadUrl(
    caseCode: string,
    fileUid: string,
  ): Promise<FileDownloadUrlResponse> {
    try {
      const response = await apiClient.get<FileDownloadUrlResponse>(
        `/v1/cases/${caseCode}/files/${fileUid}/download-url`,
      )
      return response.data
    } catch (error) {
      throw new Error(parseError(error))
    }
  }

  static async downloadFile(caseCode: string, fileUid: string): Promise<void> {
    try {
      const downloadUrlData = await ApiService.getFileDownloadUrl(
        caseCode,
        fileUid,
      )

      const link = document.createElement("a")
      link.href = downloadUrlData.url
      link.target = "_blank"
      link.download = downloadUrlData.filePath.split("/").pop() || fileUid
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      throw new Error(parseError(error))
    }
  }

  static async deleteFile(caseCode: string, fileUid: string): Promise<void> {
    try {
      await apiClient.delete(`/v1/cases/${caseCode}/files/${fileUid}`)
    } catch (error) {
      throw new Error(parseError(error))
    }
  }

  static async getCaseComments(
    caseCode: string,
    params: CommentQueryParams = {},
  ): Promise<CommentList> {
    try {
      const { page = 1, size = 10, sort } = params

      const response = await apiClient.get<CommentList>(
        `/v1/cases/${caseCode}/comments`,
        {
          params: {
            page: page - 1,
            size,
            sort: sort,
          },
        },
      )

      return response.data
    } catch (error) {
      throw new Error(parseError(error))
    }
  }

  static async getCaseHistory(
    caseCode: string,
    params: CaseHistoryQueryParams = {},
  ): Promise<CaseHistoryList> {
    try {
      const { page = 1, size = 50, sort } = params

      const response = await apiClient.get<CaseHistoryList>(
        `/v1/cases/${caseCode}/history`,
        {
          params: {
            page: page - 1,
            size,
            sort,
          },
        },
      )

      return response.data
    } catch (error) {
      throw new Error(parseError(error))
    }
  }

  static async addCaseComment(
    caseCode: string,
    comment: CommentInput,
  ): Promise<Comment> {
    try {
      const response = await apiClient.post<Comment>(
        `/v1/cases/${caseCode}/comments`,
        comment,
      )
      return response.data
    } catch (error) {
      throw new Error(parseError(error))
    }
  }

  static async deleteCaseComment(
    caseCode: string,
    commentUid: string,
  ): Promise<void> {
    try {
      await apiClient.delete(`/v1/cases/${caseCode}/comments/${commentUid}`)
    } catch (error) {
      throw new Error(parseError(error))
    }
  }

  static async deleteCase(code: string): Promise<void> {
    try {
      await apiClient.delete(`/v1/cases/${code}`)
    } catch (error) {
      throw new Error(parseError(error))
    }
  }

  static async lockCase(code: string): Promise<void> {
    try {
      await apiClient.post(`/v1/cases/${code}/lock`)
    } catch (error) {
      throw new Error(parseError(error))
    }
  }

  static async unlockCase(code: string): Promise<void> {
    try {
      await apiClient.delete(`/v1/cases/${code}/lock`)
    } catch (error) {
      throw new Error(parseError(error))
    }
  }

  static async getCaseLock(code: string): Promise<CaseLockState> {
    try {
      const response = await apiClient.get<CaseLockState>(
        `/v1/cases/${code}/lock`,
      )
      return response.data
    } catch (error) {
      throw new Error(parseError(error))
    }
  }

  static async updateCaseStatus(code: string, status: string): Promise<void> {
    try {
      await apiClient.put(`/v1/cases/${code}/status`, { status })
    } catch (error) {
      throw new Error(parseError(error))
    }
  }

  static async createUpload(
    caseCode: string,
    dto: PresignedUrlsRequestDto,
  ): Promise<PresignedUrlResponseDto[]> {
    try {
      const response = await apiClient.post<PresignedUrlResponseDto[]>(
        `/v1/cases/${caseCode}/uploads/presigned-urls`,
        dto,
      )
      return response.data
    } catch (error) {
      throw new Error(parseError(error))
    }
  }

  static async completeUpload(
    caseCode: string,
    dto: UploadsCompleteDto,
  ): Promise<void> {
    try {
      await apiClient.post(`/v1/cases/${caseCode}/uploads/complete`, dto)
    } catch (error) {
      throw new Error(parseError(error))
    }
  }

  static async generatePresignedUrl(
    caseCode: string,
    fileName: string,
  ): Promise<string> {
    const presignedUrls = await ApiService.createUpload(caseCode, {
      filePaths: [fileName],
    })
    if (presignedUrls.length) {
      return presignedUrls[0].url
    }
    throw new Error("Failed to generate presigned URL")
  }

  static async uploadCaseFiles(caseCode: string, files: File[]): Promise<void> {
    try {
      await ApiService.lockCase(caseCode)
      const presignedUrls = await ApiService.createUpload(caseCode, {
        filePaths: files.map((file) => file.name),
      })

      const uploadedUids: string[] = await Promise.all(
        presignedUrls.map(async (item) => {
          const file = files.find((f) => f.name === item.filePath)
          if (!file) {
            throw new Error(`File not found for path: ${item.filePath}`)
          }

          const headers: Record<string, string> = {}
          if (file.type) {
            headers["Content-Type"] = file.type
          }

          const response = await fetch(item.url, {
            method: "PUT",
            headers,
            body: file,
          })

          if (!response.ok) {
            throw new Error(
              `Failed to upload ${item.filePath}: ${response.status} ${response.statusText}`,
            )
          }

          return item.uid
        }),
      )

      await ApiService.completeUpload(caseCode, { uids: uploadedUids })
    } catch (error) {
      throw new Error(parseError(error))
    } finally {
      await ApiService.unlockCase(caseCode)
    }
  }

  static async getInvitations(
    cursor?: string,
    email?: string,
    status?: string,
  ): Promise<InvitationListResponse> {
    try {
      const params: Record<string, string> = {
        limit: '10',
      }
      if (cursor) {
        params.cursor = cursor
      }
      if (email) {
        params.email = email
      }
      if (status) {
        params.status = status
      }

      const response = await apiClient.get<InvitationListResponse>(
        "/v1/invitations",
        {
          params,
        },
      )

      return response.data
    } catch (error) {
      throw new Error(parseError(error))
    }
  }

  static async sendInvitation(email: string): Promise<InvitationResponse> {
    try {
      const response = await apiClient.post<InvitationResponse>(
        "/v1/invitations",
        { email },
      )
      return response.data
    } catch (error) {
      throw new Error(parseError(error))
    }
  }
}

export default ApiService
