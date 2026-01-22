import React, { useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import * as XLSX from 'xlsx';
import { Download, Upload, FileDown, AlertCircle } from 'lucide-react';
import { generateId } from '../utils';

const ImportExport: React.FC = () => {
  const { state, dispatch } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // 1. Exporter les données
  const handleExport = () => {
    try {
      // Aplatir les données pour l'export
      const exportData = state.requirements.map((req) => {
        const verifier = state.verifiers.find((v) => v.id === req.verifierId);
        return {
          ID: req.id,
          'Désignation': req.designation,
          Description: req.description,
          'Type de Suivi': req.trackingType === 'CONTINUOUS' ? 'Continu' : 'Périodique',
          'Dernière Date': req.lastDate,
          'Périodicité (Mois)': req.periodicityMonths,
          'Nom Vérificateur': verifier?.name || 'Inconnu',
          'Email Vérificateur': verifier?.email || '',
          'Téléphone Vérificateur': verifier?.phone || '',
          'Vérificateur Interne': verifier?.isInternal ? 'OUI' : 'NON'
        };
      });

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Exigences');
      XLSX.writeFile(wb, `ReguTrack_Backup_${new Date().toISOString().slice(0, 10)}.xlsx`);
      setMsg({ type: 'success', text: 'Base de données exportée avec succès.' });
    } catch (e) {
      setMsg({ type: 'error', text: 'Échec de l\'export.' });
    }
  };

  // 2. Télécharger le modèle
  const handleDownloadTemplate = () => {
    const headers = [
      {
        'Désignation': 'Exemple de désignation',
        Description: 'Description légale ici',
        'Type de Suivi': 'Périodique', // ou 'Continu'
        'Dernière Date (AAAA-MM-JJ)': '2023-01-01',
        'Périodicité (Mois)': 12,
        'Nom Vérificateur': 'Bureau Veritas',
        'Email Vérificateur': 'contact@bv.com',
        'Téléphone Vérificateur': '0123456789',
        'Vérificateur Interne': 'NON', // ou OUI
      },
    ];
    const ws = XLSX.utils.json_to_sheet(headers);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Modèle');
    XLSX.writeFile(wb, 'ReguTrack_Modele_Import.xlsx');
  };

  // 3. Importer les données
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        if (data.length === 0) throw new Error('Fichier vide');

        // Traiter les données
        const newVerifiers = [...state.verifiers];
        const newRequirements = [...state.requirements];

        data.forEach((row: any) => {
            // Aide pour gérer la date Excel ou chaîne de caractères
            let dateStr = row['Dernière Date (AAAA-MM-JJ)'] || row['Dernière Date'];
            
            // Validation basique
            if(!row['Désignation']) return;

            // Trouver ou créer le vérificateur
            const vName = row['Nom Vérificateur'];
            const vEmail = row['Email Vérificateur'] || '';
            const vPhone = row['Téléphone Vérificateur'] || '';
            const vIsInternal = (row['Vérificateur Interne'] || '').toString().toUpperCase() === 'OUI';

            let vId = '';
            
            if (vName) {
                const existingV = newVerifiers.find(v => v.name.toLowerCase() === vName.toLowerCase());
                if (existingV) {
                    vId = existingV.id;
                    // Mise à jour optionnelle
                    if (!existingV.phone && vPhone) existingV.phone = vPhone;
                    if (vIsInternal) existingV.isInternal = true; // Si marqué interne dans l'import, on met à jour
                } else {
                    vId = generateId();
                    newVerifiers.push({ 
                        id: vId, 
                        name: vName, 
                        email: vEmail, 
                        phone: vPhone,
                        isInternal: vIsInternal
                    });
                }
            }

            // Type de suivi
            const trackingTypeRaw = (row['Type de Suivi'] || '').toString().toUpperCase();
            const trackingType = trackingTypeRaw === 'CONTINU' ? 'CONTINUOUS' : 'PERIODIC';

            // Créer l'exigence
            newRequirements.push({
                id: generateId(),
                designation: row['Désignation'],
                description: row['Description'] || '',
                lastDate: String(dateStr).trim(),
                periodicityMonths: parseInt(row['Périodicité (Mois)'] || '12'),
                verifierId: vId,
                trackingType: trackingType
            });
        });

        dispatch({
            type: 'IMPORT_DATA',
            payload: { verifiers: newVerifiers, requirements: newRequirements }
        });
        
        setMsg({ type: 'success', text: `Importation réussie de ${data.length} lignes.` });
      } catch (err) {
        console.error(err);
        setMsg({ type: 'error', text: 'Erreur lors de l\'analyse du fichier. Assurez-vous que le format correspond au modèle.' });
      }
    };
    reader.readAsBinaryString(file);
    // Réinitialiser l'entrée
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Import / Export</h2>

      {msg && (
        <div className={`p-4 rounded-lg flex items-center gap-2 ${msg.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          <AlertCircle size={20} />
          {msg.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Section Export */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-100 p-3 rounded-full text-blue-600">
              <Download size={24} />
            </div>
            <h3 className="text-lg font-semibold">Exporter la Base de Données</h3>
          </div>
          <p className="text-gray-500 mb-6">
            Téléchargez une sauvegarde complète de toutes les exigences et vérificateurs au format Excel (.xlsx).
          </p>
          <button
            onClick={handleExport}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
          >
            <Download size={18} /> Télécharger Excel
          </button>
        </div>

        {/* Section Import */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-green-100 p-3 rounded-full text-green-600">
              <Upload size={24} />
            </div>
            <h3 className="text-lg font-semibold">Importer des Données</h3>
          </div>
          
          <div className="space-y-4">
            <p className="text-gray-500">
                Ajout de données en masse. Utilisez le modèle pour éviter les erreurs de format.
            </p>
            
            <button
                onClick={handleDownloadTemplate}
                className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition flex items-center justify-center gap-2"
            >
                <FileDown size={18} /> Télécharger Modèle
            </button>

            <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition">
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx, .xls"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="text-gray-500">
                    <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                    <span className="block text-sm font-medium">Cliquez ou glissez le fichier Excel ici</span>
                </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100 text-sm text-yellow-800">
          <strong>Note :</strong> L'importation ajoute aux données existantes. Elle ne remplace pas la base de données entière à moins que vous ne supprimiez manuellement les anciennes données d'abord.
      </div>
    </div>
  );
};

export default ImportExport;