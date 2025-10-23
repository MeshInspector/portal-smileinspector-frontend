import React from 'react'
import { App as AntApp, Button } from 'antd'
import { LinkOutlined } from '@ant-design/icons'

const CopyLinkButton: React.FC<object> = () => {
  const { message } = AntApp.useApp()

  const handleCopyLink = async () => {
    const url = window.location.href
    try {
      await navigator.clipboard.writeText(url)
      await message.success('Link copied to clipboard')
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_) {
      await message.error('Failed to copy link')
    }
  }

  return <Button
    icon={<LinkOutlined/>}
    onClick={handleCopyLink}
    title="Copy link to clipboard"
  />
}

export default CopyLinkButton
