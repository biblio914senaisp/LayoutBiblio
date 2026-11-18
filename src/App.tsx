import React from "react";
import { 
  Header 
} from "./components/Header";
import { 
  Sidebar 
} from "./components/Sidebar";
import { 
  FloorPlanCanvas 
} from "./components/FloorPlanCanvas";
import { 
  ProjectListModal 
} from "./components/ProjectListModal";
import { 
  LibraryProject, 
  CatalogItem, 
  PlacedItem, 
  ProjectSummary 
} from "./types";
import { 
  Share2, 
  Check, 
  MapPin, 
  BookOpen, 
  Calendar, 
  Copy, 
  Maximize2,
  X,
  AlertTriangle,
  Plus
} from "lucide-react";

export default function App() {
  // Primary States
  const [project, setProject] = React.useState<LibraryProject | null>(null);
  const [projectsList, setProjectsList] = React.useState<ProjectSummary[]>([]);
  const [selectedItemId, setSelectedItemId] = React.useState<string | null>(null);

  // History Stack States for Undo/Redo
  const [undoStack, setUndoStack] = React.useState<LibraryProject[]>([]);
  const [redoStack, setRedoStack] = React.useState<LibraryProject[]>([]);

  // Snapshots the current project state and pushes to undoStack, clearing redoStack
  const pushToUndo = () => {
    if (!project) return;
    const snapshot = JSON.parse(JSON.stringify(project)) as LibraryProject;
    setUndoStack((prev) => [...prev, snapshot]);
    setRedoStack([]); // New action clears redo history
  };

  const handleUndo = () => {
    if (undoStack.length === 0 || !project) return;
    
    // The previous state is popped from undoStack
    const previous = undoStack[undoStack.length - 1];
    setUndoStack((prev) => prev.slice(0, -1));
    
    // Current state goes to redoStack
    const currentSnapshot = JSON.parse(JSON.stringify(project)) as LibraryProject;
    setRedoStack((prev) => [...prev, currentSnapshot]);
    
    // Set active state
    setProject(previous);
  };

  const handleRedo = () => {
    if (redoStack.length === 0 || !project) return;
    
    // The next state is popped from redoStack
    const next = redoStack[redoStack.length - 1];
    setRedoStack((prev) => prev.slice(0, -1));
    
    // Current state goes to undoStack
    const currentSnapshot = JSON.parse(JSON.stringify(project)) as LibraryProject;
    setUndoStack((prev) => [...prev, currentSnapshot]);
    
    // Set active state
    setProject(next);
  };

  // Keyboard Shortcuts (Ctrl+Z and Ctrl+Y/Ctrl+Shift+Z)
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === "z") {
        e.preventDefault();
        handleUndo();
      } else if (
        ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "z")
      ) {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undoStack, redoStack, project]);

  // Clear history stacks when changing/loading a different project to prevent cross-project history leaking
  const lastProjectIdRef = React.useRef<string | null>(null);
  React.useEffect(() => {
    if (project && project.id !== lastProjectIdRef.current) {
      setUndoStack([]);
      setRedoStack([]);
      lastProjectIdRef.current = project.id;
    }
  }, [project?.id]);
  
  // UI Panels
  const [isProjectModalOpen, setIsProjectModalOpen] = React.useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [isClearConfirmOpen, setIsClearConfirmOpen] = React.useState(false);
  const [isCloseConfirmOpen, setIsCloseConfirmOpen] = React.useState(false);
  const [projectToClose, setProjectToClose] = React.useState<LibraryProject | null>(null);
  const [openProjects, setOpenProjects] = React.useState<LibraryProject[]>([]);
  const [newProjectName, setNewProjectName] = React.useState("");
  const [saveStatus, setSaveStatus] = React.useState<"saved" | "saving" | "error" | "local">("saved");
  const [shareFeedback, setShareFeedback] = React.useState<string | null>(null);

  // Keep openProjects array synchronized with the current active project changes
  React.useEffect(() => {
    if (!project) return;
    setOpenProjects((prev) => {
      const exists = prev.some((p) => p.id === project.id);
      if (exists) {
        return prev.map((p) => (p.id === project.id ? project : p));
      } else {
        return [...prev, project];
      }
    });
  }, [project]);

  // Layout View Preferences
  const [showGrid, setShowGrid] = React.useState(true);
  const [snapToGrid, setSnapToGrid] = React.useState(true);
  const [showLabels, setShowLabels] = React.useState(true);

  // Helper to load list of available projects from the cloud
  const loadProjectsList = async () => {
    try {
      const res = await fetch("/api/projects");
      if (res.ok) {
        const list = await res.json();
        setProjectsList(list);
      }
    } catch (err) {
      console.error("Failed to load projects list from cloud:", err);
    }
  };

  // Initial Load: check query param first, then look for list
  React.useEffect(() => {
    const fetchInitialProject = async () => {
      // Check query parameter
      const params = new URLSearchParams(window.location.search);
      const projectId = params.get("project");

      if (projectId) {
        try {
          const res = await fetch(`/api/projects/${projectId}`);
          if (res.ok) {
            const proj = await res.json();
            setProject(proj);
            loadProjectsList();
            return;
          }
        } catch (err) {
          console.error("Failed to load specified project from cloud:", err);
        }
      }

      // Fallback: load first project in list, or create one
      try {
        const res = await fetch("/api/projects");
        if (res.ok) {
          const list = await res.json();
          setProjectsList(list);
          if (list.length > 0) {
            // Load the most recently updated project
            const sorted = [...list].sort(
              (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
            );
            const detailRes = await fetch(`/api/projects/${sorted[0].id}`);
            if (detailRes.ok) {
              const activeProj = await detailRes.json();
              setProject(activeProj);
              return;
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch projects list, loading defaults:", err);
      }

      // Final fallback if everything fails (local offline fallback template)
      const defaultProject: LibraryProject = {
        id: "exemplo-inicial",
        name: "Minha Biblioteca Escolar",
        description: "Layout de rascunho em planta baixa para compartilhar com o designer.",
        width: 14,
        height: 10,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        items: []
      };
      setProject(defaultProject);
    };

    fetchInitialProject();
  }, []);

  // Debounced Auto-saving implementation
  React.useEffect(() => {
    if (!project) return;

    setSaveStatus("saving");

    const timer = setTimeout(async () => {
      try {
        const res = await fetch("/api/projects", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(project),
        });

        if (res.ok) {
          setSaveStatus("saved");
          // Silently update summary list in state
          loadProjectsList();
        } else {
          setSaveStatus("error");
        }
      } catch (err) {
        console.error("Error autosaving project to cloud:", err);
        setSaveStatus("local");
        // Save fallback to localstorage
        localStorage.setItem(`library-floorplan-${project.id}`, JSON.stringify(project));
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [project]);

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-slate-800 p-6 font-sans">
        <div className="w-16 h-16 border-4 border-[#4A90E2] border-t-transparent rounded-full animate-spin mb-4" />
        <h3 className="text-lg font-bold text-slate-700">Carregando Planejador...</h3>
        <p className="text-xs text-slate-400 mt-1">Conectando ao banco de dados em nuvem...</p>
      </div>
    );
  }

  // EVENT HANDLERS

  // 1. Add Item to current room
  const handleAddItem = (catalogItem: CatalogItem) => {
    pushToUndo();
    // Put in center of room
    const targetX = Math.round((project.width / 2 - catalogItem.defaultWidth / 2) * 10) / 10;
    const targetY = Math.round((project.height / 2 - catalogItem.defaultHeight / 2) * 10) / 10;

    const newItem: PlacedItem = {
      id: `item-${Date.now()}`,
      type: catalogItem.id,
      name: catalogItem.name,
      x: Math.max(0, targetX),
      y: Math.max(0, targetY),
      width: catalogItem.defaultWidth,
      height: catalogItem.defaultHeight,
      rotation: 0,
      color: catalogItem.color,
    };

    setProject((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        items: [...prev.items, newItem],
      };
    });

    // Automatically select the newly created item
    setSelectedItemId(newItem.id);
  };

  // 2. Move item coordinate
  const handleMoveItem = (id: string, x: number, y: number) => {
    setProject((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        items: prev.items.map((it) => (it.id === id ? { ...it, x, y } : it)),
      };
    });
  };

  // 3. Update single item fields (width, height, label, color, rotation)
  const handleUpdateItem = (id: string, updatedFields: Partial<PlacedItem>) => {
    setProject((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        items: prev.items.map((it) => (it.id === id ? { ...it, ...updatedFields } : it)),
      };
    });
  };

  // 4. Duplicate selected item on canvas
  const handleDuplicateItem = () => {
    if (!selectedItemId) return;
    const source = project.items.find((it) => it.id === selectedItemId);
    if (!source) return;
    pushToUndo();

    // Offset position slightly so it doesn't overlap completely
    const offset = 0.4;
    const duplicated: PlacedItem = {
      ...source,
      id: `item-${Date.now()}-${Math.floor(Math.random() * 100)}`,
      x: Math.min(project.width - source.width, source.x + offset),
      y: Math.min(project.height - source.height, source.y + offset),
    };

    setProject((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        items: [...prev.items, duplicated],
      };
    });

    setSelectedItemId(duplicated.id);
  };

  // 5. Delete selected item
  const handleDeleteItem = () => {
    if (!selectedItemId) return;
    pushToUndo();
    setProject((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        items: prev.items.filter((it) => it.id !== selectedItemId),
      };
    });
    setSelectedItemId(null);
  };

  // 6. Update room outer dimensions
  const handleUpdateRoomDimensions = (w: number, h: number) => {
    pushToUndo();
    setProject((prev) => {
      if (!prev) return null;
      // Also shift items if they fall outside the new boundary
      const adjustedItems = prev.items.map((it) => {
        let newX = it.x;
        let newY = it.y;
        if (newX + it.width > w) {
          newX = Math.max(0, w - it.width);
        }
        if (newY + it.height > h) {
          newY = Math.max(0, h - it.height);
        }
        return { ...it, x: newX, y: newY };
      });

      return {
        ...prev,
        width: w,
        height: h,
        items: adjustedItems,
      };
    });
  };

  // 7. Open Create New Project Modal
  const handleNewProject = () => {
    setNewProjectName(`Layout Opção ${projectsList.length + 1}`);
    setIsCreateModalOpen(true);
  };

  // 7b. Confirm project creation
  const handleConfirmCreateProject = (name: string) => {
    const trimmedName = name.trim();
    if (!trimmedName) return;

    const newProj: LibraryProject = {
      id: `proj-${Date.now()}`,
      name: trimmedName,
      description: "Esboço de distribuição de móveis escolares em planta baixa.",
      width: 14,
      height: 10,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      items: [],
    };

    // Save current to database immediately & select
    setProject(newProj);
    setSelectedItemId(null);
    setIsCreateModalOpen(false);
  };

  // 8. Open list modal of saved projects
  const handleOpenProjectList = () => {
    loadProjectsList();
    setIsProjectModalOpen(true);
  };

  // 9. Load specified project
  const handleOpenProject = async (id: string) => {
    try {
      const res = await fetch(`/api/projects/${id}`);
      if (res.ok) {
        const loadedProj = await res.json();
        setProject(loadedProj);
        setSelectedItemId(null);
        setIsProjectModalOpen(false);

        // Update URL query parameter in-place without page refresh
        const newUrl = `${window.location.origin}${window.location.pathname}?project=${id}`;
        window.history.pushState({ path: newUrl }, "", newUrl);
      }
    } catch (err) {
      console.error("Error opening project:", err);
    }
  };

  // 10. Delete specified project
  const handleDeleteProject = async (id: string) => {
    try {
      const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
      if (res.ok) {
        // Reload list
        loadProjectsList();
        
        // Remove from open tabs
        setOpenProjects((prev) => prev.filter((p) => p.id !== id));
        
        // If the deleted project was the active one, load fallback
        if (project.id === id) {
          // fetch first available
          const listRes = await fetch("/api/projects");
          if (listRes.ok) {
            const list = await listRes.json();
            if (list.length > 0) {
              handleOpenProject(list[0].id);
            } else {
              // Completely blank slate
              const blank: LibraryProject = {
                id: "exemplo-inicial",
                name: "Minha Biblioteca Escolar",
                description: "Layout de rascunho em planta baixa para compartilhar com o designer.",
                width: 12,
                height: 10,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                items: [],
              };
              setProject(blank);
            }
          }
        }
      }
    } catch (err) {
      console.error("Error deleting project:", err);
    }
  };

  // 11. Duplicate current active project to create custom options (A/B testing)
  const handleDuplicateProject = () => {
    if (!project) return;
    const duplicatedProj: LibraryProject = {
      ...project,
      id: `proj-${Date.now()}`,
      name: `${project.name} - Cópia`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      items: project.items.map((it) => ({ ...it })),
    };

    setProject(duplicatedProj);
    setSelectedItemId(null);
  };

  // 12. Delete active project shortcut
  const handleDeleteActiveProject = () => {
    if (project.id === "exemplo-inicial") {
      alert("O layout padrão de exemplo não pode ser excluído.");
      return;
    }
    if (window.confirm(`Tem certeza que deseja excluir o layout atual "${project.name}"?`)) {
      handleDeleteProject(project.id);
    }
  };

  // 12b. Clear layout (remove all items with security confirmation modal)
  const handleClearLayout = () => {
    if (!project) return;
    if (project.items.length === 0) {
      alert("O ambiente já está vazio!");
      return;
    }
    setIsClearConfirmOpen(true);
  };

  const handleConfirmClearLayout = () => {
    if (!project) return;
    pushToUndo();
    setProject((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        items: [],
      };
    });
    setSelectedItemId(null);
    setIsClearConfirmOpen(false);
  };

  // 12c. Tab close handlers with save option modal
  const handleTabCloseRequest = (proj: LibraryProject, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid switching tabs when clicking X
    setProjectToClose(proj);
    setIsCloseConfirmOpen(true);
  };

  const handleConfirmCloseWithSave = async () => {
    if (!projectToClose) return;
    setSaveStatus("saving");
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(projectToClose),
      });
      if (res.ok) {
        setSaveStatus("saved");
        loadProjectsList();
      } else {
        setSaveStatus("error");
      }
    } catch (err) {
      console.error("Error saving project before closing:", err);
      setSaveStatus("error");
    }

    const targetId = projectToClose.id;
    setOpenProjects((prev) => {
      const filtered = prev.filter((p) => p.id !== targetId);
      if (project?.id === targetId) {
        if (filtered.length > 0) {
          setTimeout(() => setProject(filtered[filtered.length - 1]), 0);
        } else {
          const blank: LibraryProject = {
            id: "exemplo-inicial",
            name: "Minha Biblioteca Escolar",
            description: "Layout de rascunho em planta baixa para compartilhar com o designer.",
            width: 14,
            height: 10,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            items: [],
          };
          setTimeout(() => setProject(blank), 0);
        }
      }
      return filtered;
    });

    setIsCloseConfirmOpen(false);
    setProjectToClose(null);
  };

  const handleConfirmCloseWithoutSave = () => {
    if (!projectToClose) return;
    const targetId = projectToClose.id;
    
    setOpenProjects((prev) => {
      const filtered = prev.filter((p) => p.id !== targetId);
      if (project?.id === targetId) {
        if (filtered.length > 0) {
          setTimeout(() => setProject(filtered[filtered.length - 1]), 0);
        } else {
          const blank: LibraryProject = {
            id: "exemplo-inicial",
            name: "Minha Biblioteca Escolar",
            description: "Layout de rascunho em planta baixa para compartilhar com o designer.",
            width: 14,
            height: 10,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            items: [],
          };
          setTimeout(() => setProject(blank), 0);
        }
      }
      return filtered;
    });

    setIsCloseConfirmOpen(false);
    setProjectToClose(null);
  };

  // 13. Export canvas as PNG Image
  const handleExportPNG = () => {
    const svgElement = document.getElementById("floorplan-svg");
    if (!svgElement) return;

    try {
      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(svgElement);
      const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
      const blobURL = window.URL.createObjectURL(svgBlob);

      const image = new Image();
      image.onload = () => {
        const canvas = document.createElement("canvas");
        const scaleMultiplier = 3; // Make it extra high resolution for printing/sharing
        
        canvas.width = svgElement.clientWidth * scaleMultiplier;
        canvas.height = svgElement.clientHeight * scaleMultiplier;

        const context = canvas.getContext("2d");
        if (context) {
          // White background
          context.fillStyle = "#ffffff";
          context.fillRect(0, 0, canvas.width, canvas.height);
          
          // Draw high quality image
          context.drawImage(image, 0, 0, canvas.width, canvas.height);

          // Trigger download
          const pngURL = canvas.toDataURL("image/png");
          const downloadLink = document.createElement("a");
          downloadLink.href = pngURL;
          downloadLink.download = `${project.name.toLowerCase().replace(/\s+/g, "_")}_planta_baixa.png`;
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
        }
        window.URL.revokeObjectURL(blobURL);
      };
      image.src = blobURL;
    } catch (err) {
      console.error("Failed to export as PNG:", err);
      alert("Erro ao exportar imagem. Tente usar a função 'Imprimir / PDF' que é altamente compatível.");
    }
  };

  // 14. Export to PDF via native browser printer print stylesheet
  const handlePrintPDF = () => {
    window.print();
  };

  // 15. Share link with colleague / interior designer
  const handleShareProject = () => {
    const shareUrl = `${window.location.origin}/?project=${project.id}`;
    
    // Copy to Clipboard
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        setShareFeedback("Link copiado! Envie para o designer de interiores por WhatsApp ou E-mail.");
        setTimeout(() => setShareFeedback(null), 6000);
      })
      .catch((err) => {
        console.error("Could not copy share link:", err);
        // Fallback prompt so they can copy manually
        window.prompt("Copie o link abaixo para compartilhar este layout:", shareUrl);
      });
  };

  return (
    <div className="h-screen max-h-screen bg-slate-100 flex flex-col font-sans text-slate-800 antialiased overflow-hidden">
      
      {/* Dynamic Share Banner */}
      {shareFeedback && (
        <div className="no-print bg-green-600 text-white px-6 py-2.5 font-bold text-xs flex items-center justify-between shadow-md border-b border-green-700 transition-all animate-bounce">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 stroke-[3]" />
            <span>{shareFeedback}</span>
          </div>
          <button 
            onClick={() => setShareFeedback(null)} 
            className="p-1 hover:bg-green-700 rounded text-green-100 hover:text-white font-bold"
          >
            Fechar
          </button>
        </div>
      )}

      {/* Main Header */}
      <Header
        project={project}
        saveStatus={saveStatus}
        onNewProject={handleNewProject}
        onOpenProjectList={handleOpenProjectList}
        onDuplicateProject={handleDuplicateProject}
        onDeleteProject={handleDeleteActiveProject}
        onClearLayout={handleClearLayout}
        onExportPNG={handleExportPNG}
        onPrintPDF={handlePrintPDF}
        onUpdateRoomDimensions={handleUpdateRoomDimensions}
        onShareProject={handleShareProject}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={undoStack.length > 0}
        canRedo={redoStack.length > 0}
      />

      {/* Open Layouts Tabs */}
      <div className="no-print bg-slate-900 border-b border-slate-800 flex items-center px-4 overflow-x-auto scrollbar-none gap-2 h-12 shrink-0">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {openProjects.map((p) => {
            const isActive = project?.id === p.id;
            return (
              <div
                key={p.id}
                onClick={() => {
                  setProject(p);
                  setSelectedItemId(null);
                  // Update URL query parameter without page refresh
                  const newUrl = `${window.location.origin}${window.location.pathname}?project=${p.id}`;
                  window.history.pushState({ path: newUrl }, "", newUrl);
                }}
                className={`group flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all select-none border whitespace-nowrap ${
                  isActive
                    ? "bg-[#4A90E2]/15 text-[#4A90E2] border-[#4A90E2]/30 shadow-sm shadow-[#4A90E2]/5"
                    : "bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-900"
                }`}
              >
                <span className="truncate max-w-[150px] font-sans">{p.name}</span>
                <button
                  type="button"
                  onClick={(e) => handleTabCloseRequest(p, e)}
                  className="p-0.5 rounded hover:bg-slate-800 hover:text-rose-400 text-slate-500 transition-all cursor-pointer flex items-center justify-center ml-1"
                  title="Fechar aba"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}

          {/* New Tab Button */}
          <button
            onClick={handleNewProject}
            className="flex items-center justify-center p-1.5 rounded-lg border border-slate-800 bg-slate-950 hover:bg-slate-900 hover:border-slate-700 text-[#4A90E2] hover:text-blue-400 transition-all cursor-pointer shadow-sm"
            title="Criar nova aba de layout"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Printable Sheet Header (hidden on screen, visible only during browser print) */}
      <div id="print-only-header" className="p-6 border-b border-slate-300">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold font-sans text-slate-900 tracking-tight flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-[#4A90E2]" />
              Planta Baixa: {project.name}
            </h1>
            {project.description && (
              <p className="text-sm text-slate-500 mt-1">
                {project.description}
              </p>
            )}
          </div>
          <div className="text-right">
            <div className="text-xs font-mono font-bold text-slate-600 uppercase">Dimensões da Biblioteca</div>
            <div className="text-lg font-mono font-black text-slate-900">
              {project.width.toFixed(1)}m × {project.height.toFixed(1)}m
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              Área Total: {(project.width * project.height).toFixed(0)}m²
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mt-4 bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs">
          <div>
            <span className="font-bold text-slate-700">Responsável:</span> Bibliotecária Escolar
          </div>
          <div className="text-right">
            <span className="font-bold text-slate-700">Data de Geração:</span> {new Date().toLocaleDateString("pt-BR")}
          </div>
        </div>
        <div className="text-[10px] text-slate-400 mt-3 italic">
          * Este projeto de layout é um rascunho de planta baixa indicativo gerado em nuvem para servir de referência a arquitetos e designers de interiores.
        </div>
      </div>

      {/* Primary Workspace Panel */}
      <div className="flex-1 flex flex-col-reverse lg:flex-row min-h-0 relative">
        {/* Sidebar Controls */}
        <Sidebar
          selectedItem={project.items.find(it => it.id === selectedItemId) || null}
          onAddItem={handleAddItem}
          onUpdateSelectedItem={(updated) => selectedItemId && handleUpdateItem(selectedItemId, updated)}
          onDeleteSelectedItem={handleDeleteItem}
          onDuplicateSelectedItem={handleDuplicateItem}
          onStartChanging={pushToUndo}
          showGrid={showGrid}
          onToggleGrid={() => setShowGrid(!showGrid)}
          snapToGrid={snapToGrid}
          onToggleSnap={() => setSnapToGrid(!snapToGrid)}
          showLabels={showLabels}
          onToggleLabels={() => setShowLabels(!showLabels)}
        />

        {/* Interactive Floor Plan Canvas */}
        <FloorPlanCanvas
          items={project.items}
          roomWidth={project.width}
          roomHeight={project.height}
          selectedItemId={selectedItemId}
          onSelectItem={setSelectedItemId}
          onMoveItem={handleMoveItem}
          onUpdateItem={handleUpdateItem}
          onStartDrag={pushToUndo}
          showGrid={showGrid}
          snapToGrid={snapToGrid}
          showLabels={showLabels}
        />
      </div>

      {/* Project Database Selector Modal */}
      <ProjectListModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        onOpenProject={handleOpenProject}
        onDeleteProject={handleDeleteProject}
        projects={projectsList}
      />

      {/* Create New Project Dialog Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 no-print">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            {/* Header */}
            <div className="bg-[#4A90E2] text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-white stroke-[2.5]" />
                <h3 className="font-sans font-semibold text-lg">Criar Novo Layout</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 hover:bg-[#357ABD] rounded-lg text-blue-100 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleConfirmCreateProject(newProjectName);
              }}
              className="p-6 space-y-4"
            >
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Nome do Projeto
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="Ex: Layout do Bloco A, Nova Ala de Leitura"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#4A90E2] font-sans font-medium"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg text-xs transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#4A90E2] hover:bg-[#357ABD] text-white font-semibold rounded-lg text-xs transition-colors cursor-pointer"
                >
                  Criar Layout
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Clear Layout Confirmation Modal */}
      {isClearConfirmOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 no-print">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            {/* Header */}
            <div className="bg-amber-500 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-white stroke-[2.5]" />
                <h3 className="font-sans font-semibold text-lg">Limpar Layout</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsClearConfirmOpen(false)}
                className="p-1 hover:bg-amber-600 rounded-lg text-amber-100 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-600 font-sans leading-relaxed">
                Você tem certeza de que deseja remover todos os <strong className="text-slate-900">{project?.items.length} móveis</strong> do ambiente?
              </p>
              <p className="text-xs text-rose-500 font-medium bg-rose-50 border border-rose-100 rounded-lg p-3">
                ⚠️ Essa ação removerá toda a disposição atual dos móveis. Você pode usar o botão "Desfazer" para reverter caso mude de ideia.
              </p>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsClearConfirmOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg text-xs transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmClearLayout}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg text-xs transition-colors cursor-pointer shadow-sm"
                >
                  Sim, Limpar Tudo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Save On Close Confirmation Modal */}
      {isCloseConfirmOpen && projectToClose && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 no-print">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            {/* Header */}
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500 stroke-[2.5]" />
                <h3 className="font-sans font-semibold text-base">Fechar Aba do Layout</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsCloseConfirmOpen(false);
                  setProjectToClose(null);
                }}
                className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-600 font-sans leading-relaxed">
                Deseja salvar as alterações no layout <strong className="text-slate-900">"{projectToClose.name}"</strong> antes de fechar a aba?
              </p>
              <p className="text-xs text-slate-400 font-sans leading-relaxed">
                Ao fechar, este layout deixará de ser exibido nas abas abertas da sessão, mas você ainda poderá abri-lo novamente pelo menu de projetos.
              </p>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsCloseConfirmOpen(false);
                    setProjectToClose(null);
                  }}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg text-xs transition-colors cursor-pointer text-center"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmCloseWithoutSave}
                  className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 font-semibold rounded-lg text-xs transition-colors cursor-pointer text-center border border-rose-100"
                >
                  Fechar sem Salvar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmCloseWithSave}
                  className="px-4 py-2 bg-[#4A90E2] hover:bg-blue-600 text-white font-semibold rounded-lg text-xs transition-colors cursor-pointer text-center shadow-sm"
                >
                  Salvar e Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
