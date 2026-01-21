import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { calculateNextDueDate, getRequirementStatus } from '../utils';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { Database } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { state } = useApp();

  const data = useMemo(() => {
    return state.requirements.map((req) => {
      const verifier = state.verifiers.find((v) => v.id === req.verifierId);
      const nextDueDate = calculateNextDueDate(req.lastDate, req.periodicityMonths);
      const status = getRequirementStatus(nextDueDate);
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
                      <td className="px-6 py-4 font-mono">{row.nextDueDate}</td>
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

        {/* Graphique */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
             <h3 className="font-semibold text-gray-800 mb-4">Répartition de la conformité</h3>
             <div className="h-64 w-full" style={{ minWidth: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
             </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;