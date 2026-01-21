import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { generateId } from '../utils';
import { Requirement, Verifier } from '../types';
import { Plus, Trash2, Edit2, X, Save } from 'lucide-react';

const Manage: React.FC = () => {
  const { state, dispatch } = useApp();
  const [activeTab, setActiveTab] = useState<'requirements' | 'verifiers'>('requirements');
  const [isEditing, setIsEditing] = useState<string | null>(null);

  // État du formulaire Exigence
  const [reqForm, setReqForm] = useState<Omit<Requirement, 'id'>>({
    designation: '',
    description: '',
    lastDate: '',
    periodicityMonths: 12,
    verifierId: '',
  });

  // État du formulaire Vérificateur
  const [verForm, setVerForm] = useState<Omit<Verifier, 'id'>>({
    name: '',
    email: '',
  });

  const handleReqSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing) {
        dispatch({ type: 'UPDATE_REQUIREMENT', payload: { ...reqForm, id: isEditing } });
        setIsEditing(null);
    } else {
        dispatch({ type: 'ADD_REQUIREMENT', payload: { ...reqForm, id: generateId() } });
    }
    // Réinitialisation
    setReqForm({ designation: '', description: '', lastDate: '', periodicityMonths: 12, verifierId: state.verifiers[0]?.id || '' });
  };

  const handleVerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch({ type: 'ADD_VERIFIER', payload: { ...verForm, id: generateId() } });
    setVerForm({ name: '', email: '' });
  };

  const startEditReq = (req: Requirement) => {
      setIsEditing(req.id);
      setReqForm({
          designation: req.designation,
          description: req.description,
          lastDate: req.lastDate,
          periodicityMonths: req.periodicityMonths,
          verifierId: req.verifierId
      });
  };

  const cancelEdit = () => {
      setIsEditing(null);
      setReqForm({ designation: '', description: '', lastDate: '', periodicityMonths: 12, verifierId: '' });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Gérer les Données</h2>

      <div className="flex border-b border-gray-200">
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'requirements' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('requirements')}
        >
          Exigences
        </button>
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'verifiers' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('verifiers')}
        >
          Vérificateurs
        </button>
      </div>

      {activeTab === 'requirements' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulaire */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-fit">
            <h3 className="font-semibold text-gray-800 mb-4">{isEditing ? 'Modifier Exigence' : 'Ajouter Nouvelle Exigence'}</h3>
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
                    <label className="block text-sm font-medium text-gray-700">Dernière Date</label>
                    <input
                    type="date"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2"
                    value={reqForm.lastDate}
                    onChange={(e) => setReqForm({ ...reqForm, lastDate: e.target.value })}
                    />
                </div>
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
                    <option key={v.id} value={v.id}>{v.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 pt-2">
                 <button type="submit" className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 flex justify-center items-center gap-2">
                    {isEditing ? <Save size={16}/> : <Plus size={16}/>}
                    {isEditing ? 'Mettre à jour' : 'Ajouter'}
                 </button>
                 {isEditing && (
                     <button type="button" onClick={cancelEdit} className="bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300">
                         <X size={16}/>
                     </button>
                 )}
              </div>
            </form>
          </div>

          {/* Liste */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-y-auto max-h-[600px]">
                <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0">
                    <tr>
                    <th className="px-6 py-3">Désignation</th>
                    <th className="px-6 py-3">Dernière Date</th>
                    <th className="px-6 py-3">Fréq.</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {state.requirements.map((req) => (
                    <tr key={req.id} className="bg-white border-b hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-900">{req.designation}</td>
                        <td className="px-6 py-4">{req.lastDate}</td>
                        <td className="px-6 py-4">{req.periodicityMonths}m</td>
                        <td className="px-6 py-4 text-right flex justify-end gap-2">
                            <button onClick={() => startEditReq(req)} className="text-blue-600 hover:text-blue-900 bg-blue-50 p-2 rounded"><Edit2 size={16}/></button>
                            <button onClick={() => dispatch({type: 'DELETE_REQUIREMENT', payload: req.id})} className="text-red-600 hover:text-red-900 bg-red-50 p-2 rounded"><Trash2 size={16}/></button>
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
                <h3 className="font-semibold text-gray-800 mb-4">Ajouter Vérificateur</h3>
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
                    <button type="submit" className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 flex justify-center items-center gap-2">
                        <Plus size={16} /> Ajouter Vérificateur
                    </button>
                </form>
            </div>

             {/* Liste Vérificateurs */}
             <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                    <th className="px-6 py-3">Organisme</th>
                    <th className="px-6 py-3">Email</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {state.verifiers.map((v) => (
                    <tr key={v.id} className="bg-white border-b hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-900">{v.name}</td>
                        <td className="px-6 py-4">{v.email}</td>
                        <td className="px-6 py-4 text-right">
                            <button 
                                onClick={() => dispatch({type: 'DELETE_VERIFIER', payload: v.id})}
                                className="text-red-600 hover:text-red-900 bg-red-50 p-2 rounded"
                                title="Supprimer Vérificateur (Assurez-vous qu'aucune exigence n'utilise ceci en premier !)"
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
