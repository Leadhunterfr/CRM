
import React, { useState, useEffect, useCallback } from "react";
import { Contact } from "@/entities/Contact";
import { Interaction } from "@/entities/Interaction";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Plus, 
  Mail, 
  Phone, 
  Building2, 
  DollarSign,
  TrendingUp,
  Eye,
  Users,
  BarChart3,
  MessageSquare,
  Flame,
  Snowflake,
  Search,
  Filter,
  Edit,
  Trash2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ContactDetails from "../components/contacts/ContactDetails";
import QuickInteractionDialog from "../components/pipeline/QuickInteractionDialog";

const PIPELINE_STAGES = [
  { id: "Prospect", name: "Prospects", color: "bg-yellow-500", count: 0 },
  { id: "Contacté", name: "Contactés", color: "bg-blue-500", count: 0 },
  { id: "Qualifié", name: "Qualifiés", color: "bg-purple-500", count: 0 },
  { id: "Proposition", name: "Propositions", color: "bg-orange-500", count: 0 },
  { id: "Négociation", name: "Négociations", color: "bg-indigo-500", count: 0 },
  { id: "Client", name: "Clients", color: "bg-green-500", count: 0 },
  { id: "Perdu", name: "Perdus", color: "bg-red-500", count: 0 }
];

const temperatureColors = {
  Chaud: "bg-red-500",
  Tiède: "bg-orange-500",
  Froid: "bg-blue-500"
};

const temperatureIcons = {
  Chaud: <Flame className="w-3 h-3" />,
  Tiède: <TrendingUp className="w-3 h-3" />,
  Froid: <Snowflake className="w-3 h-3" />
};

export default function PipelinePage() {
  const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showQuickInteraction, setShowQuickInteraction] = useState(false);
  const [interactionContact, setInteractionContact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stages, setStages] = useState(PIPELINE_STAGES);
  const [searchQuery, setSearchQuery] = useState("");
  const [temperatureFilter, setTemperatureFilter] = useState("tous");

  const updateStageCounts = useCallback(() => {
    const updatedStages = stages.map(stage => ({
      ...stage,
      count: filteredContacts.filter(contact => contact.statut === stage.id).length
    }));
    setStages(updatedStages);
  }, [filteredContacts, stages]);

  const applyFilters = useCallback(() => {
    let filtered = [...contacts];

    // Recherche textuelle
    if (searchQuery) {
      filtered = filtered.filter(contact => 
        `${contact.prenom || ''} ${contact.nom || ''}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.societe?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filtre température
    if (temperatureFilter !== "tous") {
      filtered = filtered.filter(contact => contact.temperature === temperatureFilter);
    }

    setFilteredContacts(filtered);
  }, [contacts, searchQuery, temperatureFilter]);

  useEffect(() => {
    loadContacts();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  useEffect(() => {
    updateStageCounts();
  }, [updateStageCounts]);

  const loadContacts = async () => {
    setLoading(true);
    try {
      const data = await Contact.list("-updated_date");
      setContacts(data);
    } catch (error) {
      console.error("Erreur lors du chargement des contacts:", error);
    }
    setLoading(false);
  };

  const handleStatusChange = async (contactId, newStatus) => {
    try {
      const contact = contacts.find(c => c.id === contactId);
      if (!contact) return;

      await Contact.update(contactId, {
        statut: newStatus,
        derniere_interaction: new Date().toISOString()
      });

      // Créer une interaction
      await Interaction.create({
        contact_id: contactId,
        type: "Modification",
        description: `Contact déplacé de "${contact.statut}" vers "${newStatus}"`,
        date_interaction: new Date().toISOString(),
        statut_precedent: contact.statut,
        statut_actuel: newStatus
      });

      // Mettre à jour l'état local
      setContacts(contacts.map(c => 
        c.id === contactId ? { ...c, statut: newStatus } : c
      ));
    } catch (error) {
      console.error("Erreur lors du changement de statut:", error);
    }
  };

  const handleViewContact = (contact) => {
    setSelectedContact(contact);
    setShowDetails(true);
  };

  const handleAddInteraction = (contact) => {
    setInteractionContact(contact);
    setShowQuickInteraction(true);
  };

  const handleInteractionAdded = (interaction) => {
    setContacts(contacts.map(c => 
      c.id === interaction.contact_id 
        ? { ...c, derniere_interaction: interaction.date_interaction }
        : c
    ));
    setShowQuickInteraction(false);
    setInteractionContact(null);
    loadContacts();
  };

  const handleDeleteContact = async (contactId) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce contact ?")) {
      try {
        await Contact.delete(contactId);
        setContacts(contacts.filter(c => c.id !== contactId));
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
      }
    }
  };

  const getTotalValue = () => {
    return filteredContacts
      .filter(c => c.statut !== "Perdu")
      .reduce((sum, contact) => sum + (contact.valeur_estimee || 0), 0);
  };

  return (
    <div className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              Pipeline de vente
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Visualisez et gérez vos opportunités par étape
            </p>
          </div>
        </div>

        {/* Métriques globales */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Total contacts</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {filteredContacts.length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-500 bg-opacity-20 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Valeur totale du pipeline</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                    {getTotalValue().toLocaleString()} €
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-500 bg-opacity-20 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtres */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Rechercher par nom, société, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-3">
              <Filter className="w-4 h-4 text-slate-500" />
              <Select value={temperatureFilter} onValueChange={setTemperatureFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filtrer par température" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tous">Toutes températures</SelectItem>
                  <SelectItem value="Chaud">🔥 Chaud</SelectItem>
                  <SelectItem value="Tiède">🔶 Tiède</SelectItem>
                  <SelectItem value="Froid">❄️ Froid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Pipeline par étapes - Vue en lignes */}
        <div className="space-y-8">
          {stages.map((stage) => {
            const stageContacts = filteredContacts.filter(contact => contact.statut === stage.id);
            
            return (
              <Card key={stage.id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 ${stage.color} rounded-full`} />
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                        {stage.name}
                      </h3>
                      <Badge variant="secondary">{stage.count}</Badge>
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      Valeur: {stageContacts
                        .reduce((sum, c) => sum + (c.valeur_estimee || 0), 0)
                        .toLocaleString()} €
                    </div>
                  </div>
                </div>

                <CardContent className="p-4">
                  {stageContacts.length === 0 ? (
                    <div className="text-center py-8 text-slate-400">
                      <BarChart3 className="w-12 h-12 mx-auto mb-2" />
                      <p className="text-sm">Aucun contact dans cette étape</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {stageContacts.map((contact, index) => (
                        <motion.div
                          key={contact.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="group"
                        >
                          <Card className="bg-slate-50 dark:bg-slate-700 hover:shadow-md transition-all duration-200">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-medium text-sm">
                                    {contact.prenom ? contact.prenom.charAt(0).toUpperCase() : 
                                     contact.nom ? contact.nom.charAt(0).toUpperCase() : "?"}
                                    {contact.nom && contact.prenom ? contact.nom.charAt(0).toUpperCase() : ""}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <h4 className="font-medium text-slate-900 dark:text-slate-100 text-sm truncate">
                                      {contact.prenom && contact.nom ? `${contact.prenom} ${contact.nom}` : 
                                       contact.nom || "Contact sans nom"}
                                    </h4>
                                    {contact.fonction && (
                                      <p className="text-xs text-slate-500 truncate">
                                        {contact.fonction}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={() => handleViewContact(contact)}
                                    title="Voir les détails"
                                  >
                                    <Eye className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={() => handleAddInteraction(contact)}
                                    title="Ajouter une interaction"
                                  >
                                    <MessageSquare className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>

                              {contact.societe && (
                                <div className="flex items-center gap-2 mb-2">
                                  <Building2 className="w-3 h-3 text-slate-400" />
                                  <span className="text-sm text-slate-600 dark:text-slate-400 truncate">
                                    {contact.societe}
                                  </span>
                                </div>
                              )}

                              <div className="flex items-center gap-2 mb-3">
                                <Mail className="w-3 h-3 text-slate-400" />
                                <span className="text-sm text-slate-600 dark:text-slate-400 truncate">
                                  {contact.email}
                                </span>
                              </div>

                              {contact.valeur_estimee && (
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-1">
                                    <DollarSign className="w-3 h-3 text-green-500" />
                                    <span className="text-sm font-medium text-green-600">
                                      {contact.valeur_estimee.toLocaleString()} €
                                    </span>
                                  </div>
                                  {contact.temperature && (
                                    <Badge variant="outline" className={`flex items-center gap-1 ${temperatureColors[contact.temperature]} text-white border-0 text-xs`}>
                                      {temperatureIcons[contact.temperature]}
                                      {contact.temperature}
                                    </Badge>
                                  )}
                                </div>
                              )}

                              {/* Actions de changement de statut */}
                              <div className="flex flex-wrap gap-1 mt-3">
                                {PIPELINE_STAGES
                                  .filter(s => s.id !== contact.statut)
                                  .slice(0, 3)
                                  .map(targetStage => (
                                    <Button
                                      key={targetStage.id}
                                      variant="outline"
                                      size="sm"
                                      className="text-xs h-6"
                                      onClick={() => handleStatusChange(contact.id, targetStage.id)}
                                    >
                                      → {targetStage.name}
                                    </Button>
                                  ))}
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showDetails && selectedContact && (
          <ContactDetails
            contact={selectedContact}
            onClose={() => {
              setShowDetails(false);
              setSelectedContact(null);
            }}
            onEdit={() => {
              setShowDetails(false);
            }}
            onDelete={handleDeleteContact}
          />
        )}

        {showQuickInteraction && interactionContact && (
          <QuickInteractionDialog
            contact={interactionContact}
            onClose={() => {
              setShowQuickInteraction(false);
              setInteractionContact(null);
            }}
            onInteractionAdded={handleInteractionAdded}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
