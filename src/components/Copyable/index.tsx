import React, { useState } from 'react'
import { App as AntApp, Typography } from 'antd'
import { CheckOutlined, CopyOutlined } from '@ant-design/icons'

import './styles.css'
import { copyToClipboard } from '../../utils/clipboard.util.ts'

const { Text } = Typography

interface CopyableProps {
  value: string | null | undefined;
  children?: React.ReactNode;
}

const Copyable: React.FC<CopyableProps> = ({ value, children }) => {
  const [isHovered, setIsHovered] = useState(false)
  const [showCheck, setShowCheck] = useState(false)
  const { message } = AntApp.useApp()

  const handleCopy = async () => {
    if (!value) return

    const success = await copyToClipboard(value)

    if (success) {
      setShowCheck(true)
      setTimeout(() => setShowCheck(false), 2000)
      message.success('Copied to clipboard')
    } else {
      message.error('Failed to copy to clipboard')
    }
  }

  const displayValue = value || children || '-'

  return (
    <div
      className="copyable-root"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCopy}
      title="Click to copy"
    >
      <Text className="copyable-text">{displayValue}</Text>
      {value && (isHovered || showCheck) && (
        <div
          className={`copyable-icon ${showCheck ? 'check' : 'copy'}`}
        >
          {showCheck ? <CheckOutlined/> : <CopyOutlined/>}
        </div>
      )}
    </div>
  )
}

export default Copyable
