import * as React from "react"
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "./table"
import { Button } from "./button"
import { cn } from "@/shared/lib/utils"
import { THEME_COLORS } from "@/shared/constants/colors"
import { Skeleton } from "./skeleton"
import { Magnifier, SortFromTopToBottom, SortFromBottomToTop, SortVertical } from "@solar-icons/react"
import { GripVertical } from "lucide-react"

export interface ColumnDef<T> {
  header: React.ReactNode
  accessorKey?: keyof T | string
  cell?: (row: T, index: number) => React.ReactNode
  skeleton?: (index: number) => React.ReactNode
  className?: string
  sortable?: boolean
}

interface ReusableTableProps<T> {
  columns: ColumnDef<T>[]
  data: T[]
  loading?: boolean
  skeletonRowCount?: number
  emptyMessage?: string
  onRowClick?: (row: T) => void
  className?: string
  rowClassName?: string

  // Built-in Search
  showSearch?: boolean
  searchQuery?: string
  onSearchChange?: (query: string) => void
  searchPlaceholder?: string

  // Built-in Add Action Button
  addButtonText?: string
  addButtonIcon?: React.ReactNode
  onAddClick?: () => void
  addButtonColor?: "primary" | "success"
  customActions?: React.ReactNode

  // Built-in Pagination
  showPagination?: boolean
  currentPage?: number
  totalPages?: number
  totalItems?: number
  itemsPerPage?: number
  onPageChange?: (page: number) => void

  // Built-in Sorting
  onSortChange?: (sortKey: string, direction: "asc" | "desc" | null) => void

  // Built-in Drag & Drop Row Reordering
  isReorderable?: boolean
  onReorder?: (reorderedData: T[]) => void
}

const getPaginationRange = (currentPage: number, totalPages: number) => {
  const range: (number | string)[] = []
  const delta = 1

  const left = currentPage - delta
  const right = currentPage + delta

  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= left && i <= right)) {
      range.push(i)
    } else if ((i === left - 1 && left - 1 > 1) || (i === right + 1 && right + 1 < totalPages)) {
      range.push("...")
    }
  }

  const uniqueRange: (number | string)[] = []
  let prev: number | string | null = null
  for (const item of range) {
    if (item === "..." && prev === "...") continue
    uniqueRange.push(item)
    prev = item
  }

  return uniqueRange
}

const getCleanHeaderText = (header: React.ReactNode): string => {
  if (typeof header === "string") return header.trim().toLowerCase();
  if (typeof header === "number") return String(header);
  return extractTextFromReactNode(header).trim().toLowerCase();
};

const isExcludedFromSort = (header: React.ReactNode, explicitSortable?: boolean): boolean => {
  if (explicitSortable === false) return true;
  if (explicitSortable === true) return false;
  
  const cleanHeader = getCleanHeaderText(header);
  return (
    cleanHeader === "no" ||
    cleanHeader === "no." ||
    cleanHeader === "np" ||
    cleanHeader === "np." ||
    cleanHeader === "aksi" ||
    cleanHeader === "action" ||
    cleanHeader === "actions" ||
    cleanHeader.includes("aksi") ||
    cleanHeader.includes("action")
  );
};

const isActionColumn = (header: React.ReactNode, className?: string): boolean => {
  const cleanHeader = getCleanHeaderText(header);
  if (cleanHeader.includes("aksi") || cleanHeader.includes("action")) return true;
  if (className && className.includes("text-center")) return true;
  return false;
};

function extractTextFromReactNode(node: React.ReactNode): string {
  if (node === null || node === undefined || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(extractTextFromReactNode).join(" ");
  if (React.isValidElement(node)) {
    const props = node.props as any;
    if (props && props.children) {
      return extractTextFromReactNode(props.children);
    }
  }
  return "";
}

export function ReusableTable<T>({
  columns,
  data,
  loading = false,
  skeletonRowCount = 5,
  emptyMessage = "No data found.",
  onRowClick,
  className,
  rowClassName,

  // Search props
  showSearch = true,
  searchQuery,
  onSearchChange,
  searchPlaceholder = "Cari...",

  // Add button props
  addButtonText,
  addButtonIcon,
  onAddClick,
  addButtonColor = "success",
  customActions,

  // Pagination props
  showPagination = true,
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage = 10,
  onPageChange,

  // Sorting props
  onSortChange,

  // Reordering props
  isReorderable = false,
  onReorder,
}: ReusableTableProps<T>) {
  // 1. Internal Search State (if uncontrolled)
  const [internalSearchQuery, setInternalSearchQuery] = React.useState("")
  const isSearchControlled = searchQuery !== undefined && onSearchChange !== undefined
  const activeSearchQuery = isSearchControlled ? searchQuery : internalSearchQuery

  // 2. Internal Pagination State (if uncontrolled)
  const [internalPage, setInternalPage] = React.useState(1)
  const isPaginationControlled = currentPage !== undefined && onPageChange !== undefined
  const activePage = isPaginationControlled ? currentPage : internalPage

  // 3. Internal Sorting State
  const [sortColIndex, setSortColIndex] = React.useState<number | null>(null)
  const [sortDirection, setSortDirection] = React.useState<"asc" | "desc" | null>(null)

  // 4. Internal Drag & Drop State
  const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = React.useState<number | null>(null)

  // Handle Header Click for Sorting
  const handleHeaderClick = (colIdx: number, column: ColumnDef<T>) => {
    if (isExcludedFromSort(column.header, column.sortable)) return

    let nextDirection: "asc" | "desc" | null = "asc"
    let nextColIndex: number | null = colIdx

    if (sortColIndex === colIdx) {
      if (sortDirection === "asc") {
        nextDirection = "desc"
      } else if (sortDirection === "desc") {
        nextDirection = null
        nextColIndex = null
      } else {
        nextDirection = "asc"
      }
    }

    setSortColIndex(nextColIndex)
    setSortDirection(nextDirection)

    if (onSortChange) {
      const sortKey = column.accessorKey ? String(column.accessorKey) : String(column.header)
      onSortChange(sortKey, nextDirection)
    }
  }

  // Handle Search Input Change
  const handleSearchInputChange = (val: string) => {
    if (isSearchControlled) {
      onSearchChange(val)
    } else {
      setInternalSearchQuery(val)
      setInternalPage(1) // Reset to first page on search
    }
  }

  // Handle Page Change
  const handlePageChange = (page: number) => {
    if (isPaginationControlled) {
      onPageChange(page)
    } else {
      setInternalPage(page)
    }
  }

  // Filter data based on search if uncontrolled
  const getFilteredData = () => {
    if (isSearchControlled) {
      return data;
    }
    if (!activeSearchQuery) return data;
    
    return data.filter((row) => {
      return columns.some((col) => {
        if (col.accessorKey) {
          const val = (row as any)[col.accessorKey];
          if (val !== undefined && val !== null) {
            return String(val).toLowerCase().includes(activeSearchQuery.toLowerCase());
          }
        }
        return false;
      });
    });
  }

  const filteredData = getFilteredData()

  // Sort data if active
  const getSortedData = (baseData: T[]) => {
    if (sortColIndex === null || !sortDirection) return baseData
    const targetCol = columns[sortColIndex]
    if (!targetCol) return baseData

    return [...baseData].sort((a, b) => {
      let valA: any = ""
      let valB: any = ""

      if (targetCol.accessorKey) {
        valA = (a as any)[targetCol.accessorKey]
        valB = (b as any)[targetCol.accessorKey]
      } else if (targetCol.cell) {
        const cellA = targetCol.cell(a, 0)
        const cellB = targetCol.cell(b, 0)
        valA = extractTextFromReactNode(cellA)
        valB = extractTextFromReactNode(cellB)
      }

      if (valA === null || valA === undefined) valA = ""
      if (valB === null || valB === undefined) valB = ""

      if (typeof valA === "number" && typeof valB === "number") {
        return sortDirection === "asc" ? valA - valB : valB - valA
      }

      const strA = String(valA).toLowerCase()
      const strB = String(valB).toLowerCase()

      return sortDirection === "asc"
        ? strA.localeCompare(strB, undefined, { numeric: true })
        : strB.localeCompare(strA, undefined, { numeric: true })
    })
  }

  const sortedData = getSortedData(filteredData)

  // Pagination math
  const activeTotalItems = isPaginationControlled 
    ? (totalItems !== undefined ? totalItems : data.length) 
    : sortedData.length
  
  const activeTotalPages = isPaginationControlled 
    ? (totalPages !== undefined ? totalPages : 1) 
    : Math.ceil(activeTotalItems / itemsPerPage)

  const displayData = isPaginationControlled 
    ? getSortedData(data)
    : sortedData.slice((activePage - 1) * itemsPerPage, activePage * itemsPerPage)

  const paginationRange = getPaginationRange(activePage, activeTotalPages)

  const startIndex = (activePage - 1) * itemsPerPage
  const displayStart = activeTotalItems > 0 ? startIndex + 1 : 0
  const displayEnd = Math.min(startIndex + itemsPerPage, activeTotalItems)

  const handleDrop = (dropIndex: number) => {
    if (draggedIndex === null || draggedIndex === dropIndex) return;
    const reorderedList = [...data];
    const [movedItem] = reorderedList.splice(draggedIndex, 1);
    reorderedList.splice(dropIndex, 0, movedItem);
    onReorder?.(reorderedList);
  };

  return (
    <div className={cn("bg-white border border-gray-200/80 rounded-2xl shadow-xs overflow-hidden", className)}>
      {/* Search & Action Row */}
      {(showSearch || onAddClick || customActions) && (
        <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {showSearch && (
            <div className="relative w-full sm:max-w-[220px]">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400">
                <Magnifier size={18} weight="Linear" />
              </span>
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={activeSearchQuery}
                onChange={(e) => handleSearchInputChange(e.target.value)}
                className="w-full h-9 pl-10 pr-4 text-xs bg-zinc-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#e0542c] focus:border-[#e0542c] transition-all placeholder-gray-400 text-gray-700 font-medium"
              />
            </div>
          )}

          {(onAddClick || customActions) && (
            <div className="flex items-center gap-2.5 flex-wrap">
              {customActions}
              {onAddClick && (
                <Button
                  type="button"
                  onClick={onAddClick}
                  style={{
                    backgroundColor: addButtonColor === "success" ? THEME_COLORS.hex.sawahPertumbuhan : THEME_COLORS.hex.primary
                  }}
                  className={cn(
                    "flex items-center justify-center gap-2 px-4 py-2.5 text-white rounded-lg text-xs font-bold shadow-sm transition-all cursor-pointer shrink-0 h-9 border-0 hover:opacity-90",
                    addButtonColor === "success"
                      ? "shadow-[#7FA46D]/15 text-white"
                      : "shadow-[#e0542c]/10 text-white"
                  )}
                >
                  {addButtonIcon}
                  {addButtonText || "Tambah"}
                </Button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Main Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-zinc-50/70">
            <TableRow className="bg-zinc-50/70 hover:bg-zinc-50/70 border-b border-gray-100">
              {isReorderable && (
                <TableHead className="w-10 text-center py-3.5 px-2 border-b border-gray-100" />
              )}
              {columns.map((column, idx) => {
                const canSort = !isExcludedFromSort(column.header, column.sortable)
                const isSorted = sortColIndex === idx && sortDirection !== null
                const isCentered = isActionColumn(column.header, column.className)

                return (
                  <TableHead
                    key={idx}
                    className={cn(
                      "py-3.5 px-4 text-xs font-bold text-gray-600 border-b border-gray-100",
                      isCentered && "text-center",
                      canSort && "cursor-pointer select-none group hover:text-gray-900 transition-colors",
                      column.className
                    )}
                    onClick={() => canSort && handleHeaderClick(idx, column)}
                  >
                    <div className={cn("flex items-center gap-1.5 min-w-0", isCentered && "justify-center text-center")}>
                      <span className="truncate">{column.header}</span>
                      {canSort && (
                        <span className="inline-flex items-center shrink-0">
                          {isSorted ? (
                            sortDirection === "asc" ? (
                              <SortFromTopToBottom size={14} className="text-[#e0542c] font-bold" />
                            ) : (
                              <SortFromBottomToTop size={14} className="text-[#e0542c] font-bold" />
                            )
                          ) : (
                            <SortVertical size={14} className="text-gray-300 group-hover:text-gray-500 transition-colors opacity-70" />
                          )}
                        </span>
                      )}
                    </div>
                  </TableHead>
                )
              })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: skeletonRowCount }).map((_, rowIdx) => (
                <TableRow key={`skeleton-row-${rowIdx}`} className="hover:bg-transparent border-b border-gray-50/80">
                  {isReorderable && (
                    <TableCell className="w-10 text-center py-4 px-2">
                      <Skeleton className="h-4 w-4 rounded" />
                    </TableCell>
                  )}
                  {columns.map((column, colIdx) => (
                    <TableCell key={`skeleton-col-${colIdx}`} className={cn("py-4 px-4 text-xs", column.className)}>
                      {column.skeleton ? (
                        column.skeleton(rowIdx)
                      ) : (
                        <Skeleton className="h-4 w-3/4 rounded" />
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : displayData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (isReorderable ? 1 : 0)}
                  className="h-32 text-center text-xs text-gray-500"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              displayData.map((row, rowIdx) => (
                <TableRow
                  key={rowIdx}
                  onClick={() => onRowClick?.(row)}
                  draggable={isReorderable}
                  onDragStart={(e) => {
                    if (!isReorderable) return;
                    e.dataTransfer.setData("text/plain", String(rowIdx));
                    e.dataTransfer.effectAllowed = "move";
                    setDraggedIndex(rowIdx);
                  }}
                  onDragOver={(e) => {
                    if (!isReorderable) return;
                    e.preventDefault();
                    e.dataTransfer.dropEffect = "move";
                    if (dragOverIndex !== rowIdx) {
                      setDragOverIndex(rowIdx);
                    }
                  }}
                  onDragLeave={() => {
                    if (!isReorderable) return;
                    setDragOverIndex(null);
                  }}
                  onDrop={(e) => {
                    if (!isReorderable) return;
                    e.preventDefault();
                    handleDrop(rowIdx);
                  }}
                  onDragEnd={() => {
                    setDraggedIndex(null);
                    setDragOverIndex(null);
                  }}
                  className={cn(
                    "border-b border-gray-50/80 transition-all duration-150",
                    onRowClick && "cursor-pointer",
                    isReorderable && "hover:bg-orange-50/30",
                    isReorderable && draggedIndex === rowIdx && "opacity-40 bg-orange-50/50 border-orange-300",
                    isReorderable && dragOverIndex === rowIdx && draggedIndex !== rowIdx && "bg-orange-50/90 border-y-2 border-[#e0542c]",
                    !isReorderable && "hover:bg-zinc-50/40",
                    rowClassName
                  )}
                >
                  {isReorderable && (
                    <TableCell className="w-10 text-center py-4 px-2 cursor-grab active:cursor-grabbing text-gray-400 hover:text-[#e0542c] transition-colors">
                      <GripVertical size={16} />
                    </TableCell>
                  )}
                  {columns.map((column, colIdx) => {
                    let content: React.ReactNode = null

                    if (column.cell) {
                      content = column.cell(row, (activePage - 1) * itemsPerPage + rowIdx)
                    } else if (column.accessorKey) {
                      const value = (row as any)[column.accessorKey]
                      content = value !== undefined && value !== null ? String(value) : ""
                    }

                    return (
                      <TableCell
                        key={colIdx}
                        className={cn("py-4 px-4 text-xs text-gray-700", column.className)}
                      >
                        {content}
                      </TableCell>
                    )
                  })}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Footer */}
      {showPagination && (
        <div className="p-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-zinc-50/50">
          <div className="text-xs text-gray-500 font-medium">
            {loading ? (
              "Memuat data..."
            ) : activeTotalItems > 0 ? (
              <>
                Menampilkan <span className="text-gray-900 font-semibold">{displayStart}</span> sampai{" "}
                <span className="text-gray-900 font-semibold">{displayEnd}</span> dari{" "}
                <span className="text-gray-900 font-semibold">{activeTotalItems}</span> data
              </>
            ) : (
              "Tidak ada data."
            )}
          </div>

          {activeTotalPages > 1 && (
            <div className="flex flex-wrap items-center justify-center sm:justify-end gap-1.5">
              <button
                type="button"
                disabled={activePage === 1}
                onClick={() => handlePageChange(1)}
                className="w-8 h-8 flex items-center justify-center text-[11px] font-semibold rounded-md border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
                title="Halaman Pertama"
              >
                &lt;&lt;
              </button>
              <button
                type="button"
                disabled={activePage === 1}
                onClick={() => handlePageChange(activePage - 1)}
                className="w-8 h-8 flex items-center justify-center text-[11px] font-semibold rounded-md border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
                title="Halaman Sebelumnya"
              >
                &lt;
              </button>

              {paginationRange.map((page, index) => {
                if (typeof page === "number") {
                  const isCurrent = page === activePage
                  return (
                    <button
                      key={`page-${page}`}
                      type="button"
                      onClick={() => handlePageChange(page)}
                      className={cn(
                        "w-8 h-8 flex items-center justify-center text-[11px] font-semibold rounded-md transition-colors cursor-pointer",
                        isCurrent
                          ? "bg-[#e0542c] text-white shadow-xs"
                          : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                      )}
                    >
                      {page}
                    </button>
                  )
                }
                return (
                  <span
                    key={`ellipsis-${index}`}
                    className="w-8 h-8 flex items-center justify-center text-xs text-gray-400 font-medium"
                  >
                    ...
                  </span>
                )
              })}

              <button
                type="button"
                disabled={activePage === activeTotalPages}
                onClick={() => handlePageChange(activePage + 1)}
                className="w-8 h-8 flex items-center justify-center text-[11px] font-semibold rounded-md border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
                title="Halaman Selanjutnya"
              >
                &gt;
              </button>
              <button
                type="button"
                disabled={activePage === activeTotalPages}
                onClick={() => handlePageChange(activeTotalPages)}
                className="w-8 h-8 flex items-center justify-center text-[11px] font-semibold rounded-md border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
                title="Halaman Terakhir"
              >
                &gt;&gt;
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
