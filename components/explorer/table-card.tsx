"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, Download } from "lucide-react";
import { Card } from "@/components/ui/card";
import { LatestUpdated } from "./latest-updated";
import { HashSearchbar } from "@/components/hash-searchbar";
import { ChainSelect } from "./chain-select";

export interface TableColumn {
  label: string;
  width?: string; // Optional width for the column (e.g., "w-16", "w-32", "min-w-[120px]")
}

export interface TableCardProps {
  id?: string;
  title?: string | React.ReactNode;
  live?: boolean;
  columns: TableColumn[];
  rows: Array<React.ReactNode[]>;
  viewAllPath?: string;
  loading?: boolean;
  paginate?: boolean;
  pageSize?: number;
  totalCount?: number; // Added to handle API pagination
  currentPage?: number; // Added to handle API pagination
  onPageChange?: (page: number) => void; // Added to handle API pagination
  spacing?: number;
  // New props for Show/Export section
  showEntriesSelector?: boolean;
  entriesPerPageOptions?: number[];
  currentEntriesPerPage?: number;
  onEntriesPerPageChange?: (value: number) => void;
  showExportButton?: boolean;
  onExportButtonClick?: () => void;
  tableClassName?: string;
  theadClassName?: string;
  tbodyClassName?: string;
  className?: string;
  compactFooter?: boolean; // When true, shows "Showing..." and "View All" in same row
  updatedTime?: string; // Time string like "10m ago"
  viewAllText?: string; // Text for "View All" button
  onRowClick?: (rowIndex: number) => void; // Callback when a row is clicked
  searchPlaceholder?: string; // Placeholder for search input
  onSearch?: (query: string) => void; // Callback when search query changes
  searchValue?: string; // Current search value
  showCSVButton?: boolean; // Show CSV export button
  onCSVExport?: () => void; // Custom CSV export handler (optional, will use default if not provided)
  showChainSelect?: boolean; // Show chain selector
  chainSelectValue?: string; // Current chain select value
  onChainSelectChange?: (value: string) => void; // Callback when chain selection changes
  expandableRows?: boolean; // Enable expandable rows
  expandedRows?: Set<number>; // Set of expanded row indices
  onRowExpand?: (rowIndex: number) => void; // Callback when a row is expanded/collapsed
  renderExpandedContent?: (rowIndex: number) => React.ReactNode; // Function to render expanded content
}

export function TableCard({
  id,
  title,
  live = true,
  columns,
  rows,
  viewAllPath,
  loading = false,
  paginate = false,
  pageSize = 10,
  totalCount: propTotalCount = 0,
  currentPage: propCurrentPage = 1,
  onPageChange: propOnPageChange,
  spacing = 4,
  currentEntriesPerPage = 10,
  tableClassName,
  theadClassName,
  tbodyClassName,
  className,
  compactFooter = false,
  updatedTime,
  onRowClick,
  viewAllText = "Chains",
  searchPlaceholder,
  onSearch,
  searchValue,
  showCSVButton = false,
  onCSVExport,
  showChainSelect = false,
  chainSelectValue,
  onChainSelectChange,
  expandableRows = false,
  expandedRows,
  onRowExpand,
  renderExpandedContent,
}: TableCardProps) {
  // Internal pagination for when external pagination is not provided
  const [internalPage, setInternalPage] = React.useState(1);

  const isExternalPagination =
    propOnPageChange !== undefined &&
    propTotalCount !== undefined &&
    propCurrentPage !== undefined;

  // Use current page from props if external pagination, otherwise internal page
  const currentPaginatedPage = isExternalPagination
    ? propCurrentPage
    : internalPage;
  // Use total items from props if external pagination, otherwise rows length
  const totalItems = isExternalPagination ? propTotalCount : rows.length;
  // Use page size from props if external pagination, otherwise internal pageSize or 5 if not specified
  const effectivePageSize = isExternalPagination
    ? currentEntriesPerPage
    : pageSize;

  const totalPages = React.useMemo(() => {
    return Math.max(1, Math.ceil(totalItems / effectivePageSize));
  }, [totalItems, effectivePageSize]);

  React.useEffect(() => {
    if (!isExternalPagination) {
      setInternalPage((p) => Math.min(Math.max(1, p), totalPages));
    }
  }, [totalPages, isExternalPagination]);

  const startIdx = isExternalPagination
    ? (propCurrentPage - 1) * effectivePageSize
    : (internalPage - 1) * effectivePageSize;
  const endIdx = isExternalPagination
    ? startIdx + effectivePageSize
    : startIdx + effectivePageSize;
  const pageRows = React.useMemo(
    () => (isExternalPagination ? rows : rows.slice(startIdx, endIdx)),
    [rows, startIdx, endIdx, isExternalPagination]
  );

  const goToPage = (p: number) => {
    if (isExternalPagination && propOnPageChange) {
      propOnPageChange(p);
    } else {
      setInternalPage(Math.min(Math.max(1, p), totalPages));
    }
  };

  const prev = () => goToPage(currentPaginatedPage - 1);
  const next = () => goToPage(currentPaginatedPage + 1);

  const visiblePages = React.useMemo(() => {
    if (totalPages <= 6)
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    const set = new Set<number>([
      1,
      totalPages,
      currentPaginatedPage - 1,
      currentPaginatedPage,
      currentPaginatedPage + 1,
    ]);
    return Array.from(set)
      .filter((n) => n >= 1 && n <= totalPages)
      .sort((a, b) => a - b);
  }, [totalPages, currentPaginatedPage]);

  // Map spacing to Tailwind classes
  const spacingClasses: Record<number, string> = {
    1: "py-1",
    2: "py-2",
    3: "py-3",
    4: "py-4",
    5: "py-5",
    6: "py-6",
    8: "py-8",
    10: "py-10",
    12: "py-12",
    16: "py-16",
    20: "py-20",
    24: "py-24",
  };

  // Function to extract text content from React nodes
  const extractTextFromNode = (node: React.ReactNode): string => {
    if (typeof node === "string" || typeof node === "number") {
      return String(node);
    }
    if (React.isValidElement(node)) {
      if ((node.props as any).children) {
        return React.Children.toArray((node.props as any).children)
          .map(extractTextFromNode)
          .join(" ");
      }
      return "";
    }
    if (Array.isArray(node)) {
      return node.map(extractTextFromNode).join(" ");
    }
    return "";
  };

  // Default CSV export function
  const handleCSVExport = () => {
    if (onCSVExport) {
      onCSVExport();
      return;
    }

    // Extract headers
    const headers = columns.map((col) => col.label);

    // Extract all rows (not just current page)
    const allRowsData = rows.map((row) =>
      row.map((cell) => {
        const text = extractTextFromNode(cell);
        // Remove extra whitespace and newlines
        return text.trim().replace(/\s+/g, " ");
      })
    );

    // Combine headers and rows
    const csvContent = [
      headers.join(","),
      ...allRowsData.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    // Create blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${title || "export"}_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card padding="explorer" id={id} className={`gap-2 lg:gap-6 ${className || ""}`}>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 leading-none">
        {title && (
          <div className="flex items-center gap-3">
            <h2 className="text-base sm:text-lg lg:text-2xl font-bold text-white pl-2 lg:pl-0">
              {title}
            </h2>
          </div>
        )}
        <div className="flex items-center gap-3 ml-auto">
          {onSearch && searchPlaceholder && (
            <HashSearchbar
              value={searchValue || ""}
              onType={onSearch}
              placeholder={searchPlaceholder}
              wrapperClassName="min-w-[400px]"
            />
          )}
          {showChainSelect && chainSelectValue !== undefined && onChainSelectChange && (
            <ChainSelect
              value={chainSelectValue}
              onValueChange={onChainSelectChange}
              className="min-w-[200px]"
            />
          )}
          {showCSVButton && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleCSVExport}
              className="border-white/20 text-white/80 hover:bg-white/10 hover:text-white"
            >
              <Download className="w-4 h-4 mr-2" />
              CSV
            </Button>
          )}
          {live && <LatestUpdated showLive={live} className="self-end sm:self-auto" />}
        </div>
      </div>

      <div className="overflow-x-auto -mx-3 lg:mx-0">
        <div className="min-w-full inline-block">
          <table
            className={`w-full ${tableClassName || ""}`}
            style={{ tableLayout: "auto", borderCollapse: "separate", borderSpacing: "0 8px" }}
          >
            <thead className={theadClassName}>
              <tr>
                {columns.map((c) => (
                  <th
                    key={c.label}
                    className={`px-2 sm:px-3 lg:px-4 py-2 text-left text-xs font-medium text-white/60 capitalize tracking-wider whitespace-nowrap ${c.width || ""}`}
                  >
                    <span className="hidden sm:inline">{c.label}</span>
                    <span className="sm:hidden">{c.label.split(" ")[0]}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className={tbodyClassName || ""}>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={`s-${i}`} className="animate-pulse">
                    {columns.map((_, j) => (
                      <td
                        key={j}
                        className={`px-4 ${spacingClasses[spacing] || "py-4"} ${columns[j]?.width || ""}`}
                      >
                        <div className="h-3 w-20 sm:w-32 bg-white/10 rounded"></div>
                      </td>
                    ))}
                  </tr>
                ))
              ) : pageRows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-6 text-center">
                    <div className="flex flex-col items-center gap-3 max-w-md mx-auto">
                      <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                        <svg
                          className="w-6 h-6 text-white/40"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
                          />
                        </svg>
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-base font-medium text-white/60">
                          No data available
                        </h3>
                        <p className="text-sm text-white/40">
                          Try adjusting your filters or check back later
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                pageRows.map((cells, i) => {
                  const rowIndex = i + startIdx;
                  const isExpanded = expandableRows && expandedRows?.has(rowIndex);
                  
                  return (
                    <React.Fragment key={rowIndex}>
                      <tr
                        className={`hover:bg-white/[0.07] transition-colors ${(onRowClick || expandableRows) ? "cursor-pointer" : ""}`}
                        onClick={() => {
                          if (expandableRows && onRowExpand) {
                            onRowExpand(rowIndex);
                          } else {
                            onRowClick?.(rowIndex);
                          }
                        }}
                      >
                        {cells.map((node, j) => (
                          <td
                            key={j}
                            className={`px-2 sm:px-3 lg:px-4 text-xs sm:text-sm ${j === 0 ? "border-l border-t border-b border-white/10" : "border-t border-b border-white/10"} ${j === cells.length - 1 ? "border-r border-t border-b border-white/10" : ""} text-white whitespace-nowrap ${spacingClasses[spacing] || "py-4"
                              } ${columns[j]?.width || ""}`}
                            style={{
                              ...(j === 0 && {
                                borderTopLeftRadius: "12px",
                                borderBottomLeftRadius: isExpanded ? "0" : "12px",
                              }),
                              ...(j === cells.length - 1 && {
                                borderTopRightRadius: "12px",
                                borderBottomRightRadius: isExpanded ? "0" : "12px",
                              }),
                            }}
                          >
                            {node}
                          </td>
                        ))}
                      </tr>
                      {isExpanded && renderExpandedContent && (
                        <tr>
                          <td colSpan={columns.length} className="px-0 py-0 border-x border-b border-white/10">
                            <div className="bg-white/5 p-4">
                              {renderExpandedContent(rowIndex)}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {compactFooter ? (
        <div className="mt-auto pt-3 flex flex-col sm:flex-row-reverse items-start sm:items-center sm:justify-between gap-2 sm:gap-0">
          <div className="text-white/40 text-xs sm:text-sm order-2 sm:order-1">
            Showing {totalItems === 0 ? 0 : startIdx + 1} to{" "}
            {Math.min(endIdx, totalItems)} of {totalItems} entries
          </div>
          {viewAllPath && (
            <Link href={viewAllPath} className="order-1 sm:order-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground gap-1 text-xs sm:text-sm"
              >
                View All {viewAllText}
                <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <>
          {paginate && !loading && (
            <div>
              {/* Mobile Pagination */}
              <div className="md:hidden">
                <div className="flex items-center justify-between mb-3">
                  <button
                    onClick={prev}
                    disabled={currentPaginatedPage === 1}
                    className={`px-3 py-2 rounded text-sm ${currentPaginatedPage === 1
                      ? "bg-white/10 text-white/40 cursor-not-allowed"
                      : "bg-white/10 hover:bg-white/20 text-white"
                      }`}
                  >
                    Previous
                  </button>
                  <span className="text-sm text-white/60">
                    Page {currentPaginatedPage} of {totalPages}
                  </span>
                  <button
                    onClick={next}
                    disabled={currentPaginatedPage === totalPages}
                    className={`px-3 py-2 rounded text-sm ${currentPaginatedPage === totalPages
                      ? "bg-white/10 text-white/40 cursor-not-allowed"
                      : "bg-white/10 hover:bg-white/20 text-white"
                      }`}
                  >
                    Next
                  </button>
                </div>
                <div className="text-center text-xs text-white/40">
                  Showing {totalItems === 0 ? 0 : startIdx + 1} to{" "}
                  {Math.min(endIdx, totalItems)} of {totalItems} entries
                </div>
              </div>

              {/* Desktop Pagination */}
              <div className="hidden md:flex items-center justify-between text-sm text-white/60">
                <div className="flex items-center gap-2">
                  <button
                    onClick={prev}
                    disabled={currentPaginatedPage === 1}
                    className={`px-2 py-1 rounded ${currentPaginatedPage === 1
                      ? "bg-white/10 text-white/40 cursor-not-allowed"
                      : "bg-white/10 hover:bg-white/20"
                      }`}
                  >
                    Previous
                  </button>
                  {visiblePages.map((p, idx, arr) => {
                    const prevNum = arr[idx - 1];
                    const needDots = idx > 0 && p - (prevNum || 0) > 1;
                    return (
                      <React.Fragment key={p}>
                        {needDots && <span className="px-1">…</span>}
                        <button
                          onClick={() => goToPage(p)}
                          className={`min-w-[28px] px-2 py-1 rounded ${currentPaginatedPage === p
                            ? "bg-[#00a63d] text-white"
                            : "bg-white/10 hover:bg-white/20"
                            }`}
                        >
                          {p}
                        </button>
                      </React.Fragment>
                    );
                  })}
                  <button
                    onClick={next}
                    disabled={currentPaginatedPage === totalPages}
                    className={`px-2 py-1 rounded ${currentPaginatedPage === totalPages
                      ? "bg-white/10 text-white/40 cursor-not-allowed"
                      : "bg-white/10 hover:bg-white/20"
                      }`}
                  >
                    Next
                  </button>
                </div>
                <div>
                  Showing {totalItems === 0 ? 0 : startIdx + 1} to{" "}
                  {Math.min(endIdx, totalItems)} of {totalItems} entries
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            {viewAllPath && (
              <Link href={viewAllPath}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground gap-1 text-xs sm:text-sm"
                >
                  View All {viewAllText}
                  <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
              </Link>
            )}
            {updatedTime && (
              <div className="text-xs text-muted-foreground sm:ml-auto">
                Updated {updatedTime}
              </div>
            )}
          </div>
        </>
      )}
    </Card>
  );
}

