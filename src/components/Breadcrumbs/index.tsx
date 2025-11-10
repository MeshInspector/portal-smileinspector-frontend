import type React from "react"
import { Breadcrumb, Button, Col, Row } from "antd"
import { LeftOutlined } from "@ant-design/icons"
import { useMatches, useRouter } from "@tanstack/react-router"

import "./styles.css"

type Crumb = {
  path: string
  label: string
}

const Breadcrumbs: React.FC = () => {
  const matches = useMatches()
  const router = useRouter()
  const isCasePage = matches.some((m) => m.routeId.endsWith("/cases/$code"))
  const isCasesPage = matches.some((m) => m.routeId.endsWith("/cases/"))
  const isInvitationsPage = matches.some((m) =>
    m.routeId.endsWith("/invitations/"),
  )
  const crumbs = matches
    .filter((m) => m.routeId !== "__root__" && m.routeId !== "/")
    .map((m) => {
      if (
        m.routeId.endsWith("/cases/$code") ||
        m.routeId.endsWith("/cases/$code/preview/$fileUid")
      ) {
        return { path: "/cases/$code", label: m.params.code }
      }
      if (m.routeId.endsWith("/cases")) {
        return { path: "/", label: "Cases" }
      }
      if (m.routeId.endsWith("/cases/")) {
        return { path: "/", label: "" }
      }
      if (m.routeId.endsWith("/invitations")) {
        return { path: "/invitations", label: "Invitations" }
      }
      if (m.routeId.endsWith("/invitations/")) {
        return { path: "/invitations", label: "" }
      }
      return { path: m.pathname, label: m.routeId }
    })

  const handleBack = () => {
    if (
      isCasePage &&
      typeof window !== "undefined" &&
      window.history.length <= 1
    ) {
      router.navigate({ to: "/cases" })
    } else {
      router.history.go(-1)
    }
  }

  const toBreadCrumb = (crumb: Crumb, index: number) => {
    const isLast = index === crumbs.length - 1
    const isCases = crumb.label === "Cases"
    const isInvitations = crumb.label === "Invitations"
    const isLink = (isCasePage && !isLast) || isCases || isInvitations

    const handleClick = (
      e: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
    ) => {
      e.preventDefault()
      router.navigate({ to: crumb.path })
    }
    return {
      title: isLink ? <a onClick={handleClick}>{crumb.label}</a> : crumb.label,
    }
  }

  return (
    <Row align="middle" className="breadcrumbs-row">
      <Col flex="none">
        <Button
          type="text"
          icon={<LeftOutlined />}
          onClick={handleBack}
          aria-label="Back"
          disabled={isCasesPage || isInvitationsPage}
        />
      </Col>
      <Col>
        <Breadcrumb items={crumbs.map(toBreadCrumb)} />
      </Col>
    </Row>
  )
}

export default Breadcrumbs
