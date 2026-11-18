import React from "react";
import { 
  FilePlus, 
  FolderOpen, 
  Download, 
  Printer, 
  Save, 
  Layers, 
  Settings, 
  Copy, 
  Trash2,
  Share2,
  Grid,
  Undo,
  Redo,
  Eraser
} from "lucide-react";
import { LibraryProject } from "../types";

interface HeaderProps {
  project: LibraryProject;
  saveStatus: "saved" | "saving" | "error" | "local";
  onNewProject: () => void;
  onOpenProjectList: () => void;
  onDuplicateProject: () => void;
  onDeleteProject: () => void;
  onClearLayout: () => void;
  onExportPNG: () => void;
  onPrintPDF: () => void;
  onUpdateRoomDimensions: (width: number, height: number) => void;
  onShareProject: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  project,
  saveStatus,
  onNewProject,
  onOpenProjectList,
  onDuplicateProject,
  onDeleteProject,
  onClearLayout,
  onExportPNG,
  onPrintPDF,
  onUpdateRoomDimensions,
  onShareProject,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}) => {
  const [roomW, setRoomW] = React.useState(project.width);
  const [roomH, setRoomH] = React.useState(project.height);
  const [isEditingDim, setIsEditingDim] = React.useState(false);

  // Sync internal state with project dimensions
  React.useEffect(() => {
    setRoomW(project.width);
    setRoomH(project.height);
  }, [project.width, project.height]);

  const handleSaveDimensions = (e: React.FormEvent) => {
    e.preventDefault();
    const w = Math.max(2, Math.min(50, Number(roomW)));
    const h = Math.max(2, Math.min(50, Number(roomH)));
    onUpdateRoomDimensions(w, h);
    setIsEditingDim(false);
  };

  const statusLabel = {
    saved: { text: "Salvo na nuvem", bg: "bg-green-50 text-green-700 border-green-200" },
    saving: { text: "Salvando...", bg: "bg-amber-50 text-amber-700 border-amber-200 animate-pulse" },
    error: { text: "Erro ao salvar", bg: "bg-rose-50 text-rose-700 border-rose-200" },
    local: { text: "Salvo localmente (Offline)", bg: "bg-blue-50 text-blue-700 border-blue-200" }
  }[saveStatus];

  return (
    <header className="bg-white text-[#2D3436] shadow-sm border-b border-gray-200 px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 shrink-0" id="app-header">
      {/* Brand Logo & Name */}
      <div className="flex items-center gap-4">
        <div className="w-[100px] h-[100px] rounded-full overflow-hidden border-2 border-slate-200/80 shadow-sm flex-shrink-0 bg-slate-50">
          <img 
            src="/src/assets/images/senai_robot_avatar_1784319019571.jpg" 
            alt="SENAI Robot Avatar" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-sans font-semibold text-lg md:text-xl tracking-tight text-[#2D3436]">
              Mude meu layout!
            </h1>
            <span className={`text-[10px] px-2 py-0.5 font-semibold rounded-full border ${statusLabel.bg}`}>
              {statusLabel.text}
            </span>
          </div>
          <p className="text-xs text-gray-400">
            Bibliotecas precisam de layouts responsivos e otimizados para a comunidade que atende, por que não fazer um rascunho aqui no app?
          </p>
        </div>
      </div>

      {/* Center: Current Project Info & Dimensions */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
        <div className="text-center sm:text-left">
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Projeto Ativo</div>
          <div className="font-sans font-semibold text-[#4A90E2] text-sm">{project.name}</div>
        </div>

        <div className="h-px w-6 sm:h-8 sm:w-px bg-gray-200" />

        {isEditingDim ? (
          <form onSubmit={handleSaveDimensions} className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <input
                type="number"
                step="0.5"
                min="2"
                max="50"
                value={roomW}
                onChange={(e) => setRoomW(Number(e.target.value))}
                className="w-16 px-1.5 py-1 text-xs text-slate-900 bg-white border border-gray-300 rounded font-mono text-center focus:outline-none focus:ring-2 focus:ring-[#4A90E2]"
                title="Largura da sala (metros)"
              />
              <span className="text-xs text-slate-400">x</span>
              <input
                type="number"
                step="0.5"
                min="2"
                max="50"
                value={roomH}
                onChange={(e) => setRoomH(Number(e.target.value))}
                className="w-16 px-1.5 py-1 text-xs text-slate-900 bg-white border border-gray-300 rounded font-mono text-center focus:outline-none focus:ring-2 focus:ring-[#4A90E2]"
                title="Comprimento da sala (metros)"
              />
              <span className="text-xs text-slate-400">m</span>
            </div>
            <button
              type="submit"
              className="px-2 py-1 text-xs bg-[#4A90E2] text-white rounded font-semibold hover:bg-[#357ABD]"
            >
              Ok
            </button>
            <button
              type="button"
              onClick={() => {
                setRoomW(project.width);
                setRoomH(project.height);
                setIsEditingDim(false);
              }}
              className="px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 rounded"
            >
              X
            </button>
          </form>
        ) : (
          <div className="flex items-center gap-3">
            <div>
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Tamanho da Sala</div>
              <div className="font-mono text-sm text-[#2D3436] font-semibold">
                {project.width.toFixed(1)}m × {project.height.toFixed(1)}m <span className="text-xs text-gray-400">({(project.width * project.height).toFixed(0)}m²)</span>
              </div>
            </div>
            <button
              onClick={() => setIsEditingDim(true)}
              className="p-1.5 hover:bg-gray-200 rounded-lg text-gray-400 hover:text-[#4A90E2] transition-colors"
              title="Ajustar dimensões da sala de aula"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Right: Actions */}
      <div className="flex flex-wrap items-center gap-2 justify-end">
        {/* Project Mgmt */}
        <div className="flex items-center bg-white rounded-lg p-1 border border-gray-200 shadow-sm">
          <button
            onClick={onNewProject}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-600 hover:text-[#2D3436] hover:bg-gray-50 rounded-md font-medium transition-colors"
            title="Criar novo layout do zero"
          >
            <FilePlus className="w-3.5 h-3.5 text-[#4A90E2]" />
            <span className="hidden sm:inline">Novo</span>
          </button>
          <button
            onClick={onOpenProjectList}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-600 hover:text-[#2D3436] hover:bg-gray-50 rounded-md font-medium transition-colors"
            title="Abrir projetos salvos na nuvem"
          >
            <FolderOpen className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden sm:inline">Abrir</span>
          </button>
          <button
            onClick={onDuplicateProject}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-600 hover:text-[#2D3436] hover:bg-gray-50 rounded-md font-medium transition-colors"
            title="Duplicar este projeto para criar uma nova versão (Opção A/Opção B)"
          >
            <Copy className="w-3.5 h-3.5 text-cyan-600" />
            <span className="hidden lg:inline">Duplicar</span>
          </button>
          <button
            onClick={onClearLayout}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-md font-medium transition-colors"
            title="Remover todos os móveis do ambiente de uma só vez"
          >
            <Eraser className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden sm:inline">Limpar Layout</span>
          </button>
          <button
            onClick={onDeleteProject}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-md font-medium transition-colors"
            title="Excluir layout atual"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Excluir</span>
          </button>
        </div>

        {/* Undo / Redo Actions */}
        <div className="flex items-center bg-white rounded-lg p-1 border border-gray-200 shadow-sm">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-600 hover:text-[#2D3436] hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-transparent disabled:text-gray-400 rounded-md font-medium transition-colors cursor-pointer disabled:cursor-not-allowed"
            title="Desfazer alteração (Ctrl+Z)"
          >
            <Undo className="w-3.5 h-3.5 text-[#4A90E2]" />
            <span>Desfazer</span>
          </button>
          <div className="h-4 w-px bg-gray-200 mx-0.5" />
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-600 hover:text-[#2D3436] hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-transparent disabled:text-gray-400 rounded-md font-medium transition-colors cursor-pointer disabled:cursor-not-allowed"
            title="Refazer alteração (Ctrl+Y)"
          >
            <Redo className="w-3.5 h-3.5 text-emerald-600" />
            <span>Refazer</span>
          </button>
        </div>

        {/* Share & Export */}
        <div className="flex items-center gap-2">
          <button
            onClick={onShareProject}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-gray-50 text-gray-700 hover:text-[#2D3436] rounded-lg border border-gray-300 font-medium text-xs transition-all shadow-sm"
            title="Gerar link de compartilhamento em nuvem"
          >
            <Share2 className="w-4 h-4 text-purple-500" />
            <span>Compartilhar</span>
          </button>

          <button
            onClick={onExportPNG}
            className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-gray-50 text-gray-700 hover:text-[#2D3436] rounded-lg border border-gray-300 font-medium text-xs transition-all shadow-sm"
            title="Salvar layout como imagem de alta resolução"
          >
            <Download className="w-4 h-4 text-cyan-600" />
            <span>Imagem</span>
          </button>

          <button
            onClick={onPrintPDF}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#4A90E2] hover:bg-[#357ABD] text-white rounded-lg font-semibold text-xs shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
            title="Imprimir planta baixa ou Salvar como PDF para entregar ao designer"
          >
            <Printer className="w-4 h-4 stroke-[2.5]" />
            <span>Imprimir / PDF</span>
          </button>
        </div>
      </div>
    </header>
  );
};
