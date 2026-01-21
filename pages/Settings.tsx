import React from 'react';

const Settings: React.FC = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Configuration</h2>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">Configuration des Alertes Email</h3>
        <p className="text-gray-500 mb-4 text-sm">
          Cette section simule la configuration pour le script SMTP Python (`send_mail_job.py`). 
          Dans un environnement de production, ces paramètres seraient stockés dans le backend ou un fichier d'environnement.
        </p>

        <div className="space-y-4 max-w-lg opacity-70 pointer-events-none">
          <div>
            <label className="block text-sm font-medium text-gray-700">Hôte SMTP</label>
            <input type="text" value="smtp.office365.com" className="mt-1 block w-full rounded-md border-gray-300 border p-2 bg-gray-50" readOnly />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Port</label>
                <input type="number" value="587" className="mt-1 block w-full rounded-md border-gray-300 border p-2 bg-gray-50" readOnly />
            </div>
             <div>
                <label className="block text-sm font-medium text-gray-700">Chiffrement</label>
                <input type="text" value="TLS" className="mt-1 block w-full rounded-md border-gray-300 border p-2 bg-gray-50" readOnly />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email Expéditeur</label>
            <input type="email" value="notifications@entreprise.com" className="mt-1 block w-full rounded-md border-gray-300 border p-2 bg-gray-50" readOnly />
          </div>
          <div className="pt-2">
            <button className="bg-gray-400 text-white py-2 px-4 rounded-md cursor-not-allowed">Tester Connexion (Serveur Requis)</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
