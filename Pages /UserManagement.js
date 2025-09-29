
import React, { useState, useEffect } from "react";
import { User } from "@/entities/User";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Users, 
  Shield, 
  Search, 
  Settings, 
  Calendar,
  Phone,
  Mail,
  Building2,
  Crown,
  User as UserIcon,
  Clock,
  CheckCircle,
  XCircle
} from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const filterUsers = React.useCallback(() => {
    let filtered = [...users];

    if (searchQuery) {
      filtered = filtered.filter(user => 
        user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.department?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (roleFilter !== "all") {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    setFilteredUsers(filtered);
  }, [users, searchQuery, roleFilter]);

  useEffect(() => {
    loadUsers();
    loadCurrentUser();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [filterUsers]);

  const loadCurrentUser = async () => {
    try {
      const userData = await User.me();
      setCurrentUser(userData);
    } catch (error) {
      console.error("Erreur lors du chargement de l'utilisateur actuel:", error);
    }
  };

  const loadUsers = async () => {
    setLoading(true);
    try {
      const allUsers = await User.list("-last_seen");
      setUsers(allUsers);
    } catch (error) {
      console.error("Erreur lors du chargement des utilisateurs:", error);
    }
    setLoading(false);
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await User.update(userId, { role: newRole });
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));
    } catch (error) {
      console.error("Erreur lors de la modification du rôle:", error);
    }
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowUserDetails(true);
  };

  const getRoleColor = (role) => {
    return role === 'admin' 
      ? "bg-orange-100 text-orange-800 border-orange-200"
      : "bg-blue-100 text-blue-800 border-blue-200";
  };

  const getRoleIcon = (role) => {
    return role === 'admin' ? Crown : UserIcon;
  };

  const getLastSeenStatus = (lastSeen) => {
    if (!lastSeen) return { text: "Jamais connecté", color: "text-gray-500", icon: XCircle };
    
    const now = new Date();
    const lastSeenDate = new Date(lastSeen);
    const diffInMinutes = (now - lastSeenDate) / (1000 * 60);
    
    if (diffInMinutes < 5) {
      return { text: "En ligne", color: "text-green-600", icon: CheckCircle };
    } else if (diffInMinutes < 60) {
      return { text: `Il y a ${Math.floor(diffInMinutes)} min`, color: "text-blue-600", icon: Clock };
    } else if (diffInMinutes < 1440) {
      return { text: `Il y a ${Math.floor(diffInMinutes / 60)}h`, color: "text-yellow-600", icon: Clock };
    } else {
      return { 
        text: format(lastSeenDate, 'dd MMM yyyy', { locale: fr }), 
        color: "text-gray-500", 
        icon: Clock 
      };
    }
  };

  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === 'admin').length,
    users: users.filter(u => u.role === 'user').length,
    online: users.filter(u => {
      if (!u.last_seen) return false;
      const diffInMinutes = (new Date() - new Date(u.last_seen)) / (1000 * 60);
      return diffInMinutes < 5;
    }).length
  };

  return (
    <div className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-3">
              <Shield className="w-8 h-8 text-orange-500" />
              Gestion des utilisateurs
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Gérez les rôles et permissions des membres de votre équipe
            </p>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Total utilisateurs</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-blue-500 bg-opacity-20 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Administrateurs</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.admins}</p>
              </div>
              <div className="w-12 h-12 bg-orange-500 bg-opacity-20 rounded-xl flex items-center justify-center">
                <Crown className="w-6 h-6 text-orange-500" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Utilisateurs</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.users}</p>
              </div>
              <div className="w-12 h-12 bg-blue-500 bg-opacity-20 rounded-xl flex items-center justify-center">
                <UserIcon className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">En ligne</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.online}</p>
              </div>
              <div className="w-12 h-12 bg-green-500 bg-opacity-20 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Filtres et recherche */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Rechercher par nom, email ou département..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrer par rôle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les rôles</SelectItem>
                <SelectItem value="admin">Administrateurs</SelectItem>
                <SelectItem value="user">Utilisateurs</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tableau des utilisateurs */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="p-6">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">
              {filteredUsers.length} utilisateur{filteredUsers.length > 1 ? 's' : ''}
            </h3>

            {loading ? (
              <div className="space-y-4">
                {Array(5).fill(0).map((_, i) => (
                  <div key={i} className="animate-pulse flex gap-4 items-center">
                    <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
                      <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 dark:bg-slate-700/50">
                      <TableHead className="font-semibold">Utilisateur</TableHead>
                      <TableHead className="font-semibold">Email</TableHead>
                      <TableHead className="font-semibold">Rôle</TableHead>
                      <TableHead className="font-semibold">Département</TableHead>
                      <TableHead className="font-semibold">Statut</TableHead>
                      <TableHead className="font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user, index) => {
                      const RoleIcon = getRoleIcon(user.role);
                      const lastSeenStatus = getLastSeenStatus(user.last_seen);
                      const StatusIcon = lastSeenStatus.icon;

                      return (
                        <motion.tr
                          key={user.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
                        >
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                                {user.full_name ? user.full_name.split(' ').map(n => n[0]).join('') : 'U'}
                              </div>
                              <div>
                                <div className="font-medium text-slate-900 dark:text-slate-100">
                                  {user.full_name || 'Utilisateur'}
                                  {user.id === currentUser?.id && (
                                    <Badge variant="outline" className="ml-2 text-xs">Vous</Badge>
                                  )}
                                </div>
                                {user.phone && (
                                  <div className="text-sm text-slate-500 flex items-center gap-1">
                                    <Phone className="w-3 h-3" />
                                    {user.phone}
                                  </div>
                                )}
                              </div>
                            </div>
                          </TableCell>

                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4 text-slate-400" />
                              <span className="text-slate-700 dark:text-slate-300">{user.email}</span>
                            </div>
                          </TableCell>

                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Badge className={getRoleColor(user.role)} variant="outline">
                                <RoleIcon className="w-3 h-3 mr-1" />
                                {user.role === 'admin' ? 'Administrateur' : 'Utilisateur'}
                              </Badge>
                            </div>
                          </TableCell>

                          <TableCell>
                            {user.department ? (
                              <div className="flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-slate-400" />
                                <span>{user.department}</span>
                              </div>
                            ) : (
                              <span className="text-slate-400">Non renseigné</span>
                            )}
                          </TableCell>

                          <TableCell>
                            <div className={`flex items-center gap-2 ${lastSeenStatus.color}`}>
                              <StatusIcon className="w-4 h-4" />
                              <span className="text-sm">{lastSeenStatus.text}</span>
                            </div>
                          </TableCell>

                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewUser(user)}
                              >
                                <Settings className="w-4 h-4 mr-1" />
                                Détails
                              </Button>
                              
                              {user.id !== currentUser?.id && (
                                <Select
                                  value={user.role}
                                  onValueChange={(value) => handleRoleChange(user.id, value)}
                                >
                                  <SelectTrigger className="w-32">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="user">Utilisateur</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                  </SelectContent>
                                </Select>
                              )}
                            </div>
                          </TableCell>
                        </motion.tr>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>

        {/* Modal détails utilisateur */}
        {showUserDetails && selectedUser && (
          <Dialog open={true} onOpenChange={() => setShowUserDetails(false)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                    {selectedUser.full_name ? selectedUser.full_name.split(' ').map(n => n[0]).join('') : 'U'}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{selectedUser.full_name}</h3>
                    <p className="text-sm text-slate-600">{selectedUser.email}</p>
                  </div>
                </DialogTitle>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Informations générales</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <span className="text-sm text-slate-600">Rôle:</span>
                      <Badge className={`ml-2 ${getRoleColor(selectedUser.role)}`}>
                        {selectedUser.role === 'admin' ? 'Administrateur' : 'Utilisateur'}
                      </Badge>
                    </div>
                    {selectedUser.department && (
                      <div>
                        <span className="text-sm text-slate-600">Département:</span>
                        <span className="ml-2 font-medium">{selectedUser.department}</span>
                      </div>
                    )}
                    {selectedUser.phone && (
                      <div>
                        <span className="text-sm text-slate-600">Téléphone:</span>
                        <span className="ml-2 font-medium">{selectedUser.phone}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Activité</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <span className="text-sm text-slate-600">Inscription:</span>
                      <span className="ml-2 font-medium">
                        {format(new Date(selectedUser.created_date), 'dd MMM yyyy', { locale: fr })}
                      </span>
                    </div>
                    {selectedUser.last_seen && (
                      <div>
                        <span className="text-sm text-slate-600">Dernière connexion:</span>
                        <span className="ml-2 font-medium">
                          {format(new Date(selectedUser.last_seen), 'dd MMM yyyy à HH:mm', { locale: fr })}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}
