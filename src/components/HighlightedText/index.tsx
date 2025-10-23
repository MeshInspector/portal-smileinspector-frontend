import React from 'react'

import './styles.css'

interface HighlightedTextProps {
  text: string;
  highlight: string;
  className?: string;
}

const HighlightedText: React.FC<HighlightedTextProps> = ({ text, highlight, className }) => {
  if (!highlight.trim()) {
    return <span className={className}>{text}</span>
  }

  const regex = new RegExp(`(${highlight})`, 'gi')
  const parts = text.split(regex)

  return (
    <span className={className}>
      {parts.map((part, index) =>
        regex.test(part) ? (
          <mark key={index} className="highlighted-text-mark">
            {part}
          </mark>
        ) : (
          part
        ),
      )}
    </span>
  )
}

export default HighlightedText
