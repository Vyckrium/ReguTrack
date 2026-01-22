import React, { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { calculateNextDueDate, getRequirementStatus } from '../utils';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { AlertTriangle, CheckCircle, Clock, Database, Percent, Hash } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { state } = useApp();
  const [showPercentage, setShowPercentage] = useState(false);

  const data = useMemo(() => {
    return state.requirements.map((req) => {
      const verifier = state.verifiers.find((v) => v.id === req.verifierId);
      
      let nextDueDate = '';
      if (req.trackingType === 'CONTINUOUS') {
          nextDueDate = 'Continu';
      } else {
          nextDueDate = calculateNextDueDate(req.lastDate, req.periodicityMonths);
      }
      
      // On passe la date brute (si périodique) ou n'importe quoi si continu car le type prime
      const calculationDate = req.trackingType === 'CONTINUOUS' ? '' : nextDueDate;
      const status = getRequirementStatus(calculationDate, req.trackingType);

      return {
        ...req,
        verifierName: verifier ? verifier.name : 'Inconnu',
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

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Tableau de Bord</h2>

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
                    <tr key={row.id} className="bg-white border-b hover:bg-gray-50">
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