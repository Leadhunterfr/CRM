import React, { useState, useEffect } from "react";
import { Contact } from "@/entities/Contact";
import { Interaction } from "@/entities/Interaction";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Upload,
  Eye,
  Edit,
  Trash2,
  Tag,
  Calendar
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";

import EnhancedContactTable from "../components/contacts/EnhancedContactTable";
import ContactForm from "../components/contacts/ContactForm";
import ContactDetails from "../components/contacts/ContactDetails";
import ContactFilters from "../components/contacts/ContactFilters";
import ImportExportDialog from "../components/contacts/ImportExportDialog";
import ColumnManager from "../components/contacts/ColumnManager";
import ChatSidebar from "../components/contacts/ChatSidebar";

const DEFAULT_COLUMNS = [
  { id: "prenom", label: "Prénom", visible: true, width: "150px", type: "text" },
  { id: "nom", label: "Nom", visible: true, width: "150px", type: "text" },
  { id: "societe", label: "Société", visible: true, width: "180px", type: "text" },
  { id: "email", label: "Email", visible: true, width: "220px", type: "email" },
  { id: "telephone", label: "Téléphone", visible: true, width: "150px", type: "text" },
  { id: "source", label: "Source", visible: true, width: "120px", type: "select" },
  { id: "statut", label: "Statut", visible: true, width: "120px", type: "select" },
  { id: "derniere_interaction", label: "Dernière interaction", visible: false, width: "150px", type: "date" },
  { id: "valeur_estimee", label: "Valeur estimée", visible: false, width: "130px", type: "number" },
  { id: "temperature", label: "Température", visible: true, width: "120px", type: "select" },
  { id: "adresse", label: "Adresse", visible: false, width: "200px", type: "text" },
  { id: "notes", label: "Notes", visible: false, width: "150px", type: "text" }
];

export default function ContactsPage() {
  const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [showContactForm, setShowContactForm] = useState(false);
  const [showContactDetails, setShowContactDetails] = useState(false);
  const [showImportExport, setShowImportExport] = useState(false);
  const [showColumnManager, setShowColumnManager] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    statut: "tous",
    source: "tous",
    tags: []
  });
  const [columns, setColumns] = useState(() => {
    const saved = localStorage.getItem('contacts-columns');
    return saved ? JSON.parse(saved) : DEFAULT_COLUMNS;
  });
  const [showChatSidebar, setShowChatSidebar] = useState(false);
  const [chatContact, setChatContact] = useState(null);

  const applyFilters = React.useCallback(() => {
    let filtered = [...contacts];

    if (searchQuery) {
      filtered = filtered.filter(contact => 
        `${contact.prenom || ''} ${contact.nom || ''}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.societe?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filters.statut !== "tous") {
      filtered = filtered.filter(contact => contact.statut === filters.statut);
    }

    if (filters.source !== "tous") {
      filtered = filtered.filter(contact => contact.source === filters.source);
    }

    setFilteredContacts(filtered);
  }, [contacts, searchQuery, filters]);

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

  useEffect(() => {
    loadContacts();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const handleColumnsChange = (newColumns) => {
    setColumns(newColumns);
    localStorage.setItem('contacts-columns', JSON.stringify(newColumns));
  };

  const handleCreateContact = async (contactData) => {
    try {
      const newContact = await Contact.create({
        ...contactData,
        derniere_interaction: new Date().toISOString()
      });
      
      await Interaction.create({
        contact_id: newContact.id,
        type: "Note",
        description: "Contact créé",
        date_interaction: new Date().toISOString()
      });

      setContacts([newContact, ...contacts]);
      setShowContactForm(false);
    } catch (error) {
      console.error("Erreur lors de la création:", error);
    }
  };

  const handleUpdateContact = async (contactId, updates) => {
    try {
      const oldContact = contacts.find(c => c.id === contactId);
      await Contact.update(contactId, {
        ...updates,
        derniere_interaction: new Date().toISOString()
      });

      if (oldContact.statut !== updates.statut) {
        await Interaction.create({
          contact_id: contactId,
          type: "Modification",
          description: `Statut changé de "${oldContact.statut}" à "${updates.statut}"`,
          date_interaction: new Date().toISOString(),
          statut_precedent: oldContact.statut,
          statut_actuel: updates.statut
        });
      }

      setContacts(contacts.map(contact => 
        contact.id === contactId ? { ...contact, ...updates } : contact
      ));
      setEditingContact(null);
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
    }
  };

  const handleDeleteContact = async (contactId) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce contact ?")) {
      try {
        await Contact.delete(contactId);
        setContacts(contacts.filter(c => c.id !== contactId));
        setSelectedContact(null);
        setShowContactDetails(false);
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
      }
    }
  };

  const handleViewDetails = (contact) => {
    setSelectedContact(contact);
    setShowContactDetails(true);
  };

  const handleOpenChat = (contact) => {
    setChatContact(contact);
    setShowChatSidebar(true);
  };

  return (
    <div className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              Contacts
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Gérez tous vos contacts et prospects
            </p>
          </div>
          
          <div className="flex gap-3 w-full md:w-auto">
            <Button
              variant="outline"
              onClick={() => setShowImportExport(true)}
              className="flex-1 md:flex-none"
            >
              <Upload className="w-4 h-4 mr-2" />
              Import/Export
            </Button>
            <Button 
              onClick={() => setShowContactForm(true)}
              className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nouveau contact
            </Button>
          </div>
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total contacts", value: contacts.length, color: "bg-blue-500" },
            { label: "Prospects", value: contacts.filter(c => c.statut === "Prospect").length, color: "bg-yellow-500" },
            { label: "Clients", value: contacts.filter(c => c.statut === "Client").length, color: "bg-green-500" },
            { label: "En négociation", value: contacts.filter(c => c.statut === "Négociation").length, color: "bg-purple-500" }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 ${stat.color} rounded-xl bg-opacity-20 flex items-center justify-center`}>
                  <div className={`w-6 h-6 ${stat.color} rounded`} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Barre de recherche et filtres */}
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
            <ContactFilters filters={filters} onFiltersChange={setFilters} />
          </div>
        </div>

        {/* Tableau des contacts amélioré */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
          <EnhancedContactTable
            contacts={filteredContacts}
            loading={loading}
            onView={handleViewDetails}
            onEdit={setEditingContact}
            onDelete={handleDeleteContact}
            onUpdate={handleUpdateContact}
            onOpenChat={handleOpenChat}
            columns={columns}
            onColumnManager={() => setShowColumnManager(true)}
          />
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showContactForm && (
          <ContactForm
            onClose={() => setShowContactForm(false)}
            onSave={handleCreateContact}
          />
        )}

        {editingContact && (
          <ContactForm
            contact={editingContact}
            onClose={() => setEditingContact(null)}
            onSave={(data) => handleUpdateContact(editingContact.id, data)}
          />
        )}

        {showContactDetails && selectedContact && (
          <ContactDetails
            contact={selectedContact}
            onClose={() => {
              setShowContactDetails(false);
              setSelectedContact(null);
            }}
            onEdit={() => {
              setEditingContact(selectedContact);
              setShowContactDetails(false);
            }}
            onDelete={handleDeleteContact}
          />
        )}

        {showImportExport && (
          <ImportExportDialog
            onClose={() => setShowImportExport(false)}
            contacts={filteredContacts}
            onImportComplete={loadContacts}
          />
        )}

        {showColumnManager && (
          <ColumnManager
            columns={columns}
            onColumnsChange={handleColumnsChange}
            onClose={() => setShowColumnManager(false)}
          />
        )}

        {showChatSidebar && chatContact && (
          <ChatSidebar
            contact={chatContact}
            onClose={() => {
              setShowChatSidebar(false);
              setChatContact(null);
            }}
            onInteractionAdded={loadContacts}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
