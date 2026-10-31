import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'
import { nextSortOrder } from '../../utils/formatters'

function SortIcon({ active, order }) {
  if (!active) {
    return <ArrowUpDown size={13} className="text-muted/70" />
  }

  return order === 'asc' ? <ArrowUp size={13} /> : <ArrowDown size={13} />
}

export default function DataTable({
  columns,
  rows,
  empty,
  onRowClick,
  sortBy,
  order = 'desc',
  onSort,
}) {
  if (!rows?.length) {
    return empty || null
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-card">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-line text-xs tracking-wide text-muted uppercase">
            <tr>
              {columns.map((column) => {
                const sortable = Boolean(column.sortKey && onSort)

                return (
                  <th key={column.key} className="px-4 py-3 font-medium">
                    {sortable ? (
                      <button
                        type="button"
                        onClick={() =>
                          onSort(column.sortKey, nextSortOrder(sortBy, column.sortKey, order))
                        }
                        className={`inline-flex items-center gap-1.5 rounded-md transition-colors hover:text-ink ${
                          sortBy === column.sortKey ? 'text-ink' : 'text-muted'
                        }`}
                      >
                        {column.header}
                        <SortIcon active={sortBy === column.sortKey} order={order} />
                      </button>
                    ) : (
                      column.header
                    )}
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={`border-b border-line/70 last:border-0 ${
                  onRowClick ? 'cursor-pointer hover:bg-white/[0.02]' : ''
                }`}
              >
                {columns.map((column) => (
                  <td key={column.key} className="px-4 py-3.5 text-ink">
                    {column.render ? column.render(row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
