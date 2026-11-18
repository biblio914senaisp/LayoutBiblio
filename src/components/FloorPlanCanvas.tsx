import React from "react";
import { ZoomIn, ZoomOut, Maximize, AlertCircle } from "lucide-react";
import { PlacedItem, CatalogItem, FURNITURE_CATALOG } from "../types";

interface FloorPlanCanvasProps {
  items: PlacedItem[];
  roomWidth: number; // in meters
  roomHeight: number; // in meters
  selectedItemId: string | null;
  onSelectItem: (id: string | null) => void;
  onMoveItem: (id: string, x: number, y: number) => void;
  onUpdateItem: (id: string, updated: Partial<PlacedItem>) => void;
  onStartDrag?: () => void;
  
  // Settings
  showGrid: boolean;
  snapToGrid: boolean;
  showLabels: boolean;
}

export const FloorPlanCanvas: React.FC<FloorPlanCanvasProps> = ({
  items,
  roomWidth,
  roomHeight,
  selectedItemId,
  onSelectItem,
  onMoveItem,
  onUpdateItem,
  onStartDrag,
  showGrid,
  snapToGrid,
  showLabels,
}) => {
  const [scale, setScale] = React.useState(45); // pixels per meter
  const [isDragging, setIsDragging] = React.useState(false);
  const [draggedId, setDraggedId] = React.useState<string | null>(null);
  const [dragOffset, setDragOffset] = React.useState({ x: 0, y: 0 });

  // Get current selected item details
  const selectedItem = items.find((it) => it.id === selectedItemId);

  // SVG dimensions
  const svgWidth = roomWidth * scale;
  const svgHeight = roomHeight * scale;

  // Zoom controls
  const handleZoomIn = () => setScale((prev) => Math.min(100, prev + 5));
  const handleZoomOut = () => setScale((prev) => Math.max(20, prev - 5));
  const handleZoomFit = () => {
    // Dynamically calculate fit scale
    const container = document.getElementById("canvas-container");
    if (container) {
      const { width, height } = container.getBoundingClientRect();
      const padding = 60;
      const scaleX = (width - padding) / roomWidth;
      const scaleY = (height - padding) / roomHeight;
      setScale(Math.floor(Math.max(20, Math.min(100, Math.min(scaleX, scaleY)))));
    }
  };

  // Convert client cursor coordinate to canvas meters coordinates
  const getCoordinatesFromEvent = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;
    return { x, y };
  };

  const handleMouseDown = (e: React.MouseEvent, item: PlacedItem) => {
    e.stopPropagation();
    onStartDrag?.();
    onSelectItem(item.id);
    setDraggedId(item.id);
    setIsDragging(true);

    // Calculate click offset relative to item top-left corner
    const svgEl = document.getElementById("floorplan-svg") as unknown as SVGSVGElement;
    if (svgEl) {
      const rect = svgEl.getBoundingClientRect();
      const clickX = (e.clientX - rect.left) / scale;
      const clickY = (e.clientY - rect.top) / scale;
      setDragOffset({
        x: clickX - item.x,
        y: clickY - item.y,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isDragging || !draggedId) return;

    const coords = getCoordinatesFromEvent(e);
    let newX = coords.x - dragOffset.x;
    let newY = coords.y - dragOffset.y;

    const currentItem = items.find((it) => it.id === draggedId);
    if (!currentItem) return;

    // Boundary constraints (within room dimensions)
    newX = Math.max(0, Math.min(roomWidth - currentItem.width, newX));
    newY = Math.max(0, Math.min(roomHeight - currentItem.height, newY));

    // Snapping to nearest grid interval (e.g. 10cm = 0.1m)
    if (snapToGrid) {
      newX = Math.round(newX * 10) / 10;
      newY = Math.round(newY * 10) / 10;
    }

    onMoveItem(draggedId, newX, newY);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDraggedId(null);
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    // Click outside deselects
    if (e.target === e.currentTarget || (e.target as SVGElement).id === "grid-overlay") {
      onSelectItem(null);
    }
  };

  // Quick 90 degree rotation on selection
  const handleRotateClick = (e: React.MouseEvent, item: PlacedItem) => {
    e.stopPropagation();
    onStartDrag?.();
    const nextRotation = (item.rotation + 90) % 360;
    onUpdateItem(item.id, { rotation: nextRotation });
  };

  // Helper to render customized visual elements based on furniture type
  const renderItemGraphics = (item: PlacedItem) => {
    const w = item.width * scale;
    const h = item.height * scale;
    const baseColor = item.color;

    // Get catalog definition for symbol classification
    const catalogItem = FURNITURE_CATALOG.find((cat) => cat.id === item.type);
    const symbolType = catalogItem?.symbolType || "rect";

    switch (symbolType) {
      case "door":
        return (
          <g>
            {/* Opening arc */}
            <path
              d={`M 0,${h} A ${w},${w} 0 0,1 ${w},${h - w}`}
              fill="none"
              stroke={baseColor}
              strokeWidth="2"
              strokeDasharray="4,4"
            />
            {/* Opened leaf */}
            <line x1="0" y1={h} x2="0" y2={h - w} stroke={baseColor} strokeWidth="4" />
            {/* Frame / Threshold */}
            <line x1="0" y1={h} x2={w} y2={h} stroke="#9ca3af" strokeWidth="2" />
          </g>
        );

      case "window":
        return (
          <g>
            {/* Outer window frames */}
            <rect x="0" y="2" width={w} height={h - 4} fill="#e0f2fe" stroke={baseColor} strokeWidth="1.5" />
            {/* Window glass pane line */}
            <line x1="0" y1={h / 2} x2={w} y2={h / 2} stroke={baseColor} strokeWidth="2" />
            {/* Sashes */}
            <line x1={w * 0.33} y1="2" x2={w * 0.33} y2={h - 2} stroke={baseColor} strokeWidth="1" />
            <line x1={w * 0.66} y1="2" x2={w * 0.66} y2={h - 2} stroke={baseColor} strokeWidth="1" />
          </g>
        );

      case "circle": {
        // Table with chairs
        const isTableWithToalha = item.type === "mesa_toalha_rosa";
        const isChessTable = item.type === "mesa_oval_jogos";
        const radiusX = w / 2;
        const radiusY = h / 2;

        return (
          <g>
            {/* Chairs representation */}
            {!isTableWithToalha && (
              <g opacity="0.8">
                {/* Chair North */}
                <rect x={radiusX - 12} y="-10" width="24" height="12" rx="3" fill="#334155" stroke="#1e293b" strokeWidth="1" />
                {/* Chair South */}
                <rect x={radiusX - 12} y={h - 2} width="24" height="12" rx="3" fill="#334155" stroke="#1e293b" strokeWidth="1" />
                {/* Chair West */}
                <rect x="-10" y={radiusY - 12} width="12" height="24" rx="3" fill="#334155" stroke="#1e293b" strokeWidth="1" />
                {/* Chair East */}
                <rect x={w - 2} y={radiusY - 12} width="12" height="24" rx="3" fill="#334155" stroke="#1e293b" strokeWidth="1" />
              </g>
            )}

            {/* Table center structure */}
            <ellipse cx={radiusX} cy={radiusY} rx={radiusX - 4} ry={radiusY - 4} fill={baseColor} stroke="#475569" strokeWidth="2" />
            
            {/* Inner aesthetic details */}
            {isTableWithToalha ? (
              // Pink/Red ruffled tablecloth look
              <ellipse cx={radiusX} cy={radiusY} rx={radiusX - 12} ry={radiusY - 12} fill="#ec4899" stroke="#f472b6" strokeWidth="1" strokeDasharray="3,2" />
            ) : isChessTable ? (
              // Chessboard grids drawn on table
              <g opacity="0.6" transform={`translate(${radiusX - 25}, ${radiusY - 12})`}>
                <rect x="0" y="0" width="20" height="24" fill="#cbd5e1" stroke="#475569" strokeWidth="1" />
                <rect x="30" y="0" width="20" height="24" fill="#cbd5e1" stroke="#475569" strokeWidth="1" />
                <path d="M 2,2 h 6 v 6 h -6 z M 10,10 h 6 v 6 h -6 z" fill="#1e293b" />
                <path d="M 32,2 h 6 v 6 h -6 z M 40,10 h 6 v 6 h -6 z" fill="#1e293b" />
              </g>
            ) : (
              // Standard wood/table look
              <ellipse cx={radiusX} cy={radiusY} rx={radiusX - 14} ry={radiusY - 14} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
            )}
          </g>
        );
      }

      case "l_shape":
        return (
          <g>
            {/* L shape polygon */}
            <path
              d={`M 0,0 H ${w} V ${h * 0.4} H ${w * 0.4} V ${h} H 0 Z`}
              fill={baseColor}
              stroke="#475569"
              strokeWidth="2"
            />
            {/* Desktop wood grains decoration */}
            <path
              d={`M 5,5 H ${w - 5} M 5,15 H ${w * 0.4 - 5}`}
              stroke="rgba(255,255,255,0.15)"
              strokeWidth="1.5"
            />
            {/* Computer icon representation for workstation corner */}
            <g transform={`translate(${w * 0.1}, ${h * 0.1})`} opacity="0.6">
              <rect x="0" y="0" width="22" height="15" rx="2" fill="#1e293b" />
              <rect x="2" y="2" width="18" height="11" fill="#cbd5e1" />
              <line x1="8" y1="15" x2="14" y2="15" stroke="#1e293b" strokeWidth="2" />
              <line x1="5" y1="17" x2="17" y2="17" stroke="#1e293b" strokeWidth="1.5" />
            </g>
          </g>
        );

      case "modular_sofa": {
        // Yellow & blue modular blocks alternated
        const segments = 4;
        const segW = w / segments;
        return (
          <g>
            {Array.from({ length: segments }).map((_, idx) => {
              const bg = idx % 2 === 0 ? "#eab308" : "#0284c7"; // Yellow or Blue
              return (
                <g key={idx} transform={`translate(${idx * segW}, 0)`}>
                  {/* Seat pillow */}
                  <rect x="1" y="1" width={segW - 2} height={h - 6} rx="4" fill={bg} stroke="#334155" strokeWidth="1" />
                  {/* Soft top border backrest */}
                  <rect x="1" y={h - 6} width={segW - 2} height="5" rx="1" fill="#475569" />
                </g>
              );
            })}
          </g>
        );
      }

      case "double_shelf": {
        const isWhiteboardKey = item.type === "lousa_teclado";
        return (
          <g>
            <rect x="0" y="0" width={w} height={h} fill={baseColor} stroke="#475569" strokeWidth="2" rx="2" />
            
            {isWhiteboardKey ? (
              // Whiteboard + Keyboard layout
              <g>
                {/* Glass Whiteboard Surface */}
                <rect x="4" y="4" width={w - 8} height={h - 22} fill="#f1f5f9" stroke="#94a3b8" rx="1" />
                <line x1="10" y1="12" x2={w - 10} y2="12" stroke="#cbd5e1" strokeWidth="2" />
                {/* Electronic keyboard */}
                <g transform={`translate(${w / 2 - 30}, ${h - 16})`}>
                  <rect x="0" y="0" width="60" height="12" fill="#1e293b" rx="1" />
                  {/* Key notes */}
                  {Array.from({ length: 12 }).map((_, i) => (
                    <line key={i} x1={3 + i * 5} y1="1" x2={3 + i * 5} y2="11" stroke="white" strokeWidth="1.5" />
                  ))}
                </g>
              </g>
            ) : (
              // Shelf with computers
              <g>
                {/* Book separator lines */}
                <line x1="0" y1={h / 2} x2={w} y2={h / 2} stroke="#3e2723" strokeWidth="1.5" strokeDasharray="3,3" />
                {/* 3 Computer stations */}
                {Array.from({ length: 3 }).map((_, idx) => {
                  const xPos = (idx + 0.5) * (w / 3) - 12;
                  return (
                    <g key={idx} transform={`translate(${xPos}, ${h * 0.1})`} opacity="0.8">
                      <rect x="0" y="0" width="24" height="16" rx="2" fill="#334155" />
                      <rect x="2" y="2" width="20" height="12" fill="#e2e8f0" />
                      <path d="M 8,16 L 16,16" stroke="#334155" strokeWidth="2" />
                    </g>
                  );
                })}
              </g>
            )}
          </g>
        );
      }

      case "study_desk": {
        const isCarrel = item.type === "cabine_estudos";
        return (
          <g>
            {/* Desktop base */}
            <rect x="0" y="0" width={w} height={h} fill={baseColor} stroke="#475569" strokeWidth="2" rx="2" />
            
            {/* Draw partition panels for study privacy carrel */}
            {isCarrel ? (
              <g stroke="#7c2d12" strokeWidth="2.5" fill="none">
                <line x1="1" y1="1" x2="1" y2={h - 1} /> {/* Left partition */}
                <line x1={w - 1} y1="1" x2={w - 1} y2={h - 1} /> {/* Right partition */}
                <line x1="1" y1="1" x2={w - 1} y2="1" /> {/* Front partition */}
              </g>
            ) : (
              // Normal drawer desk line
              <line x1="0" y1="4" x2={w} y2="4" stroke="rgba(255,255,255,0.2)" />
            )}

            {/* Laptop / Computer detail */}
            <rect x={w / 2 - 15} y={h / 2 - 10} width="30" height="18" rx="1" fill="#cbd5e1" stroke="#64748b" />
            <rect x={w / 2 - 11} y={h / 2 - 7} width="22" height="12" fill="#1e293b" />
            {/* Chair attached */}
            <rect x={w / 2 - 10} y={h + 1} width="20" height="8" rx="2" fill="#1e293b" opacity="0.7" />
          </g>
        );
      }

      case "rect":
      default: {
        // Bookshelf or regular drawer - draw books!
        const isBookshelf = item.type.includes("estante_livros") || item.type === "estante_gibis";
        return (
          <g>
            <rect x="0" y="0" width={w} height={h} fill={baseColor} stroke="#475569" strokeWidth="2" rx="2" />
            {isBookshelf ? (
              // Book spine stripes
              <g opacity="0.6">
                {Array.from({ length: Math.floor(w / 12) }).map((_, i) => {
                  const colors = ["#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#6366f1", "#f43f5e", "#14b8a6"];
                  const bookColor = colors[i % colors.length];
                  const spineW = 10;
                  return (
                    <rect
                      key={i}
                      x={2 + i * 12}
                      y="2"
                      width={spineW}
                      height={h - 4}
                      fill={bookColor}
                      rx="0.5"
                    />
                  );
                })}
              </g>
            ) : (
              // Simple drawers grid look for lockers / arquivos
              <g opacity="0.3" stroke="white" strokeWidth="1">
                <line x1="0" y1={h / 2} x2={w} y2={h / 2} />
                <line x1={w / 2} y1="0" x2={w / 2} y2={h} />
                {/* Little metal handles */}
                <circle cx={w * 0.25} cy={h * 0.25} r="2" fill="white" />
                <circle cx={w * 0.75} cy={h * 0.25} r="2" fill="white" />
                <circle cx={w * 0.25} cy={h * 0.75} r="2" fill="white" />
                <circle cx={w * 0.75} cy={h * 0.75} r="2" fill="white" />
              </g>
            )}
          </g>
        );
      }
    }
  };

  return (
    <div className="flex-1 bg-slate-100 flex flex-col min-w-0" id="floorplan-canvas-container">
      {/* Canvas Top Bar Controls (Zoom & Quick Hints) */}
      <div className="bg-white border-b border-slate-200 px-6 py-2.5 flex items-center justify-between gap-4 select-none">
        <div className="flex items-center gap-1.5 text-slate-500 text-xs">
          <AlertCircle className="w-4 h-4 text-[#4A90E2]" />
          <span>Arraste os móveis para organizar. Clique para abrir as opções e rotacionar ou redimensionar.</span>
        </div>

        {/* Zoom Tool */}
        <div className="flex items-center bg-gray-50 p-0.5 rounded-lg border border-gray-200 shadow-sm">
          <button
            onClick={handleZoomOut}
            className="p-1.5 hover:bg-white rounded text-slate-600 hover:text-slate-900 transition-colors"
            title="Afastar"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs font-mono font-bold text-slate-700 px-3 min-w-[50px] text-center">
            {Math.round((scale / 45) * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            className="p-1.5 hover:bg-white rounded text-slate-600 hover:text-slate-900 transition-colors"
            title="Aproximar"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <div className="w-px h-5 bg-slate-200 mx-1" />
          <button
            onClick={handleZoomFit}
            className="p-1.5 hover:bg-white rounded text-slate-600 hover:text-slate-900 transition-colors flex items-center gap-1"
            title="Ajustar à tela"
          >
            <Maximize className="w-4 h-4" />
            <span className="text-[10px] font-bold">Ajustar</span>
          </button>
        </div>
      </div>

      {/* Main Floor Plan Area */}
      <div 
        id="canvas-container"
        className="flex-1 overflow-auto p-12 flex items-center justify-center relative select-none bg-slate-100"
      >
        <div 
          className="relative bg-white shadow-xl border border-slate-300 rounded-lg"
          style={{ width: `${svgWidth}px`, height: `${svgHeight}px` }}
        >
          {/* Top Metric Ruler */}
          <div className="absolute top-0 left-0 right-0 h-4 bg-slate-200/80 border-b border-slate-300 pointer-events-none overflow-hidden flex items-center">
            {Array.from({ length: Math.ceil(roomWidth) }).map((_, m) => (
              <div 
                key={m} 
                className="absolute text-[8px] font-mono font-bold text-slate-600 border-l border-slate-400 pl-1 pb-0.5 h-full flex items-end"
                style={{ left: `${m * scale}px`, width: `${scale}px` }}
              >
                {m}m
              </div>
            ))}
          </div>

          {/* Left Metric Ruler */}
          <div className="absolute top-0 left-0 bottom-0 w-4 bg-slate-200/80 border-r border-slate-300 pointer-events-none overflow-hidden flex flex-col">
            {Array.from({ length: Math.ceil(roomHeight) }).map((_, m) => (
              <div 
                key={m} 
                className="absolute text-[8px] font-mono font-bold text-slate-600 border-t border-slate-400 pl-0.5 pt-0.5 w-full"
                style={{ top: `${m * scale}px`, height: `${scale}px` }}
              >
                {m}m
              </div>
            ))}
          </div>

          {/* Interactive SVG Canvas */}
          <svg
            id="floorplan-svg"
            width={svgWidth}
            height={svgHeight}
            className="absolute inset-0 cursor-default"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onClick={handleCanvasClick}
          >
            {/* Grid Pattern overlay */}
            {showGrid && (
              <defs>
                {/* 20cm grid box pattern */}
                <pattern id="grid-pattern-minor" width={scale * 0.2} height={scale * 0.2} patternUnits="userSpaceOnUse">
                  <path d={`M ${scale * 0.2} 0 L 0 0 0 ${scale * 0.2}`} fill="none" stroke="#f1f5f9" strokeWidth="1" />
                </pattern>
                {/* 1m grid box pattern */}
                <pattern id="grid-pattern-major" width={scale} height={scale} patternUnits="userSpaceOnUse">
                  <rect width={scale} height={scale} fill="url(#grid-pattern-minor)" />
                  <path d={`M ${scale} 0 L 0 0 0 ${scale}`} fill="none" stroke="#e2e8f0" strokeWidth="1.5" />
                </pattern>
              </defs>
            )}

            {showGrid && (
              <rect
                id="grid-overlay"
                x="0"
                y="0"
                width={svgWidth}
                height={svgHeight}
                fill="url(#grid-pattern-major)"
                className="pointer-events-none"
              />
            )}

            {/* Room Boundary Lines */}
            <rect
              x="0"
              y="0"
              width={svgWidth}
              height={svgHeight}
              fill="none"
              stroke="#2D3436"
              strokeWidth="4"
              className="pointer-events-none"
            />

            {/* RENDER FURNITURE ITEMS */}
            {items.map((item) => {
              const itemW = item.width * scale;
              const itemH = item.height * scale;
              const itemX = item.x * scale;
              const itemY = item.y * scale;
              const isSelected = item.id === selectedItemId;

              return (
                <g
                  key={item.id}
                  transform={`translate(${itemX}, ${itemY})`}
                  className="cursor-move group"
                >
                  {/* Outer container group that handles rotation around center */}
                  <g transform={`rotate(${item.rotation}, ${itemW / 2}, ${itemH / 2})`}>
                    
                    {/* Element graphics */}
                    <g onMouseDown={(e) => handleMouseDown(e, item)}>
                      {renderItemGraphics(item)}
                    </g>

                    {/* Simple Label Overlay inside/above item */}
                    {showLabels && (
                      <g className="pointer-events-none">
                        <rect
                          x={itemW / 2 - 40}
                          y={itemH / 2 - 8}
                          width="80"
                          height="16"
                          rx="3"
                          fill="rgba(15, 23, 42, 0.85)"
                          className="shadow-sm"
                        />
                        <text
                          x={itemW / 2}
                          y={itemH / 2 + 3}
                          fill="#ffffff"
                          fontSize="9px"
                          fontWeight="bold"
                          textAnchor="middle"
                          className="font-sans select-none tracking-tight"
                        >
                          {item.label || item.name}
                        </text>
                        {/* Dimensional labels under */}
                        <text
                          x={itemW / 2}
                          y={itemH / 2 + 13}
                          fill="#facc15"
                          fontSize="7.5px"
                          fontWeight="bold"
                          fontFamily="monospace"
                          textAnchor="middle"
                          className="select-none"
                        >
                          {item.width.toFixed(1)}x{item.height.toFixed(1)}m
                        </text>
                      </g>
                    )}

                    {/* Highlight outline & controls overlay if selected */}
                    {isSelected && (
                      <g className="pointer-events-none">
                        {/* Selected boundary stroke */}
                        <rect
                          x="-4"
                          y="-4"
                          width={itemW + 8}
                          height={itemH + 8}
                          fill="none"
                          stroke="#4A90E2"
                          strokeWidth="2.5"
                          strokeDasharray="4,3"
                        />

                        {/* Interactive rotation helper button icon */}
                        <g 
                          transform={`translate(${itemW / 2 - 11}, ${-26})`}
                          className="pointer-events-auto cursor-pointer"
                          onMouseDown={(e) => handleRotateClick(e, item)}
                          title="Girar 90 graus"
                        >
                          <circle cx="11" cy="11" r="10" fill="#4A90E2" stroke="#ffffff" strokeWidth="1.5" />
                          <path d="M 7,11 A 4,4 0 0,1 11,7 V 5 L 14,8 L 11,11 V 9 A 2,2 0 0,0 9,11" fill="none" stroke="#ffffff" strokeWidth="1.5" />
                        </g>

                        {/* Drag and size info panels */}
                        <text
                          x={itemW / 2}
                          y={itemH + 16}
                          fill="#4A90E2"
                          fontSize="10px"
                          fontWeight="extrabold"
                          fontFamily="monospace"
                          textAnchor="middle"
                        >
                          L: {item.width.toFixed(2)}m • P: {item.height.toFixed(2)}m
                        </text>
                      </g>
                    )}
                  </g>
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    </div>
  );
};
