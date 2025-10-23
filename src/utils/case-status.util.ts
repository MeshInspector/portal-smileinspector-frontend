import { ECaseStatus } from '../types/case'

const statusToLabelMap: { [key: string]: string } = {
  [ECaseStatus.APPROVED]: 'Approved',
  [ECaseStatus.REJECTED]: 'Rejected',
}

export const getCaseStatusLabel = (status?: string): string => {
  return status ? statusToLabelMap[status] || status : '-'
}

const statusToColorMap: { [key: string]: string } = {
  [ECaseStatus.APPROVED]: 'success',
  [ECaseStatus.REJECTED]: 'error',
}

export const getCaseStatusColor = (status?: string): string => {
  return status ? statusToColorMap[status] || 'default' : 'default'
}

export const isCaseStatusFinal = (status?: string): boolean => {
  return status === ECaseStatus.APPROVED || status === ECaseStatus.REJECTED
}

export const canApproveCase = (status?: string): boolean => {
  return !isCaseStatusFinal(status) && status !== ECaseStatus.APPROVED
}

export const canRejectCase = (status?: string): boolean => {
  return !isCaseStatusFinal(status) && status !== ECaseStatus.REJECTED
}
