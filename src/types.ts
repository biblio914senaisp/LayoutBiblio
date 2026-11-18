/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface CatalogItem {
  id: string;
  name: string;
  category: "mesas" | "assentos" | "estantes" | "estruturas" | "outros";
  defaultWidth: number; // in meters
  defaultHeight: number; // in meters
  color: string;
  description: string;
  iconName: string; // name of Lucide icon to display
  symbolType: "rect" | "circle" | "l_shape" | "modular_sofa" | "window" | "door" | "double_shelf" | "study_desk";
}

export interface PlacedItem {
  id: string;
  type: string; // CatalogItem.id
  name: string;
  x: number; // coordinate x in meters from top-left of the room
  y: number; // coordinate y in meters from top-left of the room
  width: number; // in meters
  height: number; // in meters
  rotation: number; // in degrees (0, 90, 180, 270, or arbitrary)
  color: string;
  label?: string; // custom annotation by user
}

export interface LibraryProject {
  id: string;
  name: string;
  description?: string;
  width: number; // room width in meters
  height: number; // room height in meters
  createdAt: string;
  updatedAt: string;
  items: PlacedItem[];
}

export interface ProjectSummary {
  id: string;
  name: string;
  description?: string;
  width: number;
  height: number;
  createdAt: string;
  updatedAt: string;
  itemCount: number;
}

export const FURNITURE_CATALOG: CatalogItem[] = [
  // Estruturas
  {
    id: "porta",
    name: "Porta de Entrada",
    category: "estruturas",
    defaultWidth: 0.9,
    defaultHeight: 0.15,
    color: "#374151", // Charcoal
    description: "Porta padrão de passagem de 90cm. Pode ser rotacionada e posicionada nas paredes.",
    iconName: "LogOut",
    symbolType: "door"
  },
  {
    id: "janela",
    name: "Janela de Vidro",
    category: "estruturas",
    defaultWidth: 1.5,
    defaultHeight: 0.15,
    color: "#0ea5e9", // Sky blue
    description: "Janela de vidro para iluminação natural. Posicionar nas bordas do layout.",
    iconName: "Square",
    symbolType: "window"
  },
  {
    id: "mural_avisos",
    name: "Mural de Avisos",
    category: "estruturas",
    defaultWidth: 2.0,
    defaultHeight: 0.1,
    color: "#15803d", // Green corkboard
    description: "Mural de cortiça para recados, notícias e trabalhos escolares.",
    iconName: "Image",
    symbolType: "rect"
  },

  // Mesas e Atendimento
  {
    id: "balcao_atendimento",
    name: "Balcão de Atendimento",
    category: "mesas",
    defaultWidth: 1.8,
    defaultHeight: 0.9,
    color: "#d97706", // Amber wood
    description: "Balcão principal da bibliotecária para recepção, devolução e empréstimo de livros.",
    iconName: "UserCheck",
    symbolType: "study_desk"
  },
  {
    id: "mesa_canto_l",
    name: "Mesa de Canto em L",
    category: "mesas",
    defaultWidth: 1.4,
    defaultHeight: 1.4,
    color: "#ca8a04", // Darker amber wood
    description: "Mesa angular em formato de L para cantos ou estações administrativas.",
    iconName: "CornerDownRight",
    symbolType: "l_shape"
  },
  {
    id: "mesa_redonda",
    name: "Mesa Redonda (4 Cadeiras)",
    category: "mesas",
    defaultWidth: 1.6,
    defaultHeight: 1.6,
    color: "#1e3a8a", // Dark Blue
    description: "Mesa redonda ideal para grupos de estudo com representação de 4 cadeiras integradas.",
    iconName: "CircleDot",
    symbolType: "circle"
  },
  {
    id: "mesa_toalha_rosa",
    name: "Mesa Redonda com Toalha Vermelha",
    category: "mesas",
    defaultWidth: 1.5,
    defaultHeight: 1.5,
    color: "#db2777", // Deep pink
    description: "Mesa de atividades lúdicas ou exposição com toalha chamativa vermelha/rosa.",
    iconName: "CircleDot",
    symbolType: "circle"
  },
  {
    id: "mesa_oval_jogos",
    name: "Mesa Oval de Jogos (Xadrez)",
    category: "mesas",
    defaultWidth: 2.0,
    defaultHeight: 1.1,
    color: "#4b5563", // Gray board layout
    description: "Mesa de estudos e jogos de tabuleiro (xadrez) com cadeiras representadas.",
    iconName: "Grid",
    symbolType: "circle"
  },
  {
    id: "cabine_estudos",
    name: "Cabine de Estudos Individual",
    category: "mesas",
    defaultWidth: 1.0,
    defaultHeight: 0.8,
    color: "#b45309", // Partition color wood
    description: "Cabine individual com divisórias laterais para estudo silencioso e concentrado.",
    iconName: "Lock",
    symbolType: "study_desk"
  },
  {
    id: "estacao_computador",
    name: "Estação de Computador Individual",
    category: "mesas",
    defaultWidth: 1.1,
    defaultHeight: 0.9,
    color: "#b45309",
    description: "Mesa compacta com computador para pesquisa e acesso ao catálogo da biblioteca.",
    iconName: "Monitor",
    symbolType: "study_desk"
  },

  // Estantes e Organizadores
  {
    id: "estante_livros",
    name: "Estante Alta de Livros",
    category: "estantes",
    defaultWidth: 2.0,
    defaultHeight: 0.45,
    color: "#854d0e", // Deep brown
    description: "Estante de livros alta para livros gerais. Pode ser colocada de costas para as paredes ou em fileiras dupla-face.",
    iconName: "BookOpen",
    symbolType: "rect"
  },
  {
    id: "estante_livros_baixa",
    name: "Estante Baixa de Livros",
    category: "estantes",
    defaultWidth: 1.8,
    defaultHeight: 0.45,
    color: "#a16207", // Lighter wood
    description: "Estante mais baixa para livros infantis ou gibis, facilitando a visibilidade no ambiente.",
    iconName: "Book",
    symbolType: "rect"
  },
  {
    id: "estante_computadores",
    name: "Estante Dupla com Computadores",
    category: "estantes",
    defaultWidth: 2.2,
    defaultHeight: 0.9,
    color: "#713f12", // Reddish brown
    description: "Estante de livros dupla com bancada na parte superior abrigando computadores para os alunos.",
    iconName: "LayoutGrid",
    symbolType: "double_shelf"
  },
  {
    id: "estante_gibis",
    name: "Estante de Gibis/Revistas",
    category: "estantes",
    defaultWidth: 1.2,
    defaultHeight: 0.45,
    color: "#ca8a04",
    description: "Estante especial inclinada para revistas e gibis de fácil acesso.",
    iconName: "BookOpen",
    symbolType: "rect"
  },
  {
    id: "expositor_cds",
    name: "Expositor Giratório de Mídias",
    category: "estantes",
    defaultWidth: 0.6,
    defaultHeight: 0.6,
    color: "#854d0e",
    description: "Expositor vertical giratório de CDs, DVDs, mídias ou pequenos livretos.",
    iconName: "Disc",
    symbolType: "circle"
  },

  // Assentos
  {
    id: "sofa_modular",
    name: "Sofá Modular Colorido (Amarelo/Azul)",
    category: "assentos",
    defaultWidth: 2.2,
    defaultHeight: 0.8,
    color: "#eab308", // Main yellow (with secondary blue)
    description: "Sofá modular estofado super aconchegante com blocos coloridos alternados de azul e amarelo.",
    iconName: "Armchair",
    symbolType: "modular_sofa"
  },

  // Outros móveis
  {
    id: "armario_escaninho",
    name: "Armário de Escaninhos (Lockers)",
    category: "outros",
    defaultWidth: 1.5,
    defaultHeight: 0.5,
    color: "#4b5563", // Steel gray
    description: "Armário de aço com escaninhos numerados para os alunos guardarem mochilas e casacos.",
    iconName: "Grid",
    symbolType: "rect"
  },
  {
    id: "arquivo_aco",
    name: "Arquivo de Aço Vertical",
    category: "outros",
    defaultWidth: 0.6,
    defaultHeight: 0.6,
    color: "#6b7280", // Gray steel
    description: "Arquivo de metal alto com 4 gavetas para pastas suspensas e fichas administrativas.",
    iconName: "FolderOpen",
    symbolType: "rect"
  },
  {
    id: "lousa_teclado",
    name: "Lousa Branca com Teclado",
    category: "outros",
    defaultWidth: 2.0,
    defaultHeight: 0.8,
    color: "#f8fafc", // White
    description: "Lousa de vidro/metal com teclado eletrônico musical e cadeira integrada de ensaio.",
    iconName: "Music",
    symbolType: "double_shelf"
  },
  {
    id: "gaveteiro_escritorio",
    name: "Gaveteiro de Escritório",
    category: "outros",
    defaultWidth: 0.5,
    defaultHeight: 0.6,
    color: "#9ca3af",
    description: "Pequeno arquivo de madeira ou metal com rodízios para apoiar impressora ou papéis.",
    iconName: "Layers",
    symbolType: "rect"
  }
];
