import type React from "react"
import { Card, Tabs } from "antd"
import FileListCard from "../FileListCard"
import HistoryCard from "../HistoryCard"
import "./styles.css"

interface DetailsPanelProps {
  caseCode: string
}

const DetailsPanel: React.FC<DetailsPanelProps> = ({ caseCode }) => {
  return (
    <Card>
      <Tabs
        className="details-tabs"
        defaultActiveKey="files"
        items={[
          {
            key: "files",
            label: "Files",
            children: <FileListCard caseCode={caseCode} />,
          },
          {
            key: "history",
            label: "History",
            children: <HistoryCard caseCode={caseCode} />,
          },
        ]}
      />
    </Card>
  )
}

export default DetailsPanel
