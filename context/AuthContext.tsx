import type { Dossier, DossierType, Role, UserProfile } from '@/constants/mock-data';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import axios from 'axios';
import * as Location from 'expo-location';
import * as SecureStore from 'expo-secure-store';
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
    return {
      id: String(d.id_dossier),
      ref: d.reference_dossier || '',
      clientName: client.nom || 'Client inconnu',
      address: addr || '',
      phone: client.telephone || '',
      types: travaux.map((t: any) => t.type_travaux).filter(Boolean) as DossierType[],
      avantStatus: 'pending',
      apresStatus: 'locked',
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
      role: role || 'artisan',
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

  // ─── Logout ─────────────────────────────────────────────────────────────────

  const doLogout = async () => {
    setUserToken(null);
    setUserData(null);
    setRoleState(null);
    setDossiers([]);
    setLoginError(null);
    setIsLoading(false);
    await SecureStore.deleteItemAsync('usertoken');
    await AsyncStorage.removeItem('userdata');
    await AsyncStorage.removeItem('role');
    await AsyncStorage.removeItem('dossiers');
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
      const token = await SecureStore.getItemAsync('usertoken');
      setUserToken(token);
      if (token) {
        getUserData(token);
      }
    } catch (e) {
      console.log(`Restore token error: ${e}`);
    }
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
