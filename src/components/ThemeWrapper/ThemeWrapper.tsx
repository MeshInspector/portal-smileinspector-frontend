import type React from "react"
import { useEffect, useState } from "react"
import { ConfigProvider, theme as antdTheme } from "antd"

interface ThemeWrapperProps {
  children: React.ReactNode
}

const DARK_COLOR = "#181A1D"
const DARK_GRAY_COLOR = "#202124"
const LIGHT_COLOR = "#FAFAFA"

const ThemeWrapper: React.FC<ThemeWrapperProps> = ({
  children,
}: ThemeWrapperProps) => {
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

  const isDark = currentTheme === "dark"

  return (
    <ConfigProvider
      theme={{
        algorithm: isDark
          ? antdTheme.darkAlgorithm
          : antdTheme.defaultAlgorithm,
        token: {
          colorBgBase: isDark ? DARK_COLOR : LIGHT_COLOR,
        },
        components: {
          Card: {
            borderRadius: 0,
            algorithm: true,
          },
          Layout: {
            headerBg: isDark ? DARK_COLOR : LIGHT_COLOR,
            headerColor: isDark ? LIGHT_COLOR : DARK_COLOR,
            colorBgContainer: isDark ? DARK_COLOR : LIGHT_COLOR,
            colorBgBase: isDark ? DARK_GRAY_COLOR : LIGHT_COLOR,
            algorithm: true,
          },
          Tabs: {
            algorithm: true,
            colorBgContainer: isDark ? DARK_COLOR : LIGHT_COLOR,
            colorBgBase: isDark ? DARK_GRAY_COLOR : LIGHT_COLOR,
          },
        },
      }}
    >
      {children}
    </ConfigProvider>
  )
}

export default ThemeWrapper
