import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { Pencil } from "lucide-react";
import { THEME_COLORS } from "@/shared/constants/colors";
import { cn } from "@/shared/lib/utils";
import type { HierarchyNode } from "../api/org-management";

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const AVATAR_COLOR = THEME_COLORS.hex.navBg;
const LINE_COLOR = "#94a3b8"; // slate-400

interface OrgChartTreeProps {
  roots: HierarchyNode[];
  childrenMap: Map<number, HierarchyNode[]>;
  collapsed: Set<number>;
  onToggleCollapse: (contractId: number) => void;
  highlightIds: Set<number>;
  forceExpandIds: Set<number>;
  crossSiteIds: Set<number>;
  onReassign: (node: HierarchyNode) => void;
}

// Left-to-right org chart: each node is a flex row of [card, children column].
// Connector lines are NOT drawn with CSS pseudo-elements (that approach broke
// under real data — nodes could render visually disconnected whenever a
// branch's height didn't line up with what the CSS math assumed). Instead
// they're drawn as an SVG overlay whose paths are computed from each node's
// *actual* rendered position (getBoundingClientRect) after layout, so a line
// always really does connect the two boxes it's supposed to, regardless of
// how tall any branch turns out to be.
export function OrgChartTree({
  roots,
  childrenMap,
  collapsed,
  onToggleCollapse,
  highlightIds,
  forceExpandIds,
  crossSiteIds,
  onReassign,
}: OrgChartTreeProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [paths, setPaths] = useState<{ key: string; d: string }[]>([]);
  const [svgSize, setSvgSize] = useState({ width: 0, height: 0 });

  // Every manager->report edge that should currently be visible (i.e. not
  // hidden behind a collapsed ancestor).
  const visibleEdges = useMemo(
    () => computeVisibleEdges(roots, childrenMap, collapsed, forceExpandIds),
    [roots, childrenMap, collapsed, forceExpandIds]
  );

  useLayoutEffect(() => {
    const recompute = () => {
      const wrapper = wrapperRef.current;
      if (!wrapper) return;
      const wrapperRect = wrapper.getBoundingClientRect();
      const nextPaths: { key: string; d: string }[] = [];

      visibleEdges.forEach(({ parentId, childId }) => {
        const parentEl = document.getElementById(`org-node-${parentId}`);
        const childEl = document.getElementById(`org-node-${childId}`);
        if (!parentEl || !childEl) return;
        const pRect = parentEl.getBoundingClientRect();
        const cRect = childEl.getBoundingClientRect();

        const x1 = pRect.right - wrapperRect.left;
        const y1 = pRect.top + pRect.height / 2 - wrapperRect.top;
        const x2 = cRect.left - wrapperRect.left;
        const y2 = cRect.top + cRect.height / 2 - wrapperRect.top;
        const midX = (x1 + x2) / 2;

        nextPaths.push({
          key: `${parentId}-${childId}`,
          d: `M${x1},${y1} C${midX},${y1} ${midX},${y2} ${x2},${y2}`,
        });
      });

      setPaths(nextPaths);
      setSvgSize({ width: wrapper.scrollWidth, height: wrapper.scrollHeight });
    };

    recompute();
    // A second pass on the next frame catches any layout still settling
    // (e.g. web font swap) that a synchronous measurement could miss.
    const raf = requestAnimationFrame(recompute);
    window.addEventListener("resize", recompute);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", recompute);
    };
  }, [visibleEdges]);

  if (roots.length === 0) {
    return <p className="text-xs text-gray-400 text-center py-16">Belum ada struktur organisasi untuk ditampilkan.</p>;
  }

  return (
    <div ref={wrapperRef} className="relative w-fit">
      <svg
        className="absolute inset-0 pointer-events-none"
        width={svgSize.width}
        height={svgSize.height}
        style={{ overflow: "visible" }}
      >
        {paths.map((p) => (
          <path key={p.key} d={p.d} stroke={LINE_COLOR} strokeWidth={1.5} strokeLinecap="round" fill="none" />
        ))}
      </svg>

      <div className="relative flex flex-col gap-10 py-2">
        {roots.map((root) => (
          <OrgChartNode
            key={root.contract_id}
            node={root}
            childrenMap={childrenMap}
            collapsed={collapsed}
            onToggleCollapse={onToggleCollapse}
            highlightIds={highlightIds}
            forceExpandIds={forceExpandIds}
            crossSiteIds={crossSiteIds}
            onReassign={onReassign}
          />
        ))}
      </div>
    </div>
  );
}

// Walks the visible tree (respecting collapse state, but always traversing
// through force-expanded ancestors of a search/filter match) and returns the
// flat list of parent->child pairs that are actually on screen right now.
function computeVisibleEdges(
  roots: HierarchyNode[],
  childrenMap: Map<number, HierarchyNode[]>,
  collapsed: Set<number>,
  forceExpandIds: Set<number>
) {
  const edges: { parentId: number; childId: number }[] = [];
  const walk = (node: HierarchyNode) => {
    const children = childrenMap.get(node.contract_id) || [];
    const isOpen = !collapsed.has(node.contract_id) || forceExpandIds.has(node.contract_id);
    if (children.length > 0 && isOpen) {
      children.forEach((child) => {
        edges.push({ parentId: node.contract_id, childId: child.contract_id });
        walk(child);
      });
    }
  };
  roots.forEach(walk);
  return edges;
}

interface OrgChartNodeProps {
  node: HierarchyNode;
  childrenMap: Map<number, HierarchyNode[]>;
  collapsed: Set<number>;
  onToggleCollapse: (contractId: number) => void;
  highlightIds: Set<number>;
  forceExpandIds: Set<number>;
  crossSiteIds: Set<number>;
  onReassign: (node: HierarchyNode) => void;
}

function OrgChartNode({
  node,
  childrenMap,
  collapsed,
  onToggleCollapse,
  highlightIds,
  forceExpandIds,
  crossSiteIds,
  onReassign,
}: OrgChartNodeProps) {
  const children = childrenMap.get(node.contract_id) || [];
  const hasChildren = children.length > 0;
  const isOpen = !collapsed.has(node.contract_id) || forceExpandIds.has(node.contract_id);
  const isHighlighted = highlightIds.has(node.contract_id);
  const isCrossSite = crossSiteIds.has(node.contract_id);

  return (
    <div className="flex items-center">
      <div
        id={`org-node-${node.contract_id}`}
        className={cn(
          "group relative bg-white rounded-xl border shadow-xs p-2.5 w-[220px] shrink-0 transition-colors",
          isHighlighted ? "border-2" : "border-gray-200/80"
        )}
        style={isHighlighted ? { borderColor: THEME_COLORS.hex.primary } : undefined}
      >
        <button
          type="button"
          onClick={() => onReassign(node)}
          title="Ubah Atasan"
          className="absolute top-1.5 right-1.5 p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
        >
          <Pencil size={11} />
        </button>

        <div className="flex items-center gap-2">
          <div
            style={{ backgroundColor: AVATAR_COLOR }}
            className="w-10 h-10 rounded-full text-white text-[10px] font-black flex items-center justify-center shrink-0"
          >
            {getInitials(node.name || "?")}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-bold text-gray-800 text-xs leading-tight truncate">{node.name || "-"}</p>
            <p className="text-[10px] text-gray-400 font-medium leading-tight truncate">
              {node.jabatan?.nama_jabatan || "-"}
            </p>
            {(node.lokasi || isCrossSite) && (
              <div className="flex items-center gap-1 mt-0.5">
                {node.lokasi && (
                  <span className="inline-flex items-center px-[3px] rounded-sm text-[9px] leading-tight font-medium bg-zinc-100 text-gray-500 truncate">
                    {node.lokasi.nama_lokasi}
                  </span>
                )}
                {isCrossSite && (
                  <span
                    style={{ backgroundColor: `${THEME_COLORS.hex.danger}1A`, color: THEME_COLORS.hex.danger }}
                    className="inline-flex items-center px-[3px] rounded-sm text-[9px] leading-tight font-bold shrink-0"
                  >
                    CROSS-SITE
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {hasChildren && (
          <button
            type="button"
            onClick={() => onToggleCollapse(node.contract_id)}
            title={isOpen ? "Tutup laporan" : "Buka laporan"}
            style={{ backgroundColor: AVATAR_COLOR }}
            className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full text-white text-[10px] font-black flex items-center justify-center shadow-sm cursor-pointer hover:opacity-90"
          >
            {children.length}
          </button>
        )}
      </div>

      {hasChildren && isOpen && (
        <div className="flex flex-col gap-6 ml-12">
          {children.map((child) => (
            <OrgChartNode
              key={child.contract_id}
              node={child}
              childrenMap={childrenMap}
              collapsed={collapsed}
              onToggleCollapse={onToggleCollapse}
              highlightIds={highlightIds}
              forceExpandIds={forceExpandIds}
              crossSiteIds={crossSiteIds}
              onReassign={onReassign}
            />
          ))}
        </div>
      )}
    </div>
  );
}
