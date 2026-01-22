import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { calculateNextDueDate, getRequirementStatus } from '../utils';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { AlertTriangle, CheckCircle, Clock, Database, Percent, Hash, X, FileText, Calendar, User, Phone, Mail, Edit } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { state } = useApp();
  const navigate = useNavigate();
  const [showPercentage, setShowPercentage] = useState(false);
  const [selectedReq, setSelectedReq] = useState<any | null>(null);

  const data = useMemo(() => {
    return state.requirements.map((req) => {
      const verifier = state.verifiers.find((v) => v.id === req.verifierId);
      
      let nextDueDate = '';
      if (req.trackingType === 'CONTINUOUS') {
          nextDueDate = 'Continu';
      } else {
          nextDueDate = calculateNextDueDate(req.lastDate, req.periodicityMonths);
      }
      
      const calculationDate = req.trackingType === 'CONTINUOUS' ? '' : nextDueDate;
      const status = getRequirementStatus(calculationDate, req.trackingType);

      return {
        ...req,
        verifierName: verifier ? verifier.name : 'Inconnu',
        verifierEmail: verifier?.email,
        verifierPhone: verifier?.phone,
        verifierIsInternal: verifier?.isInternal,
        nextDueDate,
        status,
      };
    });
  }, [state.requirements, state.verifiers]);

  const stats = useMemo(() => {
    return {
      red: data.filter((d) => d.status === 'RED').length,
      orange: data.filter((d) => d.status === 'ORANGE').length,
      green: data.filter((d) => d.status === 'GREEN').length,
      total: data.length,
    };
  }, [data]);

  const chartData = [
    { name: 'En retard', value: stats.red, color: '#ef4444' },
    { name: 'Attention (<90j)', value: stats.orange, color: '#f97316' },
    { name: 'Conforme', value: stats.green, color: '#22c55e' },
  ];

  const handleRowClick = (req: any) => {
      setSelectedReq(req);
  };

  const handleEditClick = () => {
      if (selectedReq) {
          navigate('/manage', { state: { editReqId: selectedReq.id } });
      }
  };

  return (
    <div className="space-y-6 relative">
      <h2 className="text-2xl font-bold text-gray-800">Tableau de Bord</h2>

      {/* --- MODALE DÉTAILS --- */}
      {selectedReq && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className={`p-6 border-b flex justify-between items-start ${
                    selectedReq.status === 'RED' ? 'bg-red-50 border-red-100' :
                    selectedReq.status === 'ORANGE' ? 'bg-orange-50 border-orange-100' : 'bg-green-50 border-green-100'
                }`}>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            {selectedReq.status === 'RED' && <AlertTriangle className="text-red-600" size={20}/>}
                            {selectedReq.status === 'ORANGE' && <Clock className="text-orange-600" size={20}/>}
                            {selectedReq.status === 'GREEN' && <CheckCircle className="text-green-600" size={20}/>}
                            <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                selectedReq.status === 'RED' ? 'bg-red-200 text-red-800' :
                                selectedReq.status === 'ORANGE' ? 'bg-orange-200 text-orange-800' : 'bg-green-200 text-green-800'
                            }`}>
                                {selectedReq.status === 'RED' ? 'Non Conforme' : selectedReq.status === 'ORANGE' ? 'À Planifier' : 'Conforme'}
                            </span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900">{selectedReq.designation}</h3>
                    </div>
                    <button 
                        onClick={() => setSelectedReq(null)}
                        className="text-gray-400 hover:text-gray-600 bg-white/50 hover:bg-white rounded-full p-1 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto space-y-6">
                    {/* Description */}
                    <div className="space-y-2">
                        <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-500 uppercase tracking-wide">
                            <FileText size={16}/> Description
                        </h4>
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 text-gray-700 leading-relaxed">
                            {selectedReq.description || "Aucune description fournie."}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Dates */}
                        <div className="space-y-3">
                            <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-500 uppercase tracking-wide">
                                <Calendar size={16}/> Planning
                            </h4>
                            <div className="bg-white border border-gray-200 rounded-lg p-3 space-y-2 shadow-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600 text-sm">Type de suivi :</span>
                                    <span className="font-medium text-gray-900">
                                        {selectedReq.trackingType === 'CONTINUOUS' ? "Au fil de l'eau" : "Périodique"}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600 text-sm">Dernière vérif. :</span>
                                    <span className="font-medium text-gray-900">{selectedReq.lastDate}</span>
                                </div>
                                {selectedReq.trackingType === 'PERIODIC' && (
                                    <>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 text-sm">Périodicité :</span>
                                            <span className="font-medium text-gray-900">{selectedReq.periodicityMonths} mois</span>
                                        </div>
                                        <div className="flex justify-between pt-2 border-t border-gray-100">
                                            <span className="text-gray-600 text-sm font-semibold">Prochaine échéance :</span>
                                            <span className={`font-bold ${
                                                selectedReq.status === 'RED' ? 'text-red-600' : 'text-gray-900'
                                            }`}>
                                                {selectedReq.nextDueDate}
                                            </span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Contact */}
                        <div className="space-y-3">
                            <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-500 uppercase tracking-wide">
                                <User size={16}/> Vérificateur
                            </h4>
                            <div className="bg-white border border-gray-200 rounded-lg p-3 space-y-3 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <span className="font-bold text-gray-900">{selectedReq.verifierName}</span>
                                    {selectedReq.verifierIsInternal && (
                                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">Interne</span>
                                    )}
                                </div>
                                {selectedReq.verifierEmail && (
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Mail size={14} className="text-gray-400"/>
                                        <a href={`mailto:${selectedReq.verifierEmail}`} className="hover:text-blue-600 hover:underline">
                                            {selectedReq.verifierEmail}
                                        </a>
                                    </div>
                                )}
                                {selectedReq.verifierPhone && (
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Phone size={14} className="text-gray-400"/>
                                        <span>{selectedReq.verifierPhone}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 bg-gray-50 border-t flex justify-end gap-3">
                    <button 
                        onClick={() => setSelectedReq(null)}
                        className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors font-medium"
                    >
                        Fermer
                    </button>
                    <button 
                        onClick={handleEditClick}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition-colors font-medium flex items-center gap-2"
                    >
                        <Edit size={16} />
                        Modifier l'exigence
                    </button>
                </div>
            </div>
        </div>
      )}


      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
                <p className="text-sm text-gray-500">Total Exigences</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="bg-gray-100 p-2 rounded-full text-gray-600"><Database size={24} /></div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-red-500 flex items-center justify-between">
            <div>
                <p className="text-sm text-gray-500">Action Requise</p>
                <p className="text-2xl font-bold text-red-600">{stats.red}</p>
            </div>
            <div className="bg-red-50 p-2 rounded-full text-red-500"><AlertTriangle size={24} /></div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-orange-500 flex items-center justify-between">
            <div>
                <p className="text-sm text-gray-500">À venir (90j)</p>
                <p className="text-2xl font-bold text-orange-600">{stats.orange}</p>
            </div>
            <div className="bg-orange-50 p-2 rounded-full text-orange-500"><Clock size={24} /></div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-green-500 flex items-center justify-between">
            <div>
                <p className="text-sm text-gray-500">Conforme</p>
                <p className="text-2xl font-bold text-green-600">{stats.green}</p>
            </div>
            <div className="bg-green-50 p-2 rounded-full text-green-500"><CheckCircle size={24} /></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tableau */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800">Vue d'ensemble de l'état réglementaire</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th className="px-6 py-3">Désignation</th>
                  <th className="px-6 py-3">Vérificateur</th>
                  <th className="px-6 py-3">Dernier Contrôle</th>
                  <th className="px-6 py-3">Prochaine Échéance</th>
                  <th className="px-6 py-3 text-center">Statut</th>
                </tr>
              </thead>
              <tbody>
                {data.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                      Aucune exigence trouvée. Ajoutez-en dans "Gérer les Données".
                    </td>
                  </tr>
                ) : (
                  data.map((row) => (
                    <tr 
                        key={row.id} 
                        onClick={() => handleRowClick(row)}
                        className="bg-white border-b hover:bg-blue-50 cursor-pointer transition-colors duration-150"
                        title="Cliquez pour voir les détails"
                    >
                      <td className="px-6 py-4 font-medium text-gray-900">{row.designation}</td>
                      <td className="px-6 py-4">{row.verifierName}</td>
                      <td className="px-6 py-4">{row.lastDate}</td>
                      <td className="px-6 py-4 font-mono text-gray-600">
                          {row.trackingType === 'CONTINUOUS' ? (
                              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">Au fil de l'eau</span>
                          ) : (
                              row.nextDueDate
                          )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-block w-4 h-4 rounded-full ${
                            row.status === 'RED'
                              ? 'bg-red-500 animate-pulse'
                              : row.status === 'ORANGE'
                              ? 'bg-orange-400'
                              : 'bg-green-500'
                          }`}
                          title={row.status}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Graphique avec Légende Personnalisée */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col h-fit">
             <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800">Répartition</h3>
                
                {/* Toggle Switch */}
                <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button 
                        onClick={() => setShowPercentage(false)}
                        className={`p-1.5 rounded-md transition-all ${!showPercentage ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                        title="Afficher les nombres"
                    >
                        <Hash size={16} />
                    </button>
                    <button 
                        onClick={() => setShowPercentage(true)}
                        className={`p-1.5 rounded-md transition-all ${showPercentage ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                        title="Afficher les pourcentages"
                    >
                        <Percent size={16} />
                    </button>
                </div>
             </div>
             
             {/* Zone Graphique */}
             <div className="h-72 w-full" style={{ minWidth: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart margin={{ top: 0, right: 0, bottom: 20, left: 0 }}>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={70}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="value"
                            // Suppression des labels sur le graphique pour éviter le chevauchement
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip 
                            formatter={(value: number, name: string) => {
                                if (showPercentage && stats.total > 0) {
                                    return [`${((value / stats.total) * 100).toFixed(1)}%`, name];
                                }
                                return [value, name];
                            }}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                    </PieChart>
                </ResponsiveContainer>
             </div>

             {/* Légende Personnalisée en dessous */}
             <div className="mt-2 grid grid-cols-1 gap-3 border-t border-gray-100 pt-4">
                {chartData.map((item, index) => {
                    const valueDisplay = showPercentage 
                        ? (stats.total > 0 ? `${((item.value / stats.total) * 100).toFixed(1)}%` : '0%')
                        : item.value;

                    return (
                        <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }}></div>
                                <span className="text-gray-600 font-medium text-sm">{item.name}</span>
                            </div>
                            <span className={`font-bold text-lg ${item.value > 0 ? 'text-gray-800' : 'text-gray-400'}`}>
                                {valueDisplay}
                            </span>
                        </div>
                    );
                })}
                {/* Total */}
                <div className="flex items-center justify-between pt-2 mt-2 border-t border-gray-50">
                     <span className="text-gray-400 text-xs uppercase font-semibold">Total</span>
                     <span className="text-gray-400 text-xs font-semibold">{stats.total}</span>
                </div>
             </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;