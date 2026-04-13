import type { ApiOuvrier, ApiRapport, ApiSousTraitant, Dossier, DossierPhoto, DossierType, PhotoRequirement, Role, UserProfile } from '@/constants/mock-data';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import axios from 'axios';
import * as Location from 'expo-location';
import * as SecureStore from 'expo-secure-store';
import * as SplashScreen from 'expo-splash-screen';
import React, { createContext, useContext, useEffect, useState } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface LocationCoords {
  latitude: number;
  longitude: number;
}

interface ApiResponse<T = any> {
  data: {
    code: 'SUCCESS' | 'LOGOUT' | 'ERROR';
    message?: string;
    token?: string;
    data?: T;
    [key: string]: any;
  };
}

interface AuthContextType {
  // ─── State ──────────────────────────────────────────────────────────────────
  appBaseUrl: string;
  usertoken: string | null;
  userdata: UserProfile | null;
  role: Role | null;
  isLoading: boolean;
  isConnected: boolean;
  location: LocationCoords | null;

  // ─── Auth actions ───────────────────────────────────────────────────────────
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  setRole: (role: Role) => void;

  // ─── API ────────────────────────────────────────────────────────────────────
  apiAction: <T = any>(
    params: Record<string, any>,
    callback: (res: ApiResponse<T>) => void,
    onError?: (message: string) => void,
    headers?: Record<string, any>,
  ) => Promise<void>;

  // ─── Data ───────────────────────────────────────────────────────────────────
  dossiers: Dossier[];
  loginError: string | null;
  refreshDossiers: () => Promise<void>;

  // ─── Team ───────────────────────────────────────────────────────────────────
  teamOuvriers: ApiOuvrier[];
  teamSousTraitants: ApiSousTraitant[];
  refreshTeam: () => Promise<void>;

  // ─── Rapports ───────────────────────────────────────────────────────────────
  rapports: ApiRapport[];
  refreshRapports: () => Promise<void>;
  createRapport: (data: Record<string, any>) => Promise<number | null>;

  // ─── Profile ────────────────────────────────────────────────────────────────
  updateProfile: (fields: Record<string, string>) => Promise<boolean>;
  changePassword: (oldPsw: string, newPsw: string) => Promise<string | null>;

  // ─── Team actions ───────────────────────────────────────────────────────────
  addOuvrier: (firstName: string, lastName: string, phone: string) => Promise<boolean>;
  removeOuvrier: (idOuvrier: number | string) => Promise<boolean>;
  inviteMember: (type: 'ouvrier' | 'sous-traitant', id: number | string) => Promise<boolean>;

  // ─── Dynamic data ───────────────────────────────────────────────────────────
  searchAddresses: (query: string) => Promise<string[]>;
  getCompanies: () => Promise<{ id: string; name: string }[]>;
  saveChecklist: (dossierId: string, phase: string, checkedItems: string[]) => Promise<boolean>;
  loadChecklist: (dossierId: string, phase: string) => Promise<string[]>;

  // ─── Photos ─────────────────────────────────────────────────────────────────
  getPhotoRequirements: (idCeeFiches: number[]) => Promise<PhotoRequirement[]>;
  getDossierPhotos: (idDossier: string) => Promise<DossierPhoto[]>;
  uploadPhoto: (data: FormData) => Promise<DossierPhoto | null>;

  // ─── PDF ─────────────────────────────────────────────────────────────────────
  getPdfUrl: (idRapport: number | string) => string;
  generatePdf: (idRapport: number | string) => Promise<string | null>;

  // ─── Storage helpers ────────────────────────────────────────────────────────
  asyncSave: (key: string, value: string) => Promise<void>;
  secureSave: (key: string, value: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

// ─── Base URL de l'API Jeety ──────────────────────────────────────────────────
// DEV LOCAL  : 'http://VOTRE_IP_LOCALE:8000/' (ex: 'http://192.168.1.42:8000/')
// PRODUCTION : 'https://jeety.fr/' (ou le domaine réel du CRM)
const APP_BASE_URL = 'https://jeetydev.jddev.com/';

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [usertoken, setUserToken] = useState<string | null>(null);
  const [userdata, setUserData] = useState<UserProfile | null>(null);
  const [role, setRoleState] = useState<Role | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [location, setLocation] = useState<LocationCoords | null>(null);
  const [dossiers, setDossiers] = useState<Dossier[]>([]);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [teamOuvriers, setTeamOuvriers] = useState<ApiOuvrier[]>([]);
  const [teamSousTraitants, setTeamSousTraitants] = useState<ApiSousTraitant[]>([]);
  const [rapports, setRapports] = useState<ApiRapport[]>([]);

  // ─── Storage helpers ────────────────────────────────────────────────────────

  const secureSave = async (key: string, value: string) => {
    await SecureStore.setItemAsync(key, value);
  };

  const asyncSave = async (key: string, value: string) => {
    await AsyncStorage.setItem(key, value);
  };

  const getAsyncData = (key: string) => {
    return AsyncStorage.getItem(key);
  };

  // ─── Géolocalisation ────────────────────────────────────────────────────────

  const getLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const loc = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
    } catch (e) {
      console.log(`Location error: ${e}`);
    }
  };

  // ─── API Action (même pattern que entarapp5) ───────────────────────────────
  //
  // 1. Vérifie la connexion réseau
  // 2. Si hors-ligne → stocke l'action en local pour envoi ultérieur
  // 3. Si en ligne → POST axios vers l'API
  // 4. Gère les codes retour : SUCCESS → callback, LOGOUT → déconnecte, sinon erreur

  const apiAction = async <T = any>(
    params: Record<string, any>,
    callback: (res: ApiResponse<T>) => void,
    onError?: (message: string) => void,
    headers?: Record<string, any>,
  ) => {
    setIsLoading(true);

    if (!isConnected) {
      // ─── Mode hors-ligne : stockage local ─────────────────────────────────
      try {
        let localData = await getAsyncData('localData');
        const queue = localData ? JSON.parse(localData) : [];
        queue.push({ type: 'json', data: params });
        await asyncSave('localData', JSON.stringify(queue));
      } catch (e) {
        console.log(`Offline storage error: ${e}`);
      }
      setIsLoading(false);
      return;
    }

    // ─── Mode en ligne : appel API ────────────────────────────────────────
    try {
      const res = await axios.post(APP_BASE_URL + 'api/api.php', params, headers);
      setIsLoading(false);

      if (res.data.code === 'SUCCESS') {
        callback(res as ApiResponse<T>);
      } else if (res.data.code === 'LOGOUT') {
        await doLogout();
      } else if (onError) {
        onError(res.data.message || 'Une erreur est survenue');
      } else {
        console.log('API error:', res.data);
      }
    } catch (e) {
      console.log(`API connection error: ${e}`);
      setIsLoading(false);
    }
  };

  // ─── Mapping API → App types ────────────────────────────────────────────────

  const mapApiDossier = (d: any): Dossier => {
    const client = d.client || {};
    const travaux = d.travaux || [];
    const addr = [client.adresse, client.code_postal, client.ville].filter(Boolean).join(', ');

    // Statuts avant/après basés sur les rapports réels
    const rapAvant = d.rapport_avant;
    const rapApres = d.rapport_apres;
    const avantDone = !!rapAvant;
    const apresDone = !!rapApres;

    const formatDate = (dateStr: string) => {
      const dt = new Date(dateStr);
      return `${dt.getDate().toString().padStart(2, '0')}/${(dt.getMonth() + 1).toString().padStart(2, '0')}/${String(dt.getFullYear()).slice(2)}`;
    };

    return {
      id: String(d.id_dossier),
      ref: d.reference_dossier || '',
      clientName: client.nom || 'Client inconnu',
      address: addr || '',
      phone: client.telephone || '',
      types: travaux.map((t: any) => t.type_travaux).filter(Boolean) as DossierType[],
      travaux: travaux.map((t: any) => ({
        id_travaux: Number(t.id_travaux),
        type_travaux: t.type_travaux as DossierType,
        id_cee_fiche: t.id_cee_fiche ? Number(t.id_cee_fiche) : null,
        code_operation: t.code_operation || undefined,
      })),
      avantStatus: avantDone ? 'done' : 'pending',
      apresStatus: apresDone ? 'done' : avantDone ? 'pending' : 'locked',
      avantRef: rapAvant?.reference ?? undefined,
      avantDate: rapAvant ? formatDate(rapAvant.date) : undefined,
      apresRef: rapApres?.reference ?? undefined,
      apresDate: rapApres ? formatDate(rapApres.date) : undefined,
      assignedTo: rapApres?.operateur || rapAvant?.operateur || undefined,
      isSousTraite: !!d.has_sous_traitant,
    };
  };

  const mapApiUserProfile = (data: any): UserProfile => {
    const nameParts = (data.name_user || '').split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';
    const initials = (firstName[0] || '') + (lastName[0] || '');
    return {
      firstName,
      lastName,
      initials: initials.toUpperCase() || 'JD',
      company: data.company?.company_name || '',
      siret: data.company?.siret || '',
      email: data.email || '',
      phone: data.tel_user || '',
      role: role || 'artisan',
      location: data.location || '',
      lang: data.lang || 'fr',
      status: data.status_user || 'pending',
      dateLastLogin: data.date_last_login || '',
      idProfil: data.id_profil ? Number(data.id_profil) : undefined,
      idCompany: data.id_company ? Number(data.id_company) : undefined,
    };
  };

  // ─── Login ──────────────────────────────────────────────────────────────────

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoginError(null);
    setIsLoading(true);

    try {
      const res = await axios.post(APP_BASE_URL + 'api/api.php', {
        action: 'login-api',
        username: email,
        password: password,
        geolat: location?.latitude ?? 0,
        geolng: location?.longitude ?? 0,
      });

      setIsLoading(false);

      if (res.data.code === 'SUCCESS') {
        const profile = mapApiUserProfile(res.data.data);
        setUserData(profile);
        setUserToken(res.data.token!);
        await secureSave('usertoken', res.data.token!);
        await asyncSave('userdata', JSON.stringify(profile));
        const apiDossiers = (res.data.data?.dossiers || []).map(mapApiDossier);
        setDossiers(apiDossiers);
        await asyncSave('dossiers', JSON.stringify(apiDossiers));
        // Team data
        const team = res.data.data?.team || {};
        setTeamOuvriers(team.ouvriers || []);
        setTeamSousTraitants(team.sous_traitants || []);
        await asyncSave('teamOuvriers', JSON.stringify(team.ouvriers || []));
        await asyncSave('teamSousTraitants', JSON.stringify(team.sous_traitants || []));
        return true;
      } else {
        setLoginError(res.data.message || 'Identifiants incorrects');
        return false;
      }
    } catch (e) {
      setIsLoading(false);
      setLoginError('Connexion au serveur impossible');
      console.log('Login error:', e);
      return false;
    }
  };

  // ─── Récupérer les données utilisateur ──────────────────────────────────────

  const getUserData = async (token: string) => {
    apiAction({
      action: 'get-user-data',
      token,
      geolat: location?.latitude ?? 0,
      geolng: location?.longitude ?? 0,
    }, async (res) => {
      const profile = mapApiUserProfile(res.data.data);
      setUserData(profile);
      await asyncSave('userdata', JSON.stringify(profile));
      const apiDossiers = (res.data.data?.dossiers || []).map(mapApiDossier);
      setDossiers(apiDossiers);
      await asyncSave('dossiers', JSON.stringify(apiDossiers));
      // Team data
      const team = res.data.data?.team || {};
      setTeamOuvriers(team.ouvriers || []);
      setTeamSousTraitants(team.sous_traitants || []);
      await asyncSave('teamOuvriers', JSON.stringify(team.ouvriers || []));
      await asyncSave('teamSousTraitants', JSON.stringify(team.sous_traitants || []));
    });
  };

  // ─── Refresh dossiers ───────────────────────────────────────────────────────

  const refreshDossiers = async () => {
    if (!usertoken) return;
    apiAction({
      action: 'get-dossiers',
      token: usertoken,
    }, async (res) => {
      const apiDossiers = (res.data.dossiers || []).map(mapApiDossier);
      setDossiers(apiDossiers);
      await asyncSave('dossiers', JSON.stringify(apiDossiers));
    });
  };

  // ─── Refresh team ───────────────────────────────────────────────────────────

  const refreshTeam = async () => {
    if (!usertoken) return;
    apiAction({
      action: 'get-team',
      token: usertoken,
    }, async (res) => {
      const team = res.data.team || {};
      setTeamOuvriers(team.ouvriers || []);
      setTeamSousTraitants(team.sous_traitants || []);
      await asyncSave('teamOuvriers', JSON.stringify(team.ouvriers || []));
      await asyncSave('teamSousTraitants', JSON.stringify(team.sous_traitants || []));
    });
  };

  // ─── Refresh rapports ───────────────────────────────────────────────────────

  const refreshRapports = async () => {
    if (!usertoken) return;
    apiAction({
      action: 'get-rapports',
      token: usertoken,
    }, async (res) => {
      setRapports(res.data.rapports || []);
      await asyncSave('rapports_list', JSON.stringify(res.data.rapports || []));
    });
  };

  // ─── Create rapport ─────────────────────────────────────────────────────────

  const createRapport = async (data: Record<string, any>): Promise<number | null> => {
    if (!usertoken) return null;
    return new Promise((resolve) => {
      apiAction({
        action: 'create-rapport',
        token: usertoken,
        ...data,
      }, (res) => {
        refreshRapports();
        resolve(res.data.id_rapport ?? null);
      }, () => {
        resolve(null);
      });
    });
  };

  // ─── Update profile ─────────────────────────────────────────────────────────

  const updateProfile = async (fields: Record<string, string>): Promise<boolean> => {
    if (!usertoken) return false;
    return new Promise((resolve) => {
      apiAction({
        action: 'update-profile',
        token: usertoken,
        ...fields,
      }, async (res) => {
        const profile = mapApiUserProfile(res.data.data);
        setUserData(profile);
        await asyncSave('userdata', JSON.stringify(profile));
        resolve(true);
      }, () => {
        resolve(false);
      });
    });
  };

  // ─── Change password ────────────────────────────────────────────────────────

  const changePassword = async (oldPsw: string, newPsw: string): Promise<string | null> => {
    if (!usertoken) return 'Non connecté';
    return new Promise((resolve) => {
      apiAction({
        action: 'change-password',
        token: usertoken,
        old_password: oldPsw,
        new_password: newPsw,
      }, () => {
        resolve(null);
      }, (msg) => {
        resolve(msg);
      });
    });
  };

  // ─── Add ouvrier ────────────────────────────────────────────────────────────

  const addOuvrier = async (firstName: string, lastName: string, phone: string): Promise<boolean> => {
    if (!usertoken) return false;
    return new Promise((resolve) => {
      apiAction({
        action: 'add-ouvrier',
        token: usertoken,
        prenom: firstName,
        nom: lastName,
        telephone: phone,
      }, () => {
        refreshTeam();
        resolve(true);
      }, () => {
        resolve(false);
      });
    });
  };

  // ─── Remove ouvrier ─────────────────────────────────────────────────────────

  const removeOuvrier = async (idOuvrier: number | string): Promise<boolean> => {
    if (!usertoken) return false;
    return new Promise((resolve) => {
      apiAction({
        action: 'remove-ouvrier',
        token: usertoken,
        id_ouvrier: idOuvrier,
      }, () => {
        refreshTeam();
        resolve(true);
      }, () => {
        resolve(false);
      });
    });
  };

  // ─── Invite member ──────────────────────────────────────────────────────────

  const inviteMember = async (type: 'ouvrier' | 'sous-traitant', id: number | string): Promise<boolean> => {
    if (!usertoken) return false;
    return new Promise((resolve) => {
      apiAction({
        action: 'invite-member',
        token: usertoken,
        type,
        id_member: id,
      }, () => {
        resolve(true);
      }, () => {
        resolve(false);
      });
    });
  };

  // ─── Search addresses ───────────────────────────────────────────────────────

  const searchAddresses = async (query: string): Promise<string[]> => {
    if (!usertoken) return [];
    return new Promise((resolve) => {
      apiAction({
        action: 'search-addresses',
        token: usertoken,
        query,
      }, (res) => {
        resolve(res.data.addresses || []);
      }, () => {
        resolve([]);
      });
    });
  };

  // ─── Get companies (donneurs d'ordre) ───────────────────────────────────────────────

  const getCompanies = async (): Promise<{ id: string; name: string }[]> => {
    if (!usertoken) return [];
    return new Promise((resolve) => {
      apiAction({
        action: 'get-companies',
        token: usertoken,
      }, (res) => {
        resolve(res.data.companies || []);
      }, () => {
        resolve([]);
      });
    });
  };

  // ─── Save checklist ─────────────────────────────────────────────────────────

  const saveChecklist = async (dossierId: string, phase: string, checkedItems: string[]): Promise<boolean> => {
    // Always persist locally first
    const key = `checklist_${dossierId}_${phase}`;
    await asyncSave(key, JSON.stringify(checkedItems));
    if (!usertoken) return false;
    return new Promise((resolve) => {
      apiAction({
        action: 'save-checklist',
        token: usertoken,
        id_dossier: dossierId,
        phase,
        checked_items: checkedItems,
      }, () => {
        resolve(true);
      }, () => {
        resolve(false);
      });
    });
  };

  // ─── Load checklist ─────────────────────────────────────────────────────────

  const loadChecklist = async (dossierId: string, phase: string): Promise<string[]> => {
    const key = `checklist_${dossierId}_${phase}`;
    try {
      const saved = await getAsyncData(key);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.log('loadChecklist local error:', e);
    }
    return [];
  };

  // ─── Photo requirements ─────────────────────────────────────────────────────

  const getPhotoRequirements = async (idCeeFiches: number[]): Promise<PhotoRequirement[]> => {
    if (!usertoken || idCeeFiches.length === 0) return [];
    return new Promise((resolve) => {
      apiAction({
        action: 'get-photo-requirements',
        token: usertoken,
        id_cee_fiches: JSON.stringify(idCeeFiches),
      }, (res) => {
        resolve(res.data.requirements || []);
      }, () => {
        resolve([]);
      });
    });
  };

  // ─── Get dossier photos ─────────────────────────────────────────────────────

  const getDossierPhotos = async (idDossier: string): Promise<DossierPhoto[]> => {
    if (!usertoken) return [];
    return new Promise((resolve) => {
      apiAction({
        action: 'get-photos',
        token: usertoken,
        id_dossier: idDossier,
      }, (res) => {
        resolve(res.data.photos || []);
      }, () => {
        resolve([]);
      });
    });
  };

  // ─── Upload photo ───────────────────────────────────────────────────────────

  const uploadPhoto = async (formData: FormData): Promise<DossierPhoto | null> => {
    if (!usertoken) { console.warn('uploadPhoto: pas de token'); return null; }
    formData.append('action', 'upload-photo');
    formData.append('token', usertoken);
    try {
      const res = await axios.post(APP_BASE_URL + 'api/api.php', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 30000,
      });
      console.log('uploadPhoto response:', JSON.stringify(res.data));
      if (res.data.code === 'SUCCESS') {
        return res.data as DossierPhoto;
      }
      console.warn('uploadPhoto API error:', res.data.message || res.data);
      return null;
    } catch (e: any) {
      console.warn('uploadPhoto network error:', e?.message || e);
      return null;
    }
  };

  // ─── PDF ────────────────────────────────────────────────────────────────────

  const getPdfUrl = (idRapport: number | string): string => {
    return APP_BASE_URL + 'api/api.php?action=download-pdf&id_rapport=' + idRapport + '&token=' + (usertoken ?? '');
  };

  const generatePdf = async (idRapport: number | string): Promise<string | null> => {
    if (!usertoken) return null;
    return new Promise((resolve) => {
      apiAction({
        action: 'generate-pdf',
        token: usertoken,
        id_rapport: String(idRapport),
      }, (res) => {
        resolve(res.data.pdf_url ?? null);
      }, () => {
        resolve(null);
      });
    });
  };

  // ─── Logout ─────────────────────────────────────────────────────────────────

  const doLogout = async () => {
    setUserToken(null);
    setUserData(null);
    setRoleState(null);
    setDossiers([]);
    setTeamOuvriers([]);
    setTeamSousTraitants([]);
    setRapports([]);
    setLoginError(null);
    setIsLoading(false);
    await SecureStore.deleteItemAsync('usertoken');
    await AsyncStorage.removeItem('userdata');
    await AsyncStorage.removeItem('role');
    await AsyncStorage.removeItem('dossiers');
    await AsyncStorage.removeItem('teamOuvriers');
    await AsyncStorage.removeItem('teamSousTraitants');
    await AsyncStorage.removeItem('rapports_list');
  };

  // ─── Set Role ───────────────────────────────────────────────────────────────

  const setRole = (r: Role) => {
    setRoleState(r);
    asyncSave('role', r);
  };

  // ─── Envoi des données locales stockées hors-ligne ──────────────────────────

  const sendLocalData = async (queue: any[]) => {
    if (queue.length === 0) return;
    const item = queue[0];

    try {
      if (item.type === 'json') {
        await axios.post(APP_BASE_URL + 'api/api.php', item.data);
      } else if (item.type === 'formdata') {
        const formData = new FormData();
        for (const key in item.data) {
          formData.append(key, item.data[key]);
        }
        await axios.post(APP_BASE_URL + 'api/api.php', formData, {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'multipart/form-data',
          },
        });
      }
      queue.shift();
      await asyncSave('localData', JSON.stringify(queue));
      await sendLocalData(queue);
    } catch (e) {
      console.log(`sendLocalData error: ${e}`);
    }
  };

  const processLocalQueue = async () => {
    try {
      const raw = await getAsyncData('localData');
      if (raw) {
        const queue = JSON.parse(raw);
        await sendLocalData(queue);
      }
    } catch (e) {
      console.log(`processLocalQueue error: ${e}`);
    }
  };

  // ─── Restaurer la session au démarrage ──────────────────────────────────────

  const restoreSession = async () => {
    try {
      const savedRole = await getAsyncData('role');
      if (savedRole) {
        setRoleState(savedRole as Role);
      }
    } catch (e) {
      console.log(`Restore role error: ${e}`);
    }

    try {
      const savedUser = await getAsyncData('userdata');
      if (savedUser) {
        setUserData(JSON.parse(savedUser));
      }
    } catch (e) {
      console.log(`Restore userdata error: ${e}`);
    }

    try {
      const savedDossiers = await getAsyncData('dossiers');
      if (savedDossiers) {
        setDossiers(JSON.parse(savedDossiers));
      }
    } catch (e) {
      console.log(`Restore dossiers error: ${e}`);
    }

    try {
      const savedOuvriers = await getAsyncData('teamOuvriers');
      if (savedOuvriers) setTeamOuvriers(JSON.parse(savedOuvriers));
      const savedST = await getAsyncData('teamSousTraitants');
      if (savedST) setTeamSousTraitants(JSON.parse(savedST));
      const savedRapports = await getAsyncData('rapports_list');
      if (savedRapports) setRapports(JSON.parse(savedRapports));
    } catch (e) {
      console.log(`Restore team/rapports error: ${e}`);
    }

    try {
      const token = await SecureStore.getItemAsync('usertoken');
      setUserToken(token);
      if (token) {
        getUserData(token);
      }
    } catch (e) {
      console.log(`Restore token error: ${e}`);
    }

    await SplashScreen.hideAsync();
  };

  // ─── Effets au montage ──────────────────────────────────────────────────────

  useEffect(() => {
    restoreSession();
    getLocation();

    const unsubscribe = NetInfo.addEventListener((state) => {
      const connected = !!(state.isConnected && state.isInternetReachable);
      setIsConnected(connected);
      if (connected) {
        processLocalQueue();
      }
    });

    const locationInterval = setInterval(getLocation, 30000);

    return () => {
      unsubscribe();
      clearInterval(locationInterval);
    };
  }, []);

  // ─── Valeur du contexte ─────────────────────────────────────────────────────

  return (
    <AuthContext.Provider
      value={{
        appBaseUrl: APP_BASE_URL,
        usertoken,
        userdata,
        role,
        isLoading,
        isConnected,
        location,
        dossiers,
        loginError,
        login,
        logout: doLogout,
        setRole,
        apiAction,
        refreshDossiers,
        teamOuvriers,
        teamSousTraitants,
        refreshTeam,
        rapports,
        refreshRapports,
        createRapport,
        updateProfile,
        changePassword,
        addOuvrier,
        removeOuvrier,
        inviteMember,
        searchAddresses,
        getCompanies,
        saveChecklist,
        loadChecklist,
        getPhotoRequirements,
        getDossierPhotos,
        uploadPhoto,
        getPdfUrl,
        generatePdf,
        asyncSave,
        secureSave,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth() {
  return useContext(AuthContext);
}
