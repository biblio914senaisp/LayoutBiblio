import React from "react";
import { Folder, Trash2, Calendar, FileText, Check, X, Eye } from "lucide-react";
import { ProjectSummary } from "../types";

interface ProjectListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenProject: (id: string) => void;
  onDeleteProject: (id: string) => void;
  projects: ProjectSummary[];
}

export const ProjectListModal: React.FC<ProjectListModalProps> = ({
  isOpen,
  onClose,
  onOpenProject,
  onDeleteProject,
  projects,
}) => {
  if (!isOpen) return null;

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full flex flex-col max-h-[85vh] overflow-hidden border border-slate-200">
        
        {/* Modal Header */}
        <div className="bg-[#4A90E2] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Folder className="w-5 h-5 text-white stroke-[2.5]" />
            <h3 className="font-sans font-semibold text-base md:text-lg tracking-tight">Projetos de Layout Salvos na Nuvem</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-[#357ABD] rounded-lg text-blue-100 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <p className="text-xs text-slate-500 leading-relaxed">
            Seus projetos são guardados na nuvem e atualizados automaticamente. Abaixo estão todas as versões e layouts disponíveis da sua biblioteca escolar.
          </p>

          <div className="space-y-3">
            {projects.length > 0 ? (
              projects.map((proj) => (
                <div 
                  key={proj.id}
                  className="p-4 border border-slate-200 rounded-xl hover:border-[#4A90E2] hover:bg-[#4A90E2]/5 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5">
                      <span className="font-sans font-bold text-slate-800 text-sm md:text-base block truncate">
                        {proj.name}
                      </span>
                      <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-mono">
                        {proj.width}m × {proj.height}m
                      </span>
                    </div>

                    {proj.description && (
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                        {proj.description}
                      </p>
                    )}

                    {/* Metadata */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-slate-400 font-medium mt-2">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-300" />
                        Atualizado em: {formatDate(proj.updatedAt)}
                      </span>
                      <span className="flex items-center gap-1 font-semibold text-slate-500">
                        <FileText className="w-3 h-3 text-slate-300" />
                        {proj.itemCount} {proj.itemCount === 1 ? "móvel adicionado" : "móveis adicionados"}
                      </span>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <button
                      onClick={() => onOpenProject(proj.id)}
                      className="flex items-center gap-1.5 px-3.5 py-2 bg-[#4A90E2] hover:bg-[#357ABD] text-white rounded-lg font-semibold text-xs transition-all cursor-pointer"
                      title="Abrir este projeto"
                    >
                      <Eye className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Abrir</span>
                    </button>

                    {proj.id !== "exemplo-inicial" && (
                      <button
                        onClick={() => {
                          if (window.confirm(`Deseja mesmo excluir o layout "${proj.name}"?`)) {
                            onDeleteProject(proj.id);
                          }
                        }}
                        className="p-2 hover:bg-rose-50 rounded-lg text-rose-600 transition-colors cursor-pointer"
                        title="Excluir projeto permanentemente"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-xl text-slate-400">
                <Folder className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                <p className="text-sm font-semibold">Nenhum projeto salvo na nuvem</p>
                <p className="text-xs text-slate-400 mt-1">Crie um novo projeto no topo da página para começar!</p>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3.5 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg text-xs transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
