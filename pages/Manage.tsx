import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { generateId } from '../utils';
import { Requirement, Verifier, TrackingType } from '../types';
import { Plus, Trash2, Edit2, X, Save, AlertTriangle, Info } from 'lucide-react';

const Manage: React.FC = () => {
  const { state, dispatch } = useApp();
  const location = useLocation();
  
  const [activeTab, setActiveTab] = useState<'requirements' | 'verifiers'>('requirements');
  
  // États d'édition distincts pour éviter les conflits lors du changement d'onglet
  const [editingReqId, setEditingReqId] = useState<string | null>(null);
  const [editingVerId, setEditingVerId] = useState<string | null>(null);
  
  // État pour la confirmation de suppression
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; type: 'requirement' | 'verifier' } | null>(null);

  // État du formulaire Exigence
  const [reqForm, setReqForm] = useState<Omit<Requirement, 'id'>>({
    designation: '',
    description: '',
    lastDate: '',
    periodicityMonths: 12,
    verifierId: '',
    trackingType: 'PERIODIC',
  });

  // État du formulaire Vérificateur
  const [verForm, setVerForm] = useState<Omit<Verifier, 'id'>>({
    name: '',
    email: '',
    phone: '',
    isInternal: false,
  });

  // --- LOGIQUE REDIRECTION DASHBOARD ---
  // Surveille si on arrive depuis le Dashboard avec une demande d'édition
  useEffect(() => {
    if (location.state && location.state.editReqId) {
        // On s'assure d'être sur le bon onglet
        setActiveTab('requirements');
        
        // On cherche l'exigence
        const reqToEdit = state.requirements.find(r => r.id === location.state.editReqId);
        if (reqToEdit) {
            // On déclenche l'édition
            startEditReq(reqToEdit);
            
            // Scroll vers le formulaire pour l'UX
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        
        // Nettoyage de l'historique pour ne pas ré-ouvrir si on rafraîchit
        window.history.replaceState({}, document.title);
    }
  }, [location.state, state.requirements]);

  // Gestion des onglets : réinitialise les modes d'édition
  const handleTabChange = (tab: 'requirements' | 'verifiers') => {
    setActiveTab(tab);
    cancelEditReq();
    cancelEditVer();
  };

  // --- LOGIQUE EXIGENCES ---

  // Effet pour vérifier la cohérence du type de suivi
  useEffect(() => {
      const selectedVerifier = state.verifiers.find(v => v.id === reqForm.verifierId);
      // Si le vérificateur sélectionné n'est PAS interne, on force le mode Périodique
      if (selectedVerifier && !selectedVerifier.isInternal && reqForm.trackingType === 'CONTINUOUS') {
          setReqForm(prev => ({ ...prev, trackingType: 'PERIODIC' }));
      }
  }, [reqForm.verifierId, reqForm.trackingType, state.verifiers]);

  const handleReqSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanForm = {
        ...reqForm,
        // Si continu, on force la périodicité à 0 pour la propreté des données
        periodicityMonths: reqForm.trackingType === 'CONTINUOUS' ? 0 : reqForm.periodicityMonths
    };

    if (editingReqId) {
        dispatch({ type: 'UPDATE_REQUIREMENT', payload: { ...cleanForm, id: editingReqId } });
        setEditingReqId(null);
    } else {
        dispatch({ type: 'ADD_REQUIREMENT', payload: { ...cleanForm, id: generateId() } });
    }
    // Réinitialisation
    setReqForm({ 
        designation: '', 
        description: '', 
        lastDate: '', 
        periodicityMonths: 12, 
        verifierId: state.verifiers[0]?.id || '',
        trackingType: 'PERIODIC'
    });
  };

  const startEditReq = (req: Requirement) => {
      setEditingReqId(req.id);
      setReqForm({
          designation: req.designation,
          description: req.description,
          lastDate: req.lastDate,
          periodicityMonths: req.periodicityMonths,
          verifierId: req.verifierId,
          trackingType: req.trackingType || 'PERIODIC'
      });
  };

  const cancelEditReq = () => {
      setEditingReqId(null);
      setReqForm({ 
          designation: '', 
          description: '', 
          lastDate: '', 
          periodicityMonths: 12, 
          verifierId: '', 
          trackingType: 'PERIODIC' 
        });
  };

  // --- LOGIQUE VÉRIFICATEURS ---

  const handleVerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingVerId) {
        dispatch({ type: 'UPDATE_VERIFIER', payload: { ...verForm, id: editingVerId } });
        setEditingVerId(null);
    } else {
        dispatch({ type: 'ADD_VERIFIER', payload: { ...verForm, id: generateId() } });
    }
    setVerForm({ name: '', email: '', phone: '', isInternal: false });
  };

  const startEditVer = (ver: Verifier) => {
      setEditingVerId(ver.id);
      setVerForm({
          name: ver.name,
          email: ver.email,
          phone: ver.phone || '',
          isInternal: ver.isInternal || false,
      });
  };

  const cancelEditVer = () => {
      setEditingVerId(null);
      setVerForm({ name: '', email: '', phone: '', isInternal: false });
  };

  // --- LOGIQUE SUPPRESSION ---

  const performDelete = () => {
      if (!deleteConfirm) return;
      
      if (deleteConfirm.type === 'requirement') {
          dispatch({ type: 'DELETE_REQUIREMENT', payload: deleteConfirm.id });
      } else {
          dispatch({ type: 'DELETE_VERIFIER', payload: deleteConfirm.id });
      }
      setDeleteConfirm(null);
  };

  const isVerifierInternal = (id: string) => {
      return state.verifiers.find(v => v.id === id)?.isInternal || false;
  };

  return (
    <div className="space-y-6 relative">
      {/* Modale de Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
                <div className="flex items-center gap-4 mb-4 text-red-600">
                    <div className="bg-red-100 p-3 rounded-full">
                        <AlertTriangle size={24} />
                    </div>
                    <h3 className="text-xl font-bold">Confirmer la suppression</h3>
                </div>
                
                <p className="text-gray-600 mb-6">
                    Êtes-vous sûr de vouloir supprimer {deleteConfirm.type === 'requirement' ? 'cette exigence' : 'ce vérificateur'} ? 
                    Cette action est irréversible.
                </p>
                
                <div className="flex justify-end gap-3">
                    <button 
                        onClick={() => setDeleteConfirm(null)}
                        className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                    >
                        Annuler
                    </button>
                    <button 
                        onClick={performDelete}
                        className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors flex items-center gap-2"
                    >
                        <Trash2 size={18} />
                        Supprimer
                    </button>
                </div>
            </div>
        </div>
      )}

      <h2 className="text-2xl font-bold text-gray-800">Gérer les Données</h2>

      <div className="flex border-b border-gray-200">
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'requirements' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => handleTabChange('requirements')}
        >
          Exigences
        </button>
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'verifiers' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => handleTabChange('verifiers')}
        >
          Vérificateurs
        </button>
      </div>

      {activeTab === 'requirements' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulaire Requirements */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-fit">
            <h3 className="font-semibold text-gray-800 mb-4">{editingReqId ? 'Modifier Exigence' : 'Ajouter Nouvelle Exigence'}</h3>
            <form onSubmit={handleReqSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Désignation</label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                  value={reqForm.designation}
                  onChange={(e) => setReqForm({ ...reqForm, designation: e.target.value })}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Vérificateur</label>
                <select
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                  value={reqForm.verifierId}
                  onChange={(e) => setReqForm({ ...reqForm, verifierId: e.target.value })}
                >
                  <option value="">Sélectionner Vérificateur...</option>
                  {state.verifiers.map((v) => (
                    <option key={v.id} value={v.id}>
                        {v.name} {v.isInternal ? '(Interne)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type de Suivi</label>
                <div className="grid grid-cols-2 gap-2">
                    <button
                        type="button"
                        onClick={() => setReqForm({ ...reqForm, trackingType: 'PERIODIC' })}
                        className={`py-2 px-3 text-sm rounded-lg border text-center transition-colors ${
                            reqForm.trackingType === 'PERIODIC' 
                            ? 'bg-blue-50 border-blue-500 text-blue-700 font-medium' 
                            : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                        Périodique
                    </button>
                    <button
                        type="button"
                        onClick={() => setReqForm({ ...reqForm, trackingType: 'CONTINUOUS' })}
                        disabled={!isVerifierInternal(reqForm.verifierId)}
                        className={`py-2 px-3 text-sm rounded-lg border text-center transition-colors ${
                            reqForm.trackingType === 'CONTINUOUS' 
                            ? 'bg-blue-50 border-blue-500 text-blue-700 font-medium' 
                            : 'bg-white border-gray-300 text-gray-600'
                        } ${!isVerifierInternal(reqForm.verifierId) ? 'opacity-50 cursor-not-allowed bg-gray-100' : 'hover:bg-gray-50'}`}
                        title={!isVerifierInternal(reqForm.verifierId) ? "Disponible uniquement pour les vérificateurs internes" : ""}
                    >
                        Au fil de l'eau
                    </button>
                </div>
                {!isVerifierInternal(reqForm.verifierId) && reqForm.verifierId !== '' && (
                     <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                         <Info size={12}/> "Au fil de l'eau" nécessite un vérificateur interne.
                     </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Description (Légale)</label>
                <textarea
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                  rows={3}
                  value={reqForm.description}
                  onChange={(e) => setReqForm({ ...reqForm, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">
                        {reqForm.trackingType === 'CONTINUOUS' ? 'Date de début / Création' : 'Dernière Date'}
                    </label>
                    <input
                    type="date"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                    value={reqForm.lastDate}
                    onChange={(e) => setReqForm({ ...reqForm, lastDate: e.target.value })}
                    />
                </div>
                {reqForm.trackingType === 'PERIODIC' && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Périodicité (Mois)</label>
                        <input
                        type="number"
                        required
                        min={1}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                        value={reqForm.periodicityMonths}
                        onChange={(e) => setReqForm({ ...reqForm, periodicityMonths: parseInt(e.target.value) })}
                        />
                    </div>
                )}
              </div>
              
              <div className="flex gap-2 pt-2">
                 <button type="submit" className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 flex justify-center items-center gap-2">
                    {editingReqId ? <Save size={16}/> : <Plus size={16}/>}
                    {editingReqId ? 'Mettre à jour' : 'Ajouter'}
                 </button>
                 {editingReqId && (
                     <button type="button" onClick={cancelEditReq} className="bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300">
                         <X size={16}/>
                     </button>
                 )}
              </div>
            </form>
          </div>

          {/* Liste Requirements */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-y-auto max-h-[600px]">
                <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0">
                    <tr>
                    <th className="px-6 py-3">Désignation</th>
                    <th className="px-6 py-3">Type</th>
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3">Fréq.</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {state.requirements.map((req) => (
                    <tr key={req.id} className="bg-white border-b hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-900">{req.designation}</td>
                        <td className="px-6 py-4">
                            {req.trackingType === 'CONTINUOUS' ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                    Continu
                                </span>
                            ) : (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                    Périodique
                                </span>
                            )}
                        </td>
                        <td className="px-6 py-4">{req.lastDate}</td>
                        <td className="px-6 py-4">{req.trackingType === 'CONTINUOUS' ? '-' : `${req.periodicityMonths}m`}</td>
                        <td className="px-6 py-4 text-right flex justify-end gap-2">
                            <button onClick={() => startEditReq(req)} className="text-blue-600 hover:text-blue-900 bg-blue-50 p-2 rounded"><Edit2 size={16}/></button>
                            <button 
                                onClick={() => setDeleteConfirm({ id: req.id, type: 'requirement' })} 
                                className="text-red-600 hover:text-red-900 bg-red-50 p-2 rounded"
                            >
                                <Trash2 size={16}/>
                            </button>
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'verifiers' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
             {/* Formulaire Vérificateur */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-fit">
                <h3 className="font-semibold text-gray-800 mb-4">{editingVerId ? 'Modifier Vérificateur' : 'Ajouter Vérificateur'}</h3>
                <form onSubmit={handleVerSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nom de l'Organisme</label>
                        <input
                            type="text"
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                            value={verForm.name}
                            onChange={(e) => setVerForm({ ...verForm, name: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email de Contact</label>
                        <input
                            type="email"
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                            value={verForm.email}
                            onChange={(e) => setVerForm({ ...verForm, email: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Téléphone (Optionnel)</label>
                        <input
                            type="tel"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                            value={verForm.phone}
                            placeholder="ex: 01 23 45 67 89"
                            onChange={(e) => setVerForm({ ...verForm, phone: e.target.value })}
                        />
                    </div>
                    
                    <div className="flex items-center gap-2 py-2">
                        <input
                            type="checkbox"
                            id="isInternal"
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            checked={verForm.isInternal || false}
                            onChange={(e) => setVerForm({ ...verForm, isInternal: e.target.checked })}
                        />
                        <label htmlFor="isInternal" className="text-sm font-medium text-gray-700">
                            Organisme / Équipe Interne
                        </label>
                    </div>

                    <div className="flex gap-2 pt-2">
                        <button type="submit" className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 flex justify-center items-center gap-2">
                            {editingVerId ? <Save size={16} /> : <Plus size={16} />} 
                            {editingVerId ? 'Mettre à jour' : 'Ajouter'}
                        </button>
                         {editingVerId && (
                            <button type="button" onClick={cancelEditVer} className="bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300">
                                <X size={16}/>
                            </button>
                        )}
                    </div>
                </form>
            </div>

             {/* Liste Vérificateurs */}
             <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                    <th className="px-6 py-3">Organisme</th>
                    <th className="px-6 py-3">Email</th>
                    <th className="px-6 py-3">Type</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {state.verifiers.map((v) => (
                    <tr key={v.id} className="bg-white border-b hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-900">{v.name}</td>
                        <td className="px-6 py-4">{v.email}</td>
                        <td className="px-6 py-4">
                            {v.isInternal ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                                    Interne
                                </span>
                            ) : (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                    Externe
                                </span>
                            )}
                        </td>
                        <td className="px-6 py-4 text-right flex justify-end gap-2">
                             <button onClick={() => startEditVer(v)} className="text-blue-600 hover:text-blue-900 bg-blue-50 p-2 rounded">
                                 <Edit2 size={16}/>
                             </button>
                            <button 
                                onClick={() => setDeleteConfirm({ id: v.id, type: 'verifier' })}
                                className="text-red-600 hover:text-red-900 bg-red-50 p-2 rounded"
                                title="Supprimer Vérificateur"
                            >
                                <Trash2 size={16}/>
                            </button>
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
        </div>
      )}
    </div>
  );
};

export default Manage;