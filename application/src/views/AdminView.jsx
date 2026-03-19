import React, { useState } from 'react';
import { List, Download, Calendar, Plus, Filter, BookOpen, Trash2, CheckCircle, AlertTriangle, Users, FileText, Search, RotateCcw, GraduationCap, Edit, Lock } from 'lucide-react';
import { useAttendance } from '../context/AttendanceContext';
import Modal from '../components/Modal';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import pigierLogo from '../assets/logo_pigier.png';

const AdminView = () => {
  const { exams, signatures, majors, addExam, deleteExam, addMajor, deleteMajor, deleteSignature, resetAllData, updateSignature, isConfirmationActive, toggleConfirmation } = useAttendance();
  const [newExamForm, setNewExamForm] = useState({
    subject: '',
    semester: 'S1',
    session: 'Session Normale'
  });
  const [newMajorName, setNewMajorName] = useState('');
  const [adminFilter, setAdminFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // États pour les modales
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [examToDelete, setExamToDelete] = useState(null);
  
  const [showMajorDeleteModal, setShowMajorDeleteModal] = useState(false);
  const [majorToDelete, setMajorToDelete] = useState(null);

  const [showSignatureDeleteModal, setShowSignatureDeleteModal] = useState(false);
  const [signatureToDelete, setSignatureToDelete] = useState(null);

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  const [showResetModal, setShowResetModal] = useState(false);

  // Vue Signature
  const [viewSignature, setViewSignature] = useState(null);
  const [showSignatureModal, setShowSignatureModal] = useState(false);

  // Édition Signature
  const [editSignature, setEditSignature] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    matricule: '',
    tableNumber: '',
    major: '',
    class: ''
  });

  // Statistiques
  const totalStudents = new Set(signatures.map(s => s.matricule)).size;
  const totalExams = exams.length;
  const totalSignatures = signatures.length;

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newExamForm.subject.trim()) return;
    
    addExam({
      ...newExamForm,
      id: Date.now().toString()
    });
    
    setNewExamForm({ subject: '', semester: 'S1', session: 'Session Normale' });
    setSuccessMessage("L'épreuve a été créée avec succès !");
    setShowSuccessModal(true);
  };

  const handleAddMajor = (e) => {
    e.preventDefault();
    if (!newMajorName.trim()) return;

    addMajor(newMajorName.trim());
    setNewMajorName('');
    setSuccessMessage("La filière a été ajoutée avec succès !");
    setShowSuccessModal(true);
  };

  const confirmDelete = (exam) => {
    setExamToDelete(exam);
    setShowDeleteModal(true);
  };

  const confirmDeleteMajor = (major) => {
    setMajorToDelete(major);
    setShowMajorDeleteModal(true);
  };

  const handleDelete = () => {
    if (examToDelete) {
      deleteExam(examToDelete.id);
      setShowDeleteModal(false);
      setExamToDelete(null);
      setSuccessMessage("L'épreuve a été supprimée avec succès.");
      setShowSuccessModal(true);
    }
  };

  const handleDeleteMajor = () => {
    if (majorToDelete) {
      deleteMajor(majorToDelete.id);
      setShowMajorDeleteModal(false);
      setMajorToDelete(null);
      setSuccessMessage("La filière a été supprimée avec succès.");
      setShowSuccessModal(true);
    }
  };

  const confirmDeleteSignature = (signature) => {
    setSignatureToDelete(signature);
    setShowSignatureDeleteModal(true);
  };

  const handleDeleteSignature = () => {
    if (signatureToDelete) {
      deleteSignature(signatureToDelete.id);
      setShowSignatureDeleteModal(false);
      setSignatureToDelete(null);
      setSuccessMessage("L'émargement a été supprimé avec succès.");
      setShowSuccessModal(true);
    }
  };

  const handleExportPDF = () => {
    try {
      const doc = new jsPDF('landscape');
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      
      // --- EN-TÊTE ---
      // Logo (s'il est chargé)
      try {
        const logoWidth = 40; 
        const logoHeight = 15; // Ajuster selon le ratio du logo réel
        doc.addImage(pigierLogo, 'PNG', 14, 10, logoWidth, logoHeight);
      } catch (e) {
        console.warn("Logo non chargé", e);
      }

      // Titre Principal
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.setTextColor(0, 51, 102); // Bleu Pigier
      doc.text("FEUILLE D'ÉMARGEMENT", pageWidth / 2, 20, { align: 'center' });
      
      // Sous-titre
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100);
      doc.text("Année Académique 2025-2026", pageWidth / 2, 26, { align: 'center' });

      // Info date à droite
      doc.setFontSize(8);
      doc.setTextColor(120);
      doc.text(`Généré le: ${new Date().toLocaleString('fr-FR')}`, pageWidth - 14, 15, { align: 'right' });

      // Ligne de séparation
      doc.setDrawColor(200);
      doc.setLineWidth(0.5);
      doc.line(14, 32, pageWidth - 14, 32);

      // --- INFO CONTEXTE ---
      let yPos = 42;
      doc.setFontSize(11);
      doc.setTextColor(60);
      
      let filterText = "Tous les examens";
      if (adminFilter !== 'all') {
        const exam = exams.find(e => e.id === adminFilter);
        if (exam) filterText = `${exam.subject} (${exam.session}) - ${exam.semester}`;
      }
      
      doc.setFont('helvetica', 'bold');
      doc.text("Épreuve : ", 14, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(filterText, 35, yPos);

      // Données
      const pdfSignatures = signatures.filter(s => adminFilter === 'all' || s.examId === adminFilter);
      
      // --- TABLEAU ---
      autoTable(doc, {
        startY: yPos + 8,
        head: [['Date', 'Matricule', 'Étudiant', 'Filière', 'Classe', 'Épreuve', 'Salle', 'Signature']],
        body: pdfSignatures.map(sig => {
          const dateObj = new Date(sig.timestamp);
          const formattedDate = isNaN(dateObj.getTime())
            ? sig.timestamp
            : dateObj.toLocaleString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              });

          return [
            formattedDate,
            sig.matricule,
            sig.name,
            sig.major || '-',
            sig.class || '-',
            sig.examName,
            sig.tableNumber || '-',
            '' // Placeholder image
          ];
        }),
        theme: 'grid',
        headStyles: { 
          fillColor: [0, 51, 102], // Bleu Pigier
          textColor: 255,
          fontStyle: 'bold',
          halign: 'center',
          valign: 'middle'
        },
        styles: { 
          fontSize: 9, 
          cellPadding: 3, 
          valign: 'middle', 
          lineColor: [230, 230, 230],
          lineWidth: 0.1
        },
        columnStyles: {
          0: { width: 30, halign: 'center' }, // Date
          1: { width: 30 }, // Matricule
          2: { }, // Nom auto-expand
          3: { width: 25, halign: 'center' }, // Filière
          4: { width: 25, halign: 'center' }, // Classe
          5: { width: 50 }, // Épreuve
          6: { width: 20, halign: 'center' }, // Table
          7: { width: 40, minCellHeight: 15, halign: 'center' } // Signature
        },
        alternateRowStyles: {
          fillColor: [249, 250, 251] // Gris très clair pour alternance
        },
        didDrawCell: (data) => {
          if (data.section === 'body' && data.column.index === 7) {
            const signatureImg = pdfSignatures[data.row.index].signatureUrl;
            if (signatureImg) {
              try {
                // Centrer l'image dans la cellule
                const padding = 2;
                const cellHeight = data.cell.height - (padding * 2);
                const cellWidth = data.cell.width - (padding * 2);
                
                // Ratio d'aspect pour la signature (souvent 2:1 ou 3:1)
                const imgWidth = Math.min(cellWidth, cellHeight * 2.5);
                const imgHeight = imgWidth / 2.5;
                
                const x = data.cell.x + (data.cell.width - imgWidth) / 2;
                const y = data.cell.y + (data.cell.height - imgHeight) / 2;

                doc.addImage(signatureImg, 'PNG', x, y, imgWidth, imgHeight);
              } catch (e) {
                // Silencieux si pas d'image valide
              }
            }
          }
        },
        // Pied de page avec numérotation
        didDrawPage: (data) => {
          const str = 'Page ' + doc.internal.getNumberOfPages();
          doc.setFontSize(8);
          doc.setTextColor(150);
          doc.text(str, pageWidth / 2, pageHeight - 10, { align: 'center' });
        }
      });

      doc.save(`Emargement_Pigier_${new Date().toISOString().slice(0,10)}.pdf`);
      setSuccessMessage("La feuille d'émargement a été générée avec succès.");
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Erreur PDF:", error);
      alert("Une erreur est survenue lors de la génération du PDF. Vérifiez la console pour plus de détails.");
    }
  };

  const handleReset = () => {
    resetAllData();
    setShowResetModal(false);
    setSuccessMessage("La plateforme a été réinitialisée. Toutes les données ont été effacées.");
    setShowSuccessModal(true);
  };

  const handleEditClick = (signature) => {
    setEditSignature(signature);
    setEditForm({
      name: signature.name,
      matricule: signature.matricule,
      tableNumber: signature.tableNumber,
      major: signature.major || '',
      class: signature.class || ''
    });
    setShowEditModal(true);
  };

  const handleUpdateSignature = (e) => {
    e.preventDefault();
    if (editSignature) {
      updateSignature(editSignature.id, editForm);
      setShowEditModal(false);
      setSuccessMessage("Les informations de l'étudiant ont été mises à jour.");
      setShowSuccessModal(true);
    }
  };

  const handleViewSignature = (sig) => {
    setViewSignature(sig);
    setShowSignatureModal(true);
  };

  // Filtrage pour l'affichage tableau
  const displayedSignatures = signatures.filter(s => {
    const matchesExam = adminFilter === 'all' || s.examId === adminFilter;
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.matricule.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesExam && matchesSearch;
  });

  return (
    <div className="space-y-8">
      {/* 0. TABLEAU DE BORD (Kpi) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Étudiants uniques</p>
            <p className="text-2xl font-bold text-slate-800">{totalStudents}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center">
          <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mr-4">
            <FileText className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Émargements total</p>
            <p className="text-2xl font-bold text-slate-800">{totalSignatures}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center">
          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mr-4">
            <BookOpen className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Épreuves actives</p>
            <p className="text-2xl font-bold text-slate-800">{totalExams}</p>
          </div>
        </div>
      </div>

      {/* 0.5 STATUS SESSION */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${isConfirmationActive ? 'bg-green-100' : 'bg-red-100'}`}>
            {isConfirmationActive ? <CheckCircle className="w-6 h-6 text-green-600"/> : <Lock className="w-6 h-6 text-red-600"/>}
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">État de l'émargement</h3>
            <p className="text-slate-500 text-sm">
              {isConfirmationActive ? "Les étudiants peuvent émarger." : "Les émargements sont désactivés."}
            </p>
          </div>
        </div>
        <button
          onClick={toggleConfirmation}
          className={`px-6 py-2 rounded-lg font-bold text-white transition-colors flex items-center shadow-md whitespace-nowrap
              ${isConfirmationActive ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}
          `}
        >
          {isConfirmationActive ? (
            <>
              <Lock className="w-4 h-4 mr-2" />
              Désactiver l'accès
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Activer l'accès
            </>
          )}
        </button>
      </div>

      {/* 1. CONFIGURATION (ÉPREUVES & FILIÈRES) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Création d'épreuve */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden flex flex-col h-full">
          <div className="p-4 border-b border-blue-100 bg-blue-50">
            <h2 className="text-lg font-bold text-blue-900 flex items-center">
              <BookOpen className="w-5 h-5 mr-2 text-blue-600" />
              Nouvelle Épreuve
            </h2>
          </div>
          <div className="p-6 flex-1">
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Matière</label>
                <input 
                  type="text" 
                  required 
                  className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                  placeholder="Ex: Algèbre Linéaire" 
                  value={newExamForm.subject} 
                  onChange={e => setNewExamForm({...newExamForm, subject: e.target.value})} 
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Semestre</label>
                  <select 
                    className="w-full px-4 py-2 border border-slate-300 rounded-md bg-white focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                    value={newExamForm.semester} 
                    onChange={e => setNewExamForm({...newExamForm, semester: e.target.value})}
                  >
                    {['S1','S2','S3','S4','S5','S6'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Session</label>
                  <select 
                    className="w-full px-4 py-2 border border-slate-300 rounded-md bg-white focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                    value={newExamForm.session} 
                    onChange={e => setNewExamForm({...newExamForm, session: e.target.value})}
                  >
                    <option value="Session Normale">Session Normale</option>
                    <option value="Rattrapage">Rattrapage</option>
                  </select>
                </div>
              </div>
              
              <button 
                type="submit" 
                className="w-full flex justify-center items-center py-2.5 px-4 rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" /> 
                Créer l'épreuve
              </button>
            </form>
          </div>
        </div>

        {/* Gestion des Filières */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden flex flex-col h-full">
          <div className="p-4 border-b border-purple-100 bg-purple-50">
            <h2 className="text-lg font-bold text-purple-900 flex items-center">
              <GraduationCap className="w-5 h-5 mr-2 text-purple-600" />
              Gestion des Filières
            </h2>
          </div>
          <div className="p-6 flex-1 flex flex-col">
            <form onSubmit={handleAddMajor} className="flex gap-2 mb-6">
              <input
                type="text"
                required
                className="flex-1 px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                placeholder="Nouvelle filière (ex: GL, RESEAUX)"
                value={newMajorName}
                onChange={(e) => setNewMajorName(e.target.value)}
              />
              <button
                type="submit"
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center justify-center transition-colors shadow-sm"
              >
                <Plus className="w-5 h-5" />
              </button>
            </form>

            <div className="flex-1 overflow-y-auto max-h-[160px] pr-2 space-y-2">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Filières actives ({majors.length})</h3>
              {majors.length === 0 ? (
                <div className="text-center py-4 text-slate-400 text-sm italic">Aucune filière configurée</div>
              ) : (
                majors.map((major) => (
                  <div key={major.id} className="flex items-center justify-between bg-slate-50 p-2.5 rounded-md border border-slate-100 group hover:border-purple-200 transition-colors">
                    <span className="font-medium text-slate-700">{major.name}</span>
                    <button 
                      onClick={() => confirmDeleteMajor(major)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                      title="Supprimer cette filière"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. GESTION DES ÉPREUVES */}
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-orange-50">
          <h2 className="text-xl font-bold text-orange-900 flex items-center">
            <List className="w-5 h-5 mr-2 text-orange-600" />
            Liste des épreuves actives
          </h2>
        </div>
        <div className="overflow-x-auto">
          {exams.length === 0 ? (
            <p className="p-6 text-slate-500 text-center">Aucune épreuve créée.</p>
          ) : (
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Matière</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Semestre</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Session</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {exams.map((exam) => (
                  <tr key={exam.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-900">{exam.subject}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-500">{exam.semester}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-500">{exam.session}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => confirmDelete(exam)}
                        className="text-red-600 hover:text-red-900 inline-flex items-center p-2 hover:bg-red-50 rounded-full transition-colors"
                        title="Supprimer l'épreuve"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* 4. ZONE DE DANGER */}
      <div className="bg-red-50 rounded-xl p-6 border border-red-200 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h3 className="text-red-900 font-bold flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2" />
            Zone de danger
          </h3>
          <p className="text-red-700 text-sm mt-1">
            Cette action effacera définitivement toutes les épreuves et les signatures enregistrées.
          </p>
        </div>
        <button
          onClick={() => setShowResetModal(true)}
          className="bg-white border border-red-300 text-red-700 hover:bg-red-50 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors font-medium shadow-sm whitespace-nowrap"
        >
          <RotateCcw className="w-4 h-4" />
          Réinitialiser l'application
        </button>
      </div>

      {/* --- MODALES --- */}

      {/* Modal de Reset */}
      <Modal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        title="Réinitialisation complète"
      >
        <div className="flex flex-col space-y-4">
          <div className="flex items-center text-red-600 bg-red-50 p-3 rounded-md border border-red-100">
            <AlertTriangle className="w-6 h-6 mr-3 flex-shrink-0" />
            <div>
              <p className="font-bold">Attention !</p>
              <p className="text-sm">Vous êtes sur le point d'effacer TOUTES les données.</p>
            </div>
          </div>
          <p className="text-slate-600">
            Cette action est irréversible. Voulez-vous vraiment continuer ?
          </p>
          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={() => setShowResetModal(false)}
              className="px-4 py-2 border border-slate-300 rounded-md text-slate-700 hover:bg-slate-50 font-medium transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium shadow-sm transition-colors"
            >
              Tout effacer
            </button>
          </div>
        </div>
      </Modal>
      
      {/* Modal de Confirmation de Suppression */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirmer la suppression"
      >
        <div className="flex flex-col space-y-4">
          <div className="flex items-center text-amber-600 bg-amber-50 p-3 rounded-md">
            <AlertTriangle className="w-5 h-5 mr-3 flex-shrink-0" />
            <p className="text-sm font-medium">Cette action est irréversible.</p>
          </div>
          <p className="text-slate-600">
            Êtes-vous sûr de vouloir supprimer l'épreuve <strong>{examToDelete?.subject}</strong> ?
          </p>
          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="px-4 py-2 border border-slate-300 rounded-md text-slate-700 hover:bg-slate-50 font-medium transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium shadow-sm transition-colors"
            >
              Supprimer
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal de Confirmation de Suppression Filière */}
      <Modal
        isOpen={showMajorDeleteModal}
        onClose={() => setShowMajorDeleteModal(false)}
        title="Confirmer la suppression"
      >
        <div className="flex flex-col space-y-4">
          <div className="flex items-center text-amber-600 bg-amber-50 p-3 rounded-md">
            <AlertTriangle className="w-5 h-5 mr-3 flex-shrink-0" />
            <p className="text-sm font-medium">Cette action est irréversible.</p>
          </div>
          <p className="text-slate-600">
            Êtes-vous sûr de vouloir supprimer la filière <strong>{majorToDelete?.name}</strong> ?
          </p>
          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={() => setShowMajorDeleteModal(false)}
              className="px-4 py-2 border border-slate-300 rounded-md text-slate-700 hover:bg-slate-50 font-medium transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleDeleteMajor}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium shadow-sm transition-colors"
            >
              Supprimer
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal de Confirmation de Suppression de Signature */}
      <Modal
        isOpen={showSignatureDeleteModal}
        onClose={() => setShowSignatureDeleteModal(false)}
        title="Confirmer la suppression"
      >
        <div className="flex flex-col space-y-4">
          <div className="flex items-center text-amber-600 bg-amber-50 p-3 rounded-md">
            <AlertTriangle className="w-5 h-5 mr-3 flex-shrink-0" />
            <p className="text-sm font-medium">Cette action est irréversible.</p>
          </div>
          <p className="text-slate-600">
            Êtes-vous sûr de vouloir supprimer l'émargement de <strong>{signatureToDelete?.name}</strong> pour l'épreuve <strong>{signatureToDelete?.examName}</strong> ?
          </p>
          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={() => setShowSignatureDeleteModal(false)}
              className="px-4 py-2 border border-slate-300 rounded-md text-slate-700 hover:bg-slate-50 font-medium transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleDeleteSignature}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium shadow-sm transition-colors"
            >
              Supprimer
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal Visualisation Signature */}
      <Modal
        isOpen={showSignatureModal}
        onClose={() => setShowSignatureModal(false)}
        title={`Signature de ${viewSignature?.name || 'l\'étudiant'}`}
      >
        <div className="flex flex-col items-center space-y-4">
           {viewSignature && (
             <div className="w-full bg-white border border-slate-200 rounded-lg p-4 flex items-center justify-center">
               <img 
                 src={viewSignature.signatureUrl} 
                 alt="Signature en grand" 
                 className="max-w-full max-h-[60vh] object-contain"
               />
             </div>
           )}
           <div className="w-full flex justify-end">
             <button
               onClick={() => setShowSignatureModal(false)}
               className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium transition-colors" 
             >
               Fermer
             </button>
           </div>
        </div>
      </Modal>

      {/* Modal Édition Étudiant */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Modifier les informations"
      >
        <form onSubmit={handleUpdateSignature} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nom Complet</label>
            <input 
              type="text" 
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500 uppercase"
              value={editForm.name}
              onChange={(e) => setEditForm({...editForm, name: e.target.value})}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Matricule</label>
              <input 
                type="text" 
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={editForm.matricule}
                onChange={(e) => setEditForm({...editForm, matricule: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">N° Salle Virtuelle</label>
              <input 
                type="text" 
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={editForm.tableNumber}
                onChange={(e) => setEditForm({...editForm, tableNumber: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
               <label className="block text-sm font-medium text-slate-700 mb-1">Filière</label>
               <select 
                 className="w-full px-4 py-2 border border-slate-300 rounded-md bg-white focus:ring-blue-500 focus:border-blue-500"
                 value={editForm.major}
                 onChange={(e) => setEditForm({...editForm, major: e.target.value})}
               >
                 <option value="">Sélectionner</option>
                 {majors.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
               </select>
             </div>
             <div>
               <label className="block text-sm font-medium text-slate-700 mb-1">Classe</label>
               <input 
                 type="text" 
                 className="w-full px-4 py-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                 value={editForm.class}
                 onChange={(e) => setEditForm({...editForm, class: e.target.value})}
               />
             </div>
          </div>

          <div className="flex justify-end pt-4 space-x-3">
             <button
               type="button"
               onClick={() => setShowEditModal(false)}
               className="px-4 py-2 border border-slate-300 rounded-md text-slate-700 hover:bg-slate-50 font-medium transition-colors"
             >
               Annuler
             </button>
             <button
               type="submit"
               className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium shadow-sm transition-colors"
             >
               Enregistrer
             </button>
          </div>
        </form>
      </Modal>

      {/* </div>
        </div>
      </Modal>

      {/* Modal de Succès */}
      <Modal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Succès"
      >
        <div className="flex flex-col items-center text-center space-y-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center animate-bounce">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h4 className="text-xl font-medium text-slate-800">Opération réussie</h4>
          <p className="text-slate-600">
            {successMessage}
          </p>
          <button
            onClick={() => setShowSuccessModal(false)}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium transition-colors"
          >
            Continuer
          </button>
        </div>
      </Modal>

      {/* 3. LISTE DE PRÉSENCE */}
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex flex-col xl:flex-row justify-between items-center bg-indigo-50 gap-4">
          <div>
            <h2 className="text-xl font-bold text-indigo-900 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-indigo-600" />
              Feuille de Présence Globale
            </h2>
            <p className="text-indigo-700 text-sm mt-1">Supervision et export des émargements</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
            {/* Barre de recherche */}
            <div className="relative w-full sm:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md leading-5 bg-white placeholder-slate-500 focus:outline-none focus:placeholder-slate-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Rechercher un étudiant..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex items-center bg-white rounded-md border border-slate-300 px-3 py-2 shadow-sm w-full sm:w-auto">
              <Filter className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" />
              <select 
                className="border-none focus:ring-0 text-sm text-slate-700 bg-transparent py-0 pl-0 outline-none w-full"
                value={adminFilter}
                onChange={(e) => setAdminFilter(e.target.value)}
              >
                <option value="all">Toutes les épreuves</option>
                {exams.map(ex => (
                  <option key={ex.id} value={ex.id}>{ex.subject} ({ex.session})</option>
                ))}
              </select>
            </div>
            
            <button 
              onClick={handleExportPDF}
              className="flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition shadow-sm text-sm w-full sm:w-auto whitespace-nowrap"
            >
              <Download className="w-4 h-4 mr-2" />
              PV (PDF)
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          {displayedSignatures.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <List className="w-12 h-12 mx-auto text-slate-300 mb-3" />
              <p>Aucun émargement trouvé pour cette recherche.</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date & Heure</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Salle</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Étudiant</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Matricule</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Filière</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Classe</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Examen</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Signature</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {displayedSignatures.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {record.timestamp}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-700">
                      {record.tableNumber || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-slate-900">{record.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {record.matricule}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {record.major || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {record.class || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {record.examName}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div 
                        className="h-12 w-24 border border-slate-200 rounded overflow-hidden bg-white flex items-center justify-center cursor-pointer hover:border-blue-400 transition-colors"
                        onClick={() => handleViewSignature(record)}
                        title="Voir la signature"
                      >
                        <img 
                          src={record.signatureUrl} 
                          alt={`Signature de ${record.name}`}
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEditClick(record)}
                          className="text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 p-2 rounded-full transition-colors"
                          title="Modifier l'entrée"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => confirmDeleteSignature(record)}
                          className="text-red-600 hover:text-red-900 hover:bg-red-50 p-2 rounded-full transition-colors"
                          title="Supprimer l'entrée"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminView;
