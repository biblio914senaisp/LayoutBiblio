import React from "react";
import { 
  Search, 
  Trash2, 
  Copy, 
  Layers, 
  Grid3X3, 
  Maximize2, 
  Tag, 
  Compass, 
  Hash,
  BookOpen,
  MousePointerClick,
  SlidersHorizontal,
  Plus,
  X,
  Info,
  Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { FURNITURE_CATALOG, CatalogItem, PlacedItem } from "../types";

interface SidebarProps {
  selectedItem: PlacedItem | null;
  onAddItem: (catalogItem: CatalogItem) => void;
  onUpdateSelectedItem: (updated: Partial<PlacedItem>) => void;
  onDeleteSelectedItem: () => void;
  onDuplicateSelectedItem: () => void;
  onStartChanging?: () => void;
  
  // Settings
  showGrid: boolean;
  onToggleGrid: () => void;
  snapToGrid: boolean;
  onToggleSnap: () => void;
  showLabels: boolean;
  onToggleLabels: () => void;
}

type TabType = "catalog" | "inspector" | "view";

export const Sidebar: React.FC<SidebarProps> = ({
  selectedItem,
  onAddItem,
  onUpdateSelectedItem,
  onDeleteSelectedItem,
  onDuplicateSelectedItem,
  onStartChanging,
  showGrid,
  onToggleGrid,
  snapToGrid,
  onToggleSnap,
  showLabels,
  onToggleLabels,
}) => {
  const [activeTab, setActiveTab] = React.useState<TabType | null>("catalog");
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState<string>("all");

  // Automatically open inspector when an item is selected
  React.useEffect(() => {
    if (selectedItem) {
      setActiveTab("inspector");
    }
  }, [selectedItem?.id]);

  const categories = [
    { id: "all", name: "Todos" },
    { id: "estruturas", name: "Estruturas" },
    { id: "mesas", name: "Mesas" },
    { id: "estantes", name: "Estantes" },
    { id: "assentos", name: "Assentos" },
    { id: "outros", name: "Outros" },
  ];

  const filteredCatalog = FURNITURE_CATALOG.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Predefined furniture wood & solid colors for inspector
  const colorPalette = [
    { name: "Madeira Clara (Carvalho)", value: "#ca8a04" },
    { name: "Madeira Escura (Nogueira)", value: "#713f12" },
    { name: "Madeira Natural (Mogno)", value: "#854d0e" },
    { name: "Cinza Aço (Metal)", value: "#4b5563" },
    { name: "Azul Escolar", value: "#1e3a8a" },
    { name: "Vermelho / Rosa Lúdico", value: "#db2777" },
    { name: "Branco / Lousa", value: "#f8fafc" },
    { name: "Azul Piscina", value: "#0ea5e9" },
    { name: "Verde Lousa/Cortiça", value: "#15803d" },
    { name: "Amarelo Vibrante", value: "#eab308" },
  ];

  const handleToggleTab = (tab: TabType) => {
    setActiveTab((prev) => (prev === tab ? null : tab));
  };

  return (
    <aside 
      className="no-print w-full lg:w-20 bg-slate-950 border-t lg:border-t-0 lg:border-r border-slate-800 flex lg:flex-col items-center justify-between lg:justify-start py-2 lg:py-6 px-4 lg:px-0 h-16 lg:h-full select-none z-40 relative flex-shrink-0 overflow-visible"
      id="app-sidebar"
    >
      {/* Brand / Logo (Desktop only) */}
      <div className="hidden lg:flex flex-col items-center mb-8">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#4A90E2] to-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <span className="text-[10px] text-slate-500 font-bold tracking-wider uppercase mt-2">v1.1</span>
      </div>

      {/* Dock Buttons Group */}
      <div className="flex lg:flex-col items-center justify-around lg:justify-start w-full gap-4 lg:gap-5 flex-1 lg:flex-initial">
        
        {/* CATALOG TAB BUTTON */}
        <button
          onClick={() => handleToggleTab("catalog")}
          className={`flex lg:flex-col items-center justify-center p-2 lg:w-16 lg:h-16 rounded-xl transition-all relative cursor-pointer group ${
            activeTab === "catalog"
              ? "bg-[#4A90E2]/15 text-[#4A90E2] lg:border-r-2 lg:border-r-[#4A90E2]"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
          }`}
          title="Catálogo de móveis"
        >
          <Plus className="w-5 h-5 lg:w-6 lg:h-6" />
          <span className="text-[9px] font-bold tracking-tight mt-1 hidden lg:inline">Catálogo</span>
        </button>

        {/* INSPECTOR TAB BUTTON */}
        <button
          onClick={() => handleToggleTab("inspector")}
          className={`flex lg:flex-col items-center justify-center p-2 lg:w-16 lg:h-16 rounded-xl transition-all relative cursor-pointer group ${
            activeTab === "inspector"
              ? "bg-[#4A90E2]/15 text-[#4A90E2] lg:border-r-2 lg:border-r-[#4A90E2]"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
          }`}
          title="Ajustar objeto selecionado"
        >
          <div className="relative">
            <SlidersHorizontal className="w-5 h-5 lg:w-6 lg:h-6" />
            {selectedItem && activeTab !== "inspector" && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-blue-500 border-2 border-slate-950 rounded-full animate-ping" />
            )}
            {selectedItem && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#4A90E2] border-2 border-slate-950 rounded-full" />
            )}
          </div>
          <span className="text-[9px] font-bold tracking-tight mt-1 hidden lg:inline">Ajustes</span>
        </button>

        {/* VIEW OPTIONS TAB BUTTON */}
        <button
          onClick={() => handleToggleTab("view")}
          className={`flex lg:flex-col items-center justify-center p-2 lg:w-16 lg:h-16 rounded-xl transition-all relative cursor-pointer group ${
            activeTab === "view"
              ? "bg-[#4A90E2]/15 text-[#4A90E2] lg:border-r-2 lg:border-r-[#4A90E2]"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
          }`}
          title="Opções de visualização"
        >
          <Grid3X3 className="w-5 h-5 lg:w-6 lg:h-6" />
          <span className="text-[9px] font-bold tracking-tight mt-1 hidden lg:inline">Exibição</span>
        </button>
      </div>

      {/* Info Badge (Desktop only) */}
      <div className="hidden lg:flex items-center justify-center text-slate-600 hover:text-slate-400 transition-colors cursor-pointer mt-auto">
        <Info className="w-5 h-5" title="Designer de Planta Baixa Escolar" />
      </div>

      {/* Floating Pop-up Panels Container */}
      <AnimatePresence mode="wait">
        {activeTab && (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: -16, scale: 0.98 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -16, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute left-4 right-4 bottom-20 lg:left-24 lg:top-6 lg:bottom-6 lg:right-auto w-auto lg:w-96 bg-white border border-slate-200/80 rounded-2xl shadow-2xl flex flex-col z-30 overflow-hidden border-slate-100 bg-white/95 backdrop-blur-md"
            style={{ maxHeight: "calc(100vh - 120px)" }}
          >
            
            {/* Pop-up Header */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 flex-shrink-0">
              <div className="flex items-center gap-2">
                {activeTab === "catalog" && (
                  <>
                    <Plus className="w-4 h-4 text-[#4A90E2] stroke-[2.5]" />
                    <h3 className="font-sans font-bold text-slate-800 text-sm">Adicionar Móveis</h3>
                  </>
                )}
                {activeTab === "inspector" && (
                  <>
                    <SlidersHorizontal className="w-4 h-4 text-[#4A90E2] stroke-[2.5]" />
                    <h3 className="font-sans font-bold text-slate-800 text-sm">Inspetor de Objeto</h3>
                  </>
                )}
                {activeTab === "view" && (
                  <>
                    <Grid3X3 className="w-4 h-4 text-[#4A90E2] stroke-[2.5]" />
                    <h3 className="font-sans font-bold text-slate-800 text-sm">Modos de Visualização</h3>
                  </>
                )}
              </div>
              <button
                onClick={() => setActiveTab(null)}
                className="p-1 hover:bg-slate-200/60 rounded-lg text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                title="Fechar menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Pop-up Body (Scrollable Content) */}
            <div className="flex-1 overflow-y-auto min-h-0">
              
              {/* CATALOG CONTENT */}
              {activeTab === "catalog" && (
                <div className="flex flex-col h-full">
                  <div className="p-4 border-b border-slate-100 bg-slate-50/20 space-y-3">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Buscar móvel..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#4A90E2] font-sans shadow-inner"
                      />
                    </div>

                    {/* Category Badges */}
                    <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-slate-200">
                      {categories.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => setSelectedCategory(cat.id)}
                          className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                            selectedCategory === cat.id
                              ? "bg-[#4A90E2] text-white font-semibold shadow-sm"
                              : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                          }`}
                        >
                          {cat.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Catalog Items Scroll Container */}
                  <div className="p-4 space-y-2.5">
                    {filteredCatalog.length > 0 ? (
                      filteredCatalog.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => onAddItem(item)}
                          className="w-full p-3.5 text-left bg-slate-50 hover:bg-[#4A90E2]/5 hover:border-[#4A90E2]/30 border border-slate-100 rounded-xl transition-all hover:shadow-sm active:scale-[0.99] flex gap-3 group cursor-pointer"
                        >
                          {/* Colored visual indicator */}
                          <div className="w-12 h-12 rounded-lg flex-shrink-0 flex flex-col items-center justify-center text-xs font-semibold text-white shadow-sm transition-all group-hover:scale-105"
                            style={{ backgroundColor: item.color }}>
                            <span className="font-mono text-[9px] text-white/90 leading-none">
                              {item.defaultWidth.toFixed(1)}m
                            </span>
                            <div className="w-full border-t border-white/20 my-0.5" />
                            <span className="font-mono text-[9px] text-white/90 leading-none">
                              {item.defaultHeight.toFixed(1)}m
                            </span>
                          </div>

                          {/* Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="font-sans font-bold text-sm text-slate-800 group-hover:text-[#4A90E2] truncate">
                                {item.name}
                              </span>
                              <span className="text-[9px] bg-slate-200/60 text-slate-600 font-medium px-1.5 py-0.5 rounded uppercase flex-shrink-0">
                                {item.category}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 line-clamp-2 mt-0.5 leading-relaxed">
                              {item.description}
                            </p>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="text-center text-slate-400 py-10">
                        <p className="text-sm font-medium">Nenhum móvel encontrado.</p>
                        <p className="text-xs text-slate-400 mt-1">Tente buscar por termos mais simples.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* INSPECTOR CONTENT */}
              {activeTab === "inspector" && (
                <div className="p-5 space-y-4">
                  {selectedItem ? (
                    <>
                      {/* Name Inspector */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-xs font-semibold text-slate-700">Etiqueta Personalizada</label>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={onDuplicateSelectedItem}
                              className="p-1 hover:bg-slate-100 rounded text-slate-600 transition-colors cursor-pointer"
                              title="Duplicar objeto"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={onDeleteSelectedItem}
                              className="p-1 hover:bg-rose-50 rounded text-rose-600 transition-colors cursor-pointer"
                              title="Excluir objeto"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        <input
                          type="text"
                          value={selectedItem.label || ""}
                          placeholder={selectedItem.name}
                          onFocus={() => onStartChanging?.()}
                          onChange={(e) => onUpdateSelectedItem({ label: e.target.value })}
                          className="w-full px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-md text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#4A90E2] font-sans"
                        />
                        <span className="text-[10px] text-gray-400 mt-0.5 block">Ex: "Mesa do Grupo A", "Estante de História"</span>
                      </div>

                      {/* Dimensions Inspector */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                            <Maximize2 className="w-3.5 h-3.5" /> Largura (m)
                          </label>
                          <div className="flex items-center">
                            <button
                              onClick={() => { onStartChanging?.(); onUpdateSelectedItem({ width: Math.max(0.2, selectedItem.width - 0.1) }); }}
                              className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-l text-xs font-bold font-mono text-slate-700 border-y border-l border-gray-300 cursor-pointer"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              step="0.05"
                              min="0.1"
                              max="10"
                              value={selectedItem.width}
                              onFocus={() => onStartChanging?.()}
                              onChange={(e) => onUpdateSelectedItem({ width: Math.max(0.1, Number(e.target.value)) })}
                              className="w-full text-center py-1 bg-white border-y border-gray-300 text-xs font-mono font-medium focus:outline-none"
                            />
                            <button
                              onClick={() => { onStartChanging?.(); onUpdateSelectedItem({ width: Math.min(15, selectedItem.width + 0.1) }); }}
                              className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-r text-xs font-bold font-mono text-slate-700 border-y border-r border-gray-300 cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                            <Maximize2 className="w-3.5 h-3.5 rotate-90" /> Profundidade (m)
                          </label>
                          <div className="flex items-center">
                            <button
                              onClick={() => { onStartChanging?.(); onUpdateSelectedItem({ height: Math.max(0.2, selectedItem.height - 0.1) }); }}
                              className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-l text-xs font-bold font-mono text-slate-700 border-y border-l border-gray-300 cursor-pointer"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              step="0.05"
                              min="0.1"
                              max="10"
                              value={selectedItem.height}
                              onFocus={() => onStartChanging?.()}
                              onChange={(e) => onUpdateSelectedItem({ height: Math.max(0.1, Number(e.target.value)) })}
                              className="w-full text-center py-1 bg-white border-y border-gray-300 text-xs font-mono font-medium focus:outline-none"
                            />
                            <button
                              onClick={() => { onStartChanging?.(); onUpdateSelectedItem({ height: Math.min(15, selectedItem.height + 0.1) }); }}
                              className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-r text-xs font-bold font-mono text-slate-700 border-y border-r border-gray-300 cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Rotation Inspector */}
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                            <Compass className="w-3.5 h-3.5" /> Rotação: <span className="font-mono text-[#4A90E2] font-bold">{selectedItem.rotation}°</span>
                          </label>
                          <div className="flex gap-1">
                            {[0, 90, 180, 270].map((angle) => (
                              <button
                                key={angle}
                                onClick={() => { onStartChanging?.(); onUpdateSelectedItem({ rotation: angle }); }}
                                className="px-1.5 py-0.5 bg-gray-100 hover:bg-gray-200 rounded text-[10px] font-mono font-semibold text-slate-700 border border-gray-300 cursor-pointer"
                              >
                                {angle}°
                              </button>
                            ))}
                          </div>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="359"
                          value={selectedItem.rotation}
                          onMouseDown={() => onStartChanging?.()}
                          onChange={(e) => onUpdateSelectedItem({ rotation: parseInt(e.target.value) })}
                          className="w-full accent-[#4A90E2] h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                        />
                      </div>

                      {/* Color Palette Inspector */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Cor Temática do Móvel</label>
                        <div className="grid grid-cols-5 gap-2">
                          {colorPalette.map((color) => (
                            <button
                              key={color.value}
                              onClick={() => { onStartChanging?.(); onUpdateSelectedItem({ color: color.value }); }}
                              className={`w-10 h-10 rounded-xl border-2 transition-all hover:scale-110 cursor-pointer flex items-center justify-center ${
                                selectedItem.color === color.value ? "border-[#4A90E2] ring-2 ring-[#4A90E2]/30 scale-105" : "border-transparent"
                              }`}
                              style={{ backgroundColor: color.value }}
                              title={color.name}
                            >
                              {selectedItem.color === color.value && (
                                <div className="w-2.5 h-2.5 bg-white rounded-full shadow-md" />
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-12 text-slate-400">
                      <MousePointerClick className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                      <p className="text-sm font-semibold text-slate-600">Inspetor Vazio</p>
                      <p className="text-xs text-slate-400 mt-1 max-w-[240px] mx-auto leading-relaxed">
                        Selecione um móvel da planta baixa para ajustar as dimensões, rotação e cores personalizadas.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* VIEW CONFIG CONTENT */}
              {activeTab === "view" && (
                <div className="p-5 space-y-4">
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Personalize a forma como você visualiza a planta baixa do seu ambiente escolar:
                  </p>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    {/* Toggle Grid */}
                    <button
                      onClick={onToggleGrid}
                      className={`flex flex-col items-start p-4 rounded-xl border text-left transition-all cursor-pointer ${
                        showGrid
                          ? "bg-slate-50 border-blue-200 ring-2 ring-blue-500/10"
                          : "bg-white border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <div className={`p-2 rounded-lg mb-3 ${showGrid ? "bg-blue-100 text-[#4A90E2]" : "bg-slate-100 text-slate-500"}`}>
                        <Grid3X3 className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-bold text-slate-800">Grelha Milimetrada</span>
                      <span className="text-[10px] text-slate-400 mt-0.5 leading-none">{showGrid ? "Visível" : "Oculta"}</span>
                    </button>

                    {/* Toggle Snap */}
                    <button
                      onClick={onToggleSnap}
                      className={`flex flex-col items-start p-4 rounded-xl border text-left transition-all cursor-pointer ${
                        snapToGrid
                          ? "bg-slate-50 border-blue-200 ring-2 ring-blue-500/10"
                          : "bg-white border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <div className={`p-2 rounded-lg mb-3 ${snapToGrid ? "bg-blue-100 text-[#4A90E2]" : "bg-slate-100 text-slate-500"}`}>
                        <Hash className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-bold text-slate-800">Atração Magnética</span>
                      <span className="text-[10px] text-slate-400 mt-0.5 leading-none">{snapToGrid ? "Ativo" : "Inativo"}</span>
                    </button>

                    {/* Toggle Labels */}
                    <button
                      onClick={onToggleLabels}
                      className={`flex flex-col items-start p-4 rounded-xl border text-left transition-all cursor-pointer ${
                        showLabels
                          ? "bg-slate-50 border-blue-200 ring-2 ring-blue-500/10"
                          : "bg-white border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <div className={`p-2 rounded-lg mb-3 ${showLabels ? "bg-blue-100 text-[#4A90E2]" : "bg-slate-100 text-slate-500"}`}>
                        <Tag className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-bold text-slate-800">Etiquetas de Itens</span>
                      <span className="text-[10px] text-slate-400 mt-0.5 leading-none">{showLabels ? "Visíveis" : "Ocultas"}</span>
                    </button>
                  </div>
                </div>
              )}

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </aside>
  );
};
