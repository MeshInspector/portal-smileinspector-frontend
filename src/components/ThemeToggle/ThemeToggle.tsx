import { Button } from "antd"
import { MoonOutlined, SunOutlined } from "@ant-design/icons"
import type React from "react"
import { useEffect, useState } from "react"

import { useTheme } from "../../contexts/ThemeContext.tsx"

const ThemeToggle: React.FC = () => {
  const { toggleTheme } = useTheme()
  const [currentTheme, setCurrentTheme] = useState<string>(() => {
    const savedTheme = localStorage.getItem("theme")
    if (savedTheme) {
      return savedTheme
    }

    if (typeof window !== "undefined" && window.matchMedia) {
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
    }

    return "light"
  })

  const handleToggleTheme = () => {
    const newTheme = currentTheme === "dark" ? "light" : "dark"
    setCurrentTheme(() => newTheme)
    toggleTheme(newTheme)
  }

  useEffect(() => {
    const handleStorageChange = () => {
      const savedTheme = localStorage.getItem("theme")
      if (savedTheme) {
        setCurrentTheme(savedTheme)
      }
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [])

  return (
    <Button
      type="text"
      icon={currentTheme === "dark" ? <SunOutlined /> : <MoonOutlined />}
      onClick={handleToggleTheme}
      title={`Switch to ${currentTheme === "dark" ? "light" : "dark"} theme`}
    />
  )
}

export default ThemeToggle
