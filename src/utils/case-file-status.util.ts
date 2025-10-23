import { ECaseFileStatus } from '../types/case-file.ts'

export const getCaseFileStatusLabel = (status: ECaseFileStatus): string => {
  switch (status) {
    case ECaseFileStatus.Pending:
      return 'Pending'
    case ECaseFileStatus.Uploaded:
      return 'Uploaded'
    case ECaseFileStatus.Reupload:
      return 'Reupload'
    default:
      return 'Unknown'
  }
}
