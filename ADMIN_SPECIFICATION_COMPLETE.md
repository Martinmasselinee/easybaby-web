# 🎯 **SPÉCIFICATION COMPLÈTE : ADMIN EASYBABY 100% FONCTIONNEL**

## 📋 **PRINCIPE FONDAMENTAL : ZÉRO HARDCODED DATA**

L'admin démarre **COMPLÈTEMENT VIDE**. L'utilisateur doit tout créer depuis zéro dans l'ordre logique :
1. **Ville** → 2. **Hôtel** → 3. **Produit** → 4. **Stock** → 5. **Test user flow**

Aucune donnée factice, aucun fallback, aucune demo data. Si rien n'est créé côté admin, le user side affiche des pages vides.

---

## 🏗️ **STRUCTURE ADMIN (6 SECTIONS)**

### **📊 1. TABLEAU DE BORD**
#### **État initial (admin vide) :**
- Message de bienvenue : "Créez votre première ville pour commencer"
- Toutes les métriques à zéro
- Liens directs vers création ville/hôtel/produit

#### **Une fois données créées :**
- **Revenus temps réel** : Somme exacte des paiements Stripe validés
- **Nouvelles réservations** : Dernières 5 réservations avec refresh temps réel
- **Alertes stock** : Produits en rupture ou stock < 2 unités
- **Métriques rapides** :
  - Nombre total villes, hôtels, produits, réservations
  - CA du mois en cours vs mois précédent
  - Top 3 produits les plus réservés
  - Top 3 villes les plus actives

---

### **🏙️ 2. GESTION DES VILLES**

#### **CRÉATION VILLE (OBLIGATOIRE POUR DÉMARRER)**
**Formulaire de création :**
- **Nom** : Texte libre (ex: "Paris", "Lyon")
- **Slug** : Auto-généré depuis nom, éditable, unique, format URL (ex: "paris", "lyon")
- **Validation** : Nom obligatoire, slug unique dans DB

**Actions disponibles :**
- ✅ **Créer** : Première action obligatoire pour avoir une app fonctionnelle
- ✅ **Éditer** : Modifier nom/slug (avec validation unicité)
- ✅ **Supprimer** : Seulement si aucun hôtel associé
- ✅ **Voir détails** : Liste hôtels + stats réservations pour cette ville

#### **Vue liste villes :**
| Nom | Slug | Nb Hôtels | Nb Produits Dispo | Total Réservations | Actions |
|-----|------|-----------|-------------------|-------------------|---------|
| Paris | paris | 3 | 12 | 45 | Voir/Éditer/Suppr |

**État vide :** Message "Aucune ville créée. Créez votre première ville pour commencer l'app."

---

### **🏨 3. GESTION DES HÔTELS**

#### **CRÉATION HÔTEL (APRÈS VILLE)**
**Formulaire complet obligatoire :**
- **Nom** : Nom de l'hôtel (ex: "Hôtel Plaza")
- **Adresse complète** : Adresse physique
- **Email** : Email de contact hôtel (obligatoire)
- **Téléphone** : Numéro contact (optionnel)
- **Nom du contact** : Personne responsable (optionnel)
- **Ville** : Dropdown des villes créées (obligatoire)

**Code de réduction hôtel (système complet) :**
- **Code** : Texte libre, unique globalement (ex: "PLAZA10", "WELCOME")
- **Type de partage** :
  - `PLATFORM_70` : EasyBaby 70% / Hôtel 30%
  - `HOTEL_70` : Hôtel 70% / EasyBaby 30%
- **Statut** : Actif/Inactif (toggle)
- **Validation** : Code unique, pas de doublons entre hôtels

#### **DÉTAIL HÔTEL (PAGE COMPLÈTE)**
**Onglet 1 : Informations**
- Toutes les infos hôtel éditables en mode formulaire
- Gestion code de réduction avec historique d'utilisation
- Statistiques : Nb réservations, CA généré, note moyenne

**Onglet 2 : Stock & Inventaire**
- Liste produits disponibles dans cet hôtel
- Pour chaque produit : Quantité totale, Quantité disponible maintenant
- Bouton "Ajouter produit au stock" → Dropdown produits + quantité
- Alerte si stock < 2 unités

**Onglet 3 : Réservations**
- Toutes réservations pickup/drop dans cet hôtel
- Filtres : Date, statut, produit
- Actions : Voir détail, marquer terminé/endommagé

**Onglet 4 : Revenus**
- CA total généré par hôtel
- Détail partage selon codes utilisés
- Graphique évolution mensuelle

#### **Vue liste hôtels :**
| Nom | Ville | Email | Contact | Code Réduction | Stock | Réservations | Actions |
|-----|-------|-------|---------|----------------|-------|-------------|---------|
| Plaza | Paris | hotel@plaza.com | Jean Dupont | PLAZA10 (70%) | 15 prod | 12 actives | Gérer |

**État vide :** "Aucun hôtel créé. Créez votre premier hôtel dans une ville existante."

---

### **📦 4. GESTION DES PRODUITS**

#### **CRÉATION PRODUIT**
**Formulaire détaillé :**
- **Nom** : Nom du produit (ex: "Poussette Premium")
- **Description** : Texte libre détaillé
- **Image URL** : URL image produit (optionnel)
- **Prix par heure** : En centimes (ex: 500 = 5€/h)
- **Prix par jour** : En centimes (ex: 2000 = 20€/jour)
- **Caution** : En centimes (ex: 5000 = 50€ de caution)

**Validation stricte :**
- Nom obligatoire et unique
- Prix > 0
- Caution >= 0

#### **DÉTAIL PRODUIT**
- **Informations éditables** : Tous les champs modifiables
- **Disponibilité par hôtel** : Tableau stock dans chaque hôtel
- **Historique réservations** : Toutes les fois où ce produit a été réservé
- **Statistiques** : Taux d'occupation, CA généré, durée moyenne location
- **Photos** : Galerie images si URLs multiples

#### **Vue liste produits :**
| Nom | Prix/jour | Caution | Stock Total | Réservations Actives | Disponibilité | Actions |
|-----|-----------|---------|-------------|---------------------|---------------|---------|
| Poussette | 20€ | 50€ | 25 | 3 | 22 libres | Éditer/Voir |

**État vide :** "Aucun produit créé. Créez votre catalogue de produits."

---

### **📊 5. STOCK & INVENTAIRE**

#### **GESTION STOCK PAR HÔTEL**
**Vue globale :**
- Tableau croisé : Hôtels en lignes × Produits en colonnes
- Chaque cellule : Quantité disponible / Quantité totale
- Codes couleur : Vert (>5), Orange (2-5), Rouge (<2), Gris (0)

**Actions stock :**
- **Ajouter stock** : Hôtel + Produit + Quantité
- **Modifier quantité** : Ajuster stock existant
- **Retirer produit** : Supprimer complètement un produit d'un hôtel

#### **ALERTES AUTOMATIQUES**
- **Stock bas** : Notification quand < 2 unités
- **Rupture** : Alerte email quand stock = 0
- **Surstockage** : Alerte si > 20 unités non utilisées depuis 30j

#### **Vue détaillée par produit :**
| Hôtel | Ville | Stock Total | Disponible | Réservé | En maintenance | Actions |
|-------|-------|-------------|------------|---------|----------------|---------|
| Plaza | Paris | 5 | 3 | 2 | 0 | Modifier |

**État vide :** "Aucun stock configuré. Ajoutez des produits dans vos hôtels."

---

### **🎫 6. RÉSERVATIONS & RAPPORTS**

#### **TABLEAU RÉSERVATIONS TEMPS RÉEL**
**Colonnes complètes :**
- **Code** : Code unique réservation (ex: "R-ABC123")
- **Date création** : Timestamp de la réservation
- **Client** : Email + téléphone
- **Ville** : Ville de la réservation
- **Hôtel pickup** : Où récupérer
- **Hôtel drop** : Où rendre
- **Produit** : Nom du produit réservé
- **Dates** : Période début → fin
- **Durée** : Nb heures + nb jours
- **Prix final** : Montant payé (après réductions)
- **Caution** : Montant de la caution
- **Code réduction** : Code utilisé (si applicable)
- **Partage revenus** : 70/30 ou 30/70
- **Statut** : PENDING → CONFIRMED → COMPLETED
- **Paiement Stripe** : ID transaction

#### **DÉTAIL RÉSERVATION**
**Informations client :**
- Email, téléphone, nom (récupéré de Stripe)
- Historique des réservations de ce client

**Détails logistiques :**
- Hôtels pickup/drop avec contacts
- Produit avec photos et caractéristiques
- Instructions spéciales (si champ ajouté)

**Gestion financière :**
- Montant total, détail prix + caution
- Partage revenus calculé automatiquement
- Statut paiement Stripe en temps réel

**Actions admin :**
- **Marquer terminé** : Changer statut CONFIRMED → COMPLETED
- **Signaler dommage** : Popup avec détails + photos
- **Signaler vol** : Marquer produit comme volé
- **Contacter client** : Liens email/téléphone directs
- **Contacter hôtel** : Liens vers hôtels pickup/drop

#### **RAPPORTS FINANCIERS AUTOMATIQUES**
**Revenus temps réel :**
- **CA total** : Somme exacte des paiements Stripe validés
- **Part EasyBaby** : Calcul automatique selon codes réduction
- **Part hôtels** : Répartition par hôtel avec détails
- **Évolution** : Graphiques jour/semaine/mois/année

**Analytics avancées :**
- **Produits populaires** : Classement par nb réservations
- **Villes performantes** : CA par ville
- **Durées moyennes** : Statistiques durée de location
- **Codes réduction** : Utilisation et impact sur revenus
- **Saisonnalité** : Tendances temporelles

**Exports :**
- **CSV réservations** : Export Excel avec tous les détails
- **Rapport financier PDF** : Rapport mensuel automatique
- **Données hôtels** : Export pour comptabilité partenaires

---

## 🔄 **FLUX DE DONNÉES TEMPS RÉEL**

### **SYNCHRONISATION AUTOMATIQUE**
1. **User fait réservation** → Stripe valide → Stock mis à jour → Admin notifié
2. **Admin modifie stock** → Disponibilités user mises à jour instantanément
3. **Admin marque réservation terminée** → Stock libéré → Calculs revenus actualisés

### **PRÉVENTION DES CONFLITS**
- **Double réservation** : Vérification stock en temps réel avant validation
- **Modification simultanée** : Lock optimiste sur les modifications stock
- **Cohérence données** : Validation contraintes DB à chaque écriture

---

## 🚀 **PARCOURS TEST ADMIN COMPLET**

### **ÉTAPE 1 : ADMIN VIDE**
- Tableau de bord : "Créez votre première ville"
- Toutes les sections : Messages d'état vide
- User side : Pages vides (aucune ville disponible)

### **ÉTAPE 2 : PREMIÈRE VILLE**
1. Admin crée "Paris" (slug: paris)
2. User side affiche Paris mais "Aucun produit disponible"

### **ÉTAPE 3 : PREMIER HÔTEL**
1. Admin crée "Hôtel Plaza" à Paris avec email + code réduction "PLAZA10"
2. User side affiche Paris mais toujours "Aucun produit"

### **ÉTAPE 4 : PREMIER PRODUIT**
1. Admin crée "Poussette Premium" (20€/jour, 50€ caution)
2. User side affiche Paris mais "Aucun produit dans les hôtels"

### **ÉTAPE 5 : PREMIER STOCK**
1. Admin ajoute 5 poussettes au Plaza
2. User side affiche enfin : Paris → Poussette → Hôtel Plaza disponible

### **ÉTAPE 6 : PREMIÈRE RÉSERVATION**
1. User fait réservation complète avec paiement
2. Admin voit nouvelle réservation en temps réel
3. Stock passe à 4 automatiquement
4. Revenus calculés et affichés

### **ÉTAPE 7 : GESTION COMPLÈTE**
1. Admin peut marquer réservation terminée
2. Stock revient à 5
3. Statistiques mises à jour
4. Rapports financiers précis

---

## ✅ **CRITÈRES DE SUCCÈS**

### **FONCTIONNALITÉ**
- ✅ Admin peut créer tout depuis zéro
- ✅ User flow fonctionne avec données admin
- ✅ Aucune donnée hardcodée nulle part
- ✅ Synchronisation temps réel parfaite
- ✅ Calculs financiers exacts
- ✅ Gestion stock cohérente

### **ROBUSTESSE**
- ✅ Validation stricte à chaque étape
- ✅ Messages d'erreur clairs
- ✅ Gestion des cas limites
- ✅ Performance optimisée
- ✅ Interface responsive
- ✅ Sécurité admin protégée

### **EXPÉRIENCE UTILISATEUR**
- ✅ Workflow logique et intuitif
- ✅ Feedback visuel immédiat
- ✅ États de chargement appropriés
- ✅ Messages de confirmation
- ✅ Shortcuts et efficacité
- ✅ Design cohérent et professionnel

**RÉSULTAT FINAL : Un admin 100% fonctionnel qui permet de gérer une vraie app de location d'équipements bébé sans aucune donnée factice !**
