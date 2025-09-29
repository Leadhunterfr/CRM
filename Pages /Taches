import React, { useState, useEffect } from "react";
import { Rappel } from "@/entities/Rappel";
import { Contact } from "@/entities/Contact";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  BellRing, 
  User, 
  Calendar, 
  Mail, 
  Phone, 
  Building2 
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import ContactDetails from "../components/contacts/ContactDetails";
import { AnimatePresence } from "framer-motion";

export default function TachesPage() {
  const [tasks, setTasks] = useState([]);
  const [contactsData, setContactsData] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const openTasks = await Rappel.filter({ completed: false }, "date_rappel");
      setTasks(openTasks);

      // Charger les données des contacts associés
      const contactIds = [...new Set(openTasks.map(t => t.contact_id))];
      const contacts = await Contact.filter({ id: { $in: contactIds } });
      const contactsMap = contacts.reduce((acc, contact) => {
        acc[contact.id] = contact;
        return acc;
      }, {});
      setContactsData(contactsMap);

    } catch (error) {
      console.error("Erreur lors du chargement des tâches:", error);
    }
    setLoading(false);
  };

  const handleTaskCompletion = async (taskId, isCompleted) => {
    try {
      await Rappel.update(taskId, { completed: isCompleted });
      setTasks(tasks.filter(t => t.id !== taskId)); // Remove from view
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la tâche:", error);
    }
  };

  const handleViewContact = (contact) => {
    setSelectedContact(contact);
    setShowDetails(true);
  };

  const getTaskTypeIcon = (type) => {
    const icons = {
      Appel: <Phone className="w-4 h-4 text-blue-500" />,
      Email: <Mail className="w-4 h-4 text-green-500" />,
      Autre: <BellRing className="w-4 h-4 text-purple-500" />,
    };
    return icons[type] || icons["Autre"];
  };

  return (
    <div className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-8 flex items-center gap-3">
          <BellRing className="w-8 h-8 text-blue-500" />
          Mes Tâches
        </h1>

        {loading ? (
          <p>Chargement des tâches...</p>
        ) : tasks.length === 0 ? (
          <div className="text-center py-16">
            <BellRing className="w-24 h-24 text-slate-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-700 dark:text-slate-300">C'est tout bon !</h2>
            <p className="text-slate-500 dark:text-slate-400">Vous n'avez aucune tâche en attente.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map(task => {
              const contact = contactsData[task.contact_id];
              return (
                <Card key={task.id} className="bg-white dark:bg-slate-800 shadow-sm hover:shadow-lg transition-shadow">
                  <CardContent className="p-4 flex items-start gap-4">
                    <div className="flex items-center h-full pt-1">
                      <Checkbox
                        id={`task-${task.id}`}
                        onCheckedChange={(checked) => handleTaskCompletion(task.id, checked)}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          {getTaskTypeIcon(task.type)}
                          <span className="font-medium">{task.type}</span>
                          <Badge variant="outline">
                            {format(new Date(task.date_rappel), 'dd MMM yyyy à HH:mm', { locale: fr })}
                          </Badge>
                        </div>
                        {contact && (
                          <Button variant="ghost" size="sm" onClick={() => handleViewContact(contact)}>
                            <User className="w-4 h-4 mr-2" />
                            Voir contact
                          </Button>
                        )}
                      </div>
                      <p className="my-2 text-slate-800 dark:text-slate-200">{task.note}</p>
                      {contact && (
                        <div className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4"/> 
                            <span>{contact.prenom} {contact.nom}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4"/> 
                            <span>{contact.societe}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showDetails && selectedContact && (
          <ContactDetails
            contact={selectedContact}
            onClose={() => {
              setShowDetails(false);
              setSelectedContact(null);
            }}
            onEdit={() => setShowDetails(false)}
            onDelete={() => setShowDetails(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
