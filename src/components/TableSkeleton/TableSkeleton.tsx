import { Skeleton } from 'antd'
import type { Breakpoint } from 'antd/es/_util/responsiveObserver'

import './styles.css'

interface Column {
  title: string;
  dataIndex: string;
  key: string;
  responsive?: Breakpoint[];
}

interface TableSkeletonProps {
  columns: Column[];
  rowCount?: number;
  sortableColumns?: string[];
}

const TableSkeleton = ({ columns, rowCount = 10, sortableColumns = [] }: TableSkeletonProps) => {
  return (<>
    <div className="table-skeleton-header">
      {columns.map((col, index) => (
        <div key={col.key} className="table-skeleton-header-col"
             style={{ marginRight: index < columns.length - 1 ? '16px' : 0 }}>
          <Skeleton.Input active size="small" className="skeleton-input"/>
          {sortableColumns.includes(col.dataIndex) && (
            <Skeleton.Button active size="small" className="skeleton-button"/>
          )}
        </div>
      ))}
    </div>

    {Array.from({ length: rowCount }).map((_, rowIndex) => (
      <div key={rowIndex} className="table-skeleton-row">
        {columns.map((col, colIndex) => (
          <div key={col.key} className="table-skeleton-col"
               style={{ marginRight: colIndex < columns.length - 1 ? '16px' : 0 }}>
            <Skeleton.Input active size="small" className="skeleton-input"/>
          </div>
        ))}
      </div>
    ))}
  </>)
}

export default TableSkeleton
