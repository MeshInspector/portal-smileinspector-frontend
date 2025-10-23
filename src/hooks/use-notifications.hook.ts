import { notification } from 'antd'
import { useCallback, useMemo } from 'react'

import { parseError } from '../utils/error.util.ts'

export const useNotifications = () => {
  const [api, contextHolder] = notification.useNotification()

  const error = useCallback(
    (error: Error, title: string = 'Error') => {
      const errorMessage = parseError(error)
      api.error({
        message: title,
        description: errorMessage,
        duration: 5,
        placement: 'topRight',
      })
    },
    [api],
  )

  const success = useCallback(
    (message: string, description?: string) => {
      api.success({
        message,
        description,
        duration: 3,
        placement: 'topRight',
      })
    },
    [api],
  )

  const warning = useCallback(
    (message: string, description?: string) => {
      api.warning({
        message,
        description,
        duration: 4,
        placement: 'topRight',
      })
    },
    [api],
  )

  const info = useCallback(
    (message: string, description?: string) => {
      api.info({
        message,
        description,
        duration: 3,
        placement: 'topRight',
      })
    },
    [api],
  )

  const notify = useMemo(
    () => ({ error, success, warning, info }),
    [error, success, warning, info],
  )

  return { notify, contextHolder }
}
