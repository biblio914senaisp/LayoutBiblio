import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middlewares
  app.use(express.json({ limit: "10mb" }));

  // Path to save data
  const DATA_DIR = path.join(process.cwd(), "data");
  const PROJECTS_FILE = path.join(DATA_DIR, "projects.json");

  // Ensure data folder exists and has projects.json
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  // Load projects helper
  const getProjects = () => {
    try {
      if (fs.existsSync(PROJECTS_FILE)) {
        const fileContent = fs.readFileSync(PROJECTS_FILE, "utf-8");
        return JSON.parse(fileContent);
      }
    } catch (err) {
      console.error("Error reading projects file:", err);
    }
    // Return seed data if empty, so the user has examples immediately!
    const defaultProjects = [
      {
        id: "exemplo-inicial",
        name: "Layout Inicial da Biblioteca",
        description: "Um layout inicial de demonstração da biblioteca escolar com móveis básicos.",
        width: 14,
        height: 10,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        items: [
          // Basic default layout items to help the user get started
          {
            id: "m-1",
            type: "mesa_atendimento",
            name: "Balcão de Atendimento",
            x: 2.0,
            y: 2.0,
            width: 1.8,
            height: 0.9,
            rotation: 0,
            color: "#d97706"
          },
          {
            id: "m-2",
            type: "estante_livros",
            name: "Estante Alta de Livros",
            x: 1.0,
            y: 5.0,
            width: 2.0,
            height: 0.45,
            rotation: 90,
            color: "#854d0e"
          },
          {
            id: "m-3",
            type: "estante_livros",
            name: "Estante Alta de Livros",
            x: 1.6,
            y: 5.0,
            width: 2.0,
            height: 0.45,
            rotation: 90,
            color: "#854d0e"
          },
          {
            id: "m-4",
            type: "mesa_redonda",
            name: "Mesa Redonda com Cadeiras",
            x: 6.5,
            y: 3.5,
            width: 1.6,
            height: 1.6,
            rotation: 0,
            color: "#1e3a8a"
          },
          {
            id: "m-5",
            type: "sofa_modular",
            name: "Sofá Modular Colorido (Amarelo e Azul)",
            x: 11.0,
            y: 2.0,
            width: 2.2,
            height: 0.8,
            rotation: 0,
            color: "#eab308"
          },
          {
            id: "m-6",
            type: "porta",
            name: "Porta de Entrada",
            x: 0.0,
            y: 1.5,
            width: 0.9,
            height: 0.1,
            rotation: 90,
            color: "#374151"
          },
          {
            id: "m-7",
            type: "janela",
            name: "Janela de Vidro",
            x: 7.0,
            y: 0.0,
            width: 1.5,
            height: 0.1,
            rotation: 0,
            color: "#0284c7"
          }
        ]
      }
    ];
    fs.writeFileSync(PROJECTS_FILE, JSON.stringify(defaultProjects, null, 2), "utf-8");
    return defaultProjects;
  };

  const saveProjects = (projects: any) => {
    try {
      fs.writeFileSync(PROJECTS_FILE, JSON.stringify(projects, null, 2), "utf-8");
    } catch (err) {
      console.error("Error writing projects file:", err);
    }
  };

  // API Endpoints
  // 1. Get all projects
  app.get("/api/projects", (req, res) => {
    const projects = getProjects();
    // Return light info for selection list
    const projectList = projects.map((p: any) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      width: p.width,
      height: p.height,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      itemCount: p.items ? p.items.length : 0
    }));
    res.json(projectList);
  });

  // 2. Get specific project
  app.get("/api/projects/:id", (req, res) => {
    const projects = getProjects();
    const project = projects.find((p: any) => p.id === req.params.id);
    if (project) {
      res.json(project);
    } else {
      res.status(404).json({ error: "Projeto não encontrado" });
    }
  });

  // 3. Save or update project
  app.post("/api/projects", (req, res) => {
    const projectData = req.body;
    if (!projectData.id || !projectData.name) {
      return res.status(400).json({ error: "Dados inválidos: ID e nome são obrigatórios" });
    }

    const projects = getProjects();
    const index = projects.findIndex((p: any) => p.id === projectData.id);

    const updatedProject = {
      ...projectData,
      updatedAt: new Date().toISOString()
    };

    if (index >= 0) {
      projects[index] = updatedProject;
    } else {
      updatedProject.createdAt = new Date().toISOString();
      projects.push(updatedProject);
    }

    saveProjects(projects);
    res.json({ success: true, project: updatedProject });
  });

  // 4. Delete project
  app.delete("/api/projects/:id", (req, res) => {
    const projects = getProjects();
    const filtered = projects.filter((p: any) => p.id !== req.params.id);
    if (projects.length === filtered.length) {
      return res.status(404).json({ error: "Projeto não encontrado" });
    }
    saveProjects(filtered);
    res.json({ success: true });
  });

  // Vite Integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    // Serve index.html for SPA router on any unmatched endpoint
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
