// ─── Jeety Focus i18n ─────────────────────────────────────────────────────────
// Minimal i18n system for the Ouvrier role (8 languages)

export type Lang = 'fr' | 'en' | 'es' | 'pt' | 'ru' | 'uk' | 'ro' | 'tr';

export const LANG_LABELS: Record<Lang, string> = {
  fr: '🇫🇷 Français',
  en: '🇬🇧 English',
  es: '🇪🇸 Español',
  pt: '🇧🇷 Português',
  ru: '🇷🇺 Русский',
  uk: '🇺🇦 Українська',
  ro: '🇷🇴 Română',
  tr: '🇹🇷 Türkçe',
};

export type TranslationKey =
  | 'app.name'
  | 'nav.chantiers'
  | 'nav.rapports'
  | 'nav.profil'
  | 'search.placeholder'
  | 'list.my_chantiers'
  | 'list.no_results'
  | 'status.avant'
  | 'status.apres'
  | 'status.pending'
  | 'status.done'
  | 'status.locked'
  | 'photo.heating.existing'
  | 'photo.heating.plate'
  | 'photo.facade'
  | 'photo.ballon.existing'
  | 'photo.attic.before'
  | 'photo.attic.after'
  | 'photo.singular.points'
  | 'photo.boiler.existing'
  | 'photo.boiler.plate'
  | 'photo.flue.duct'
  | 'photo.gas.inlet'
  | 'photo.pac.outdoor'
  | 'photo.pac.plate'
  | 'photo.pac.indoor'
  | 'photo.ballon.installed'
  | 'photo.ballon.plate'
  | 'photo.attic.general'
  | 'photo.boiler.new'
  | 'photo.gas.connect'
  | 'camera.instruction'
  | 'camera.gps'
  | 'camera.capture'
  | 'create.section1.title'
  | 'create.section2.title'
  | 'create.section3.title'
  | 'create.phase.avant'
  | 'create.phase.apres'
  | 'create.submit'
  | 'create.address.placeholder'
  | 'profil.my_employer'
  | 'profil.language'
  | 'profil.logout'
  | 'login.title'
  | 'login.email'
  | 'login.password'
  | 'login.submit'
  | 'login.forgot'
  | 'login.no_account'
  | 'login.phone.step1'
  | 'login.phone.search'
  | 'login.phone.searching'
  | 'login.phone.found'
  | 'login.phone.confirm'
  | 'login.phone.yes'
  | 'login.phone.no'
  | 'login.account.email'
  | 'login.account.password'
  | 'login.account.confirm_password'
  | 'login.account.create'
  | 'success.title'
  | 'success.subtitle'
  | 'success.download'
  | 'success.back';

type Translations = Record<TranslationKey, string>;

const FR: Translations = {
  'app.name': 'Jeety Focus',
  'nav.chantiers': 'Mes chantiers',
  'nav.rapports': 'Rapports libres',
  'nav.profil': 'Mon profil',
  'search.placeholder': 'Rechercher...',
  'list.my_chantiers': 'Mes chantiers',
  'list.no_results': 'Aucun chantier trouvé',
  'status.avant': 'Avant travaux',
  'status.apres': 'Après travaux',
  'status.pending': 'En attente',
  'status.done': 'Terminé',
  'status.locked': 'Verrouillé',
  'photo.heating.existing': 'Système de chauffage existant',
  'photo.heating.plate': 'Plaque signalétique chauffage',
  'photo.facade': 'Façade maison',
  'photo.ballon.existing': 'Ballon eau chaude existant',
  'photo.attic.before': 'Combles avant isolation',
  'photo.attic.after': 'Combles après isolation',
  'photo.singular.points': 'Points singuliers (trappe, VMC)',
  'photo.boiler.existing': 'Chaudière existante',
  'photo.boiler.plate': 'Plaque signalétique chaudière',
  'photo.flue.duct': 'Conduit évacuation fumées',
  'photo.gas.inlet': 'Arrivée gaz',
  'photo.pac.outdoor': 'Groupe extérieur PAC installé',
  'photo.pac.plate': 'Plaque signalétique PAC',
  'photo.pac.indoor': 'Unité intérieure',
  'photo.ballon.installed': 'Ballon thermodynamique installé',
  'photo.ballon.plate': 'Plaque signalétique ballon',
  'photo.attic.general': 'Vue générale combles',
  'photo.boiler.new': 'Nouvelle chaudière installée',
  'photo.gas.connect': 'Raccordement gaz',
  'camera.instruction': 'Cadrez et prenez la photo',
  'camera.gps': 'GPS activé',
  'camera.capture': 'Prendre la photo',
  'create.section1.title': 'Chantier',
  'create.section2.title': 'Phase',
  'create.section3.title': "Type d'opération",
  'create.phase.avant': 'Avant travaux',
  'create.phase.apres': 'Après travaux',
  'create.submit': 'Démarrer les photos',
  'create.address.placeholder': 'Adresse du chantier',
  'profil.my_employer': 'Mon employeur',
  'profil.language': 'Langue',
  'profil.logout': 'Se déconnecter',
  'login.title': 'Connexion',
  'login.email': 'Email',
  'login.password': 'Mot de passe',
  'login.submit': 'Se connecter',
  'login.forgot': 'Mot de passe oublié ?',
  'login.no_account': "Pas encore de compte ?",
  'login.phone.step1': 'Entrez votre numéro de téléphone',
  'login.phone.search': 'Rechercher mon invitation',
  'login.phone.searching': 'Recherche en cours...',
  'login.phone.found': 'Invitation trouvée !',
  'login.phone.confirm': 'Est-ce bien vous ?',
  'login.phone.yes': 'Oui, c\'est moi',
  'login.phone.no': 'Non',
  'login.account.email': 'Email',
  'login.account.password': 'Mot de passe',
  'login.account.confirm_password': 'Confirmer le mot de passe',
  'login.account.create': 'Créer mon compte',
  'success.title': 'Rapport généré !',
  'success.subtitle': 'Votre rapport photo a été créé avec succès.',
  'success.download': 'Télécharger le PDF',
  'success.back': "Retour à l'accueil",
};

const EN: Translations = {
  'app.name': 'Jeety Focus',
  'nav.chantiers': 'My jobs',
  'nav.rapports': 'Free reports',
  'nav.profil': 'My profile',
  'search.placeholder': 'Search...',
  'list.my_chantiers': 'My job sites',
  'list.no_results': 'No job site found',
  'status.avant': 'Before work',
  'status.apres': 'After work',
  'status.pending': 'Pending',
  'status.done': 'Done',
  'status.locked': 'Locked',
  'photo.heating.existing': 'Existing heating system',
  'photo.heating.plate': 'Heating nameplate',
  'photo.facade': 'House facade',
  'photo.ballon.existing': 'Existing hot water tank',
  'photo.attic.before': 'Attic before insulation',
  'photo.attic.after': 'Attic after insulation',
  'photo.singular.points': 'Singular points (hatch, ventilation)',
  'photo.boiler.existing': 'Existing boiler',
  'photo.boiler.plate': 'Boiler nameplate',
  'photo.flue.duct': 'Flue gas duct',
  'photo.gas.inlet': 'Gas inlet',
  'photo.pac.outdoor': 'Installed outdoor heat pump unit',
  'photo.pac.plate': 'Heat pump nameplate',
  'photo.pac.indoor': 'Indoor unit',
  'photo.ballon.installed': 'Installed thermodynamic tank',
  'photo.ballon.plate': 'Tank nameplate',
  'photo.attic.general': 'Attic general view',
  'photo.boiler.new': 'New boiler installed',
  'photo.gas.connect': 'Gas connection',
  'camera.instruction': 'Frame and take the photo',
  'camera.gps': 'GPS enabled',
  'camera.capture': 'Take photo',
  'create.section1.title': 'Job site',
  'create.section2.title': 'Phase',
  'create.section3.title': 'Operation type',
  'create.phase.avant': 'Before work',
  'create.phase.apres': 'After work',
  'create.submit': 'Start photos',
  'create.address.placeholder': 'Job site address',
  'profil.my_employer': 'My employer',
  'profil.language': 'Language',
  'profil.logout': 'Log out',
  'login.title': 'Login',
  'login.email': 'Email',
  'login.password': 'Password',
  'login.submit': 'Sign in',
  'login.forgot': 'Forgot password?',
  'login.no_account': 'No account yet?',
  'login.phone.step1': 'Enter your phone number',
  'login.phone.search': 'Find my invitation',
  'login.phone.searching': 'Searching...',
  'login.phone.found': 'Invitation found!',
  'login.phone.confirm': 'Is this you?',
  'login.phone.yes': "Yes, that's me",
  'login.phone.no': 'No',
  'login.account.email': 'Email',
  'login.account.password': 'Password',
  'login.account.confirm_password': 'Confirm password',
  'login.account.create': 'Create account',
  'success.title': 'Report generated!',
  'success.subtitle': 'Your photo report was created successfully.',
  'success.download': 'Download PDF',
  'success.back': 'Back to home',
};

const ES: Partial<Translations> = {
  'app.name': 'Jeety Focus',
  'nav.chantiers': 'Mis obras',
  'nav.rapports': 'Informes libres',
  'nav.profil': 'Mi perfil',
  'search.placeholder': 'Buscar...',
  'login.title': 'Conexión',
  'login.email': 'Email',
  'login.password': 'Contraseña',
  'login.submit': 'Iniciar sesión',
  'login.forgot': '¿Olvidó su contraseña?',
  'camera.instruction': 'Encuadre y tome la foto',
  'camera.capture': 'Tomar foto',
  'create.phase.avant': 'Antes de obra',
  'create.phase.apres': 'Después de obra',
  'create.submit': 'Iniciar fotos',
  'success.title': '¡Informe generado!',
  'success.download': 'Descargar PDF',
  'success.back': 'Volver al inicio',
  'profil.logout': 'Cerrar sesión',
};

const PT: Partial<Translations> = {
  'app.name': 'Jeety Focus',
  'nav.chantiers': 'Minhas obras',
  'nav.rapports': 'Relatórios livres',
  'nav.profil': 'Meu perfil',
  'search.placeholder': 'Pesquisar...',
  'login.title': 'Conexão',
  'login.email': 'Email',
  'login.password': 'Senha',
  'login.submit': 'Entrar',
  'camera.instruction': 'Enquadre e tire a foto',
  'camera.capture': 'Tirar foto',
  'create.phase.avant': 'Antes da obra',
  'create.phase.apres': 'Após a obra',
  'create.submit': 'Iniciar fotos',
  'success.title': 'Relatório gerado!',
  'success.download': 'Baixar PDF',
  'success.back': 'Voltar ao início',
  'profil.logout': 'Sair',
};

const RU: Partial<Translations> = {
  'app.name': 'Jeety Focus',
  'nav.chantiers': 'Мои объекты',
  'nav.rapports': 'Свободные отчёты',
  'nav.profil': 'Мой профиль',
  'search.placeholder': 'Поиск...',
  'login.title': 'Вход',
  'login.email': 'Email',
  'login.password': 'Пароль',
  'login.submit': 'Войти',
  'camera.instruction': 'Кадрируйте и сделайте фото',
  'camera.capture': 'Сделать фото',
  'create.phase.avant': 'До работ',
  'create.phase.apres': 'После работ',
  'create.submit': 'Начать фото',
  'success.title': 'Отчёт создан!',
  'success.download': 'Скачать PDF',
  'success.back': 'На главную',
  'profil.logout': 'Выйти',
};

const UK: Partial<Translations> = {
  'app.name': 'Jeety Focus',
  'nav.chantiers': 'Мої об\'єкти',
  'nav.rapports': 'Вільні звіти',
  'nav.profil': 'Мій профіль',
  'search.placeholder': 'Пошук...',
  'login.title': 'Вхід',
  'login.email': 'Email',
  'login.password': 'Пароль',
  'login.submit': 'Увійти',
  'camera.instruction': 'Кадруйте та зробіть фото',
  'camera.capture': 'Зробити фото',
  'create.phase.avant': 'До робіт',
  'create.phase.apres': 'Після робіт',
  'create.submit': 'Почати фото',
  'success.title': 'Звіт створено!',
  'success.download': 'Завантажити PDF',
  'success.back': 'На головну',
  'profil.logout': 'Вийти',
};

const RO: Partial<Translations> = {
  'app.name': 'Jeety Focus',
  'nav.chantiers': 'Șantierele mele',
  'nav.rapports': 'Rapoarte libere',
  'nav.profil': 'Profilul meu',
  'search.placeholder': 'Căutare...',
  'login.title': 'Autentificare',
  'login.email': 'Email',
  'login.password': 'Parolă',
  'login.submit': 'Conectare',
  'camera.instruction': 'Încadrați și faceți fotografia',
  'camera.capture': 'Faceți fotografia',
  'create.phase.avant': 'Înainte de lucrări',
  'create.phase.apres': 'După lucrări',
  'create.submit': 'Începeți fotografiile',
  'success.title': 'Raport generat!',
  'success.download': 'Descărcați PDF',
  'success.back': 'Înapoi la start',
  'profil.logout': 'Deconectare',
};

const TR: Partial<Translations> = {
  'app.name': 'Jeety Focus',
  'nav.chantiers': 'Şantiyelerim',
  'nav.rapports': 'Serbest raporlar',
  'nav.profil': 'Profilim',
  'search.placeholder': 'Ara...',
  'login.title': 'Giriş',
  'login.email': 'E-posta',
  'login.password': 'Şifre',
  'login.submit': 'Giriş yap',
  'camera.instruction': 'Çerçeveleyin ve fotoğraf çekin',
  'camera.capture': 'Fotoğraf çek',
  'create.phase.avant': 'Çalışmadan önce',
  'create.phase.apres': 'Çalışmadan sonra',
  'create.submit': 'Fotoğraf çekmeye başla',
  'success.title': 'Rapor oluşturuldu!',
  'success.download': 'PDF İndir',
  'success.back': 'Ana sayfaya dön',
  'profil.logout': 'Çıkış yap',
};

const TRANSLATIONS: Record<Lang, Partial<Translations>> = {
  fr: FR,
  en: EN,
  es: ES,
  pt: PT,
  ru: RU,
  uk: UK,
  ro: RO,
  tr: TR,
};

/** Translate a key for the given language (falls back to FR) */
export function t(key: TranslationKey, lang: Lang = 'fr'): string {
  return TRANSLATIONS[lang]?.[key] ?? FR[key] ?? key;
}
