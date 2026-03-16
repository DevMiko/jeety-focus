// ─── Jeety Focus Utils ────────────────────────────────────────────────────────
// Fonctions utilitaires (même pattern que src/tools/jdtools.js dans entarapp5)

const JeetyTools = {
  /**
   * Nom du mois en français
   */
  monthName(month: number): string {
    const months: Record<number, string> = {
      1: 'Janvier', 2: 'Février', 3: 'Mars', 4: 'Avril',
      5: 'Mai', 6: 'Juin', 7: 'Juillet', 8: 'Août',
      9: 'Septembre', 10: 'Octobre', 11: 'Novembre', 12: 'Décembre',
    };
    return months[month] ?? '';
  },

  /**
   * Formater une date : "Aujourd'hui", jour de la semaine, ou date courte
   */
  formatDate(dt: Date): string {
    const now = new Date();
    if (dt.toDateString() === now.toDateString()) return "Aujourd'hui";

    const diffDays = Math.floor((now.getTime() - dt.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 7 && diffDays >= 0) {
      return dt.toLocaleDateString('fr-FR', { weekday: 'long' });
    }

    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    };
    if (dt.getFullYear() !== now.getFullYear()) {
      options.year = 'numeric';
    }
    return dt.toLocaleDateString('fr-FR', options);
  },

  /**
   * Format heure courte : "14:30"
   */
  formatTime(dt: Date): string {
    return dt.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  },

  /**
   * Format date + heure si aujourd'hui, sinon juste la date
   */
  formatDateSmart(dt: Date): string {
    const now = new Date();
    if (dt.toDateString() === now.toDateString()) {
      return JeetyTools.formatTime(dt);
    }
    return JeetyTools.formatDate(dt);
  },

  /**
   * Formater un numéro de téléphone : 0612345678 → 06 12 34 56 78
   */
  formatPhone(phone: string): string {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return cleaned.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
    }
    return phone;
  },
};

export default JeetyTools;
