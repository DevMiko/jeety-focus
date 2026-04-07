// ─── Jeety Focus Mock Data ────────────────────────────────────────────────────

export type Role = 'artisan' | 'soustraitant' | 'ouvrier';
export type DossierType = 'PAC' | 'BALLON' | 'ISOLATION' | 'CHAUDIERE';
export type PhotoStatus = 'done' | 'pending' | 'locked';
export type MemberStatus = 'active' | 'pending';

export interface Dossier {
  id: string;
  ref: string;
  clientName: string;
  address: string;
  phone: string;
  types: DossierType[];
  avantStatus: PhotoStatus;
  apresStatus: PhotoStatus;
  avantRef?: string;
  avantDate?: string;
  assignedTo?: string;
  donneurOrdre?: string;
}

export interface RapportLibre {
  id: string;
  ref: string;
  clientName: string;
  address: string;
  types: DossierType[];
  phase: 'Avant' | 'Après';
  date: string;
  via?: string;
  assignedTo?: string;
}

export interface TeamMember {
  id: string;
  firstName: string;
  lastName: string;
  initials: string;
  phone: string;
  status: MemberStatus;
  hasJeety: boolean;
  rapportCount?: number;
}

export interface SousTraitant {
  id: string;
  name: string;
  siret: string;
  hasJeety: boolean;
  rapportCount?: number;
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  initials: string;
  company: string;
  siret?: string;
  email: string;
  phone?: string;
  role: Role;
  employeur?: string;
  location?: string;
  lang?: string;
  status?: string;
  dateLastLogin?: string;
  idProfil?: number;
  idCompany?: number;
}

// ─── Team types ──────────────────────────────────────────────────────────────

export interface ApiOuvrier {
  id_ouvrier: number;
  id_user: number | null;
  nom: string;
  prenom: string;
  telephone: string;
  status: 'active' | 'pending';
  has_jeety: number;
  email: string;
}

export interface ApiSousTraitant {
  id_sous_traitant: number;
  id_user: number | null;
  company_name: string;
  siret: string;
  etat_administratif: string;
  has_jeety: number;
  rapport_count: number;
}

export interface ApiRapport {
  id_rapport: number;
  id_dossier: number | null;
  reference_rapport: string;
  client_name: string;
  client_address: string;
  types: string[];
  phase: 'Avant' | 'Après';
  statut: 'brouillon' | 'soumis' | 'valide';
  notes: string;
  assigned_to: number | null;
  via: string | null;
  date_creation: string;
}

// ─── Users ───────────────────────────────────────────────────────────────────

export const USERS: Record<Role, UserProfile> = {
  artisan: {
    firstName: 'Jean',
    lastName: 'DUPONT',
    initials: 'JD',
    company: 'Artisan RGE',
    siret: '123 456 789 00012',
    email: 'jean.dupont@artisan.fr',
    role: 'artisan',
  },
  soustraitant: {
    firstName: 'Pierre',
    lastName: 'MARTIN',
    initials: 'PM',
    company: 'Isol Therm SARL',
    siret: '456 789 123 00056',
    email: 'pierre.martin@isoltherm.fr',
    role: 'soustraitant',
  },
  ouvrier: {
    firstName: 'Lucas',
    lastName: 'MARTIN',
    initials: 'LM',
    company: 'Isol Therm SARL',
    email: 'lucas.martin@email.com',
    role: 'ouvrier',
    employeur: 'Dupont Énergies',
  },
};

// ─── Dossiers Artisan ────────────────────────────────────────────────────────

export const DOSSIERS_ARTISAN: Dossier[] = [
  {
    id: '1',
    ref: 'CEE-2025-00847',
    clientName: 'Jean DUPONT',
    address: '12 rue des Lilas, 75011 Paris',
    phone: '06 12 34 56 78',
    types: ['PAC', 'BALLON'],
    avantStatus: 'pending',
    apresStatus: 'locked',
    assignedTo: 'Lucas M.',
  },
  {
    id: '2',
    ref: 'CEE-2025-00852',
    clientName: 'Marie MARTIN',
    address: '8 av. Victor Hugo, 69006 Lyon',
    phone: '06 98 76 54 32',
    types: ['PAC', 'BALLON', 'ISOLATION'],
    avantStatus: 'done',
    apresStatus: 'pending',
    avantRef: 'RF-1203',
    avantDate: '15/12/24',
    assignedTo: 'Thomas D.',
  },
  {
    id: '3',
    ref: 'CEE-2025-00798',
    clientName: 'Pierre BERNARD',
    address: '25 chemin des Vignes, 33000 Bordeaux',
    phone: '07 56 78 12 34',
    types: ['ISOLATION'],
    avantStatus: 'pending',
    apresStatus: 'locked',
  },
  {
    id: '4',
    ref: 'CEE-2025-00789',
    clientName: 'Marie LEROY',
    address: '3 rue du Moulin, 44000 Nantes',
    phone: '06 45 67 89 01',
    types: ['CHAUDIERE'],
    avantStatus: 'pending',
    apresStatus: 'locked',
  },
  {
    id: '5',
    ref: 'CEE-2025-00781',
    clientName: 'Robert SIMON',
    address: '14 av. de la Paix, 67000 Strasbourg',
    phone: '06 78 90 12 34',
    types: ['PAC'],
    avantStatus: 'done',
    apresStatus: 'done',
    avantRef: 'RF-1198',
    avantDate: '10/12/24',
  },
];

// ─── Dossiers Sous-Traitant ────────────────────────────────────────────────────

export const DOSSIERS_SOUSTRAITANT: Dossier[] = [
  {
    id: '1',
    ref: 'CEE-2025-00847',
    clientName: 'Jean DUPONT',
    address: '12 rue des Lilas, 75011 Paris',
    phone: '06 12 34 56 78',
    types: ['PAC', 'BALLON'],
    avantStatus: 'pending',
    apresStatus: 'locked',
    donneurOrdre: 'Dupont Énergies',
    assignedTo: 'Marc L.',
  },
  {
    id: '2',
    ref: 'CEE-2025-00852',
    clientName: 'Sophie MARTIN',
    address: '8 av. du Gal de Gaulle, 92100 Boulogne',
    phone: '06 98 76 54 32',
    types: ['PAC', 'BALLON', 'ISOLATION'],
    avantStatus: 'done',
    apresStatus: 'pending',
    avantRef: 'RF-1248',
    avantDate: '27/12/24',
    donneurOrdre: 'Dupont Énergies',
    assignedTo: 'Thomas D.',
  },
];

// ─── Dossiers Ouvrier ────────────────────────────────────────────────────────

export const DOSSIERS_OUVRIER: Dossier[] = [
  {
    id: '1',
    ref: 'CEE-2025-00847',
    clientName: 'Jean DUPONT',
    address: '12 rue des Lilas, 75011 Paris',
    phone: '06 12 34 56 78',
    types: ['PAC', 'BALLON'],
    avantStatus: 'pending',
    apresStatus: 'locked',
    donneurOrdre: 'Dupont Énergies',
  },
  {
    id: '2',
    ref: 'CEE-2025-00798',
    clientName: 'Pierre BERNARD',
    address: '25 chemin des Vignes, 33000 Bordeaux',
    phone: '07 56 78 12 34',
    types: ['ISOLATION'],
    avantStatus: 'pending',
    apresStatus: 'locked',
    donneurOrdre: 'Isol Therm SARL',
  },
];

// ─── Rapports Libres ─────────────────────────────────────────────────────────

export const RAPPORTS_LIBRES: RapportLibre[] = [
  {
    id: '1',
    ref: 'RF-1247',
    clientName: 'Jean DUPONT',
    address: '12 rue des Lilas, 75011 Paris',
    types: ['PAC', 'BALLON'],
    phase: 'Avant',
    date: '28/12/24',
  },
  {
    id: '2',
    ref: 'RF-1248',
    clientName: 'Marc LEFEVRE',
    address: '5 place Bellecour, 69002 Lyon',
    types: ['ISOLATION'],
    phase: 'Après',
    date: '27/12/24',
    via: 'Clim Plus SARL',
    assignedTo: 'Thomas D.',
  },
  {
    id: '3',
    ref: 'RF-1245',
    clientName: 'Thomas DUBOIS',
    address: '18 bd Haussmann, 75009 Paris',
    types: ['ISOLATION'],
    phase: 'Avant',
    date: '26/12/24',
  },
  {
    id: '4',
    ref: 'RF-1198',
    clientName: 'Pierre BERNARD',
    address: '25 chemin des Vignes, 33000 Bordeaux',
    types: ['ISOLATION'],
    phase: 'Avant',
    date: '10/12/24',
    via: 'Isol Therm',
    assignedTo: 'Thomas D.',
  },
  {
    id: '5',
    ref: 'RF-1233',
    clientName: 'Sophie LEROY',
    address: '7 rue Gambetta, 31000 Toulouse',
    types: ['PAC'],
    phase: 'Après',
    date: '18/12/24',
    assignedTo: 'Lucas M.',
  },
  {
    id: '6',
    ref: 'RF-1219',
    clientName: 'André MOREAU',
    address: '2 rue de la Liberté, 13000 Marseille',
    types: ['CHAUDIERE'],
    phase: 'Avant',
    date: '14/12/24',
  },
];

// ─── Équipe Ouvriers ─────────────────────────────────────────────────────────

export const OUVRIERS: TeamMember[] = [
  {
    id: '1',
    firstName: 'Lucas',
    lastName: 'MARTIN',
    initials: 'LM',
    phone: '06 12 34 56 78',
    status: 'active',
    hasJeety: true,
    rapportCount: 12,
  },
  {
    id: '2',
    firstName: 'Thomas',
    lastName: 'DUBOIS',
    initials: 'TD',
    phone: '07 23 45 67 89',
    status: 'pending',
    hasJeety: false,
  },
];

// ─── Sous-Traitants ──────────────────────────────────────────────────────────

export const SOUS_TRAITANTS: SousTraitant[] = [
  {
    id: '1',
    name: 'Élec Pro Services',
    siret: '321 654 987 00034',
    hasJeety: true,
    rapportCount: 15,
  },
  {
    id: '2',
    name: 'Isol Therm',
    siret: '456 789 123 00056',
    hasJeety: true,
    rapportCount: 8,
  },
];

// ─── Photos par type ─────────────────────────────────────────────────────────

export const PHOTOS_AVANT: Record<DossierType, string[]> = {
  PAC: ['Système de chauffage existant', 'Plaque signalétique chauffage', 'Façade maison'],
  BALLON: ['Ballon eau chaude existant'],
  ISOLATION: ['Combles avant isolation', 'Points singuliers (trappe, VMC)', 'Façade maison'],
  CHAUDIERE: ['Chaudière existante', 'Plaque signalétique chaudière', 'Conduit évacuation fumées', 'Arrivée gaz', 'Façade maison'],
};

export const PHOTOS_APRES: Record<DossierType, string[]> = {
  PAC: ['Groupe extérieur PAC installé', 'Plaque signalétique PAC', 'Unité intérieure', 'Façade maison'],
  BALLON: ['Ballon thermodynamique installé', 'Plaque signalétique ballon'],
  ISOLATION: ['Combles après isolation', 'Vue générale combles'],
  CHAUDIERE: ['Nouvelle chaudière installée', 'Plaque signalétique', 'Raccordement gaz', 'Façade maison'],
};

// ─── Ouvriers Sous-Traitant ──────────────────────────────────────────────────

export const OUVRIERS_ST: TeamMember[] = [
  {
    id: '1',
    firstName: 'Marc',
    lastName: 'LEBLANC',
    initials: 'ML',
    phone: '06 12 34 56 78',
    status: 'active',
    hasJeety: true,
  },
  {
    id: '2',
    firstName: 'Thomas',
    lastName: 'DUBOIS',
    initials: 'TD',
    phone: '07 23 45 67 89',
    status: 'active',
    hasJeety: true,
  },
];
