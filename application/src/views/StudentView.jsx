import React, { useState, useEffect } from 'react';
import { FileSignature, CheckCircle2, AlertTriangle, User, Hash, School, BookOpen } from 'lucide-react';
import { useAttendance } from '../context/AttendanceContext';
import SignaturePad from '../components/SignaturePad';
import Modal from '../components/Modal';

const StudentView = () => {
  const { exams, addSignature, signatures, majors, isConfirmationActive } = useAttendance();
  const [studentForm, setStudentForm] = useState({
    lastname: '',
    firstname: '',
    tableNumber: '',
    matricule: '',
    class: '',
    major: '',
    examId: '',
    signatureData: null
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    isError: true
  });

  // Initialiser l'examen par défaut quand la liste change
  useEffect(() => {
    if (exams.length > 0 && !studentForm.examId) {
      setStudentForm(prev => ({ ...prev, examId: exams[0].id }));
    }
  }, [exams, studentForm.examId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!studentForm.signatureData) {
      setModalConfig({
        isOpen: true,
        title: 'Signature manquante',
        message: 'Veuillez signer dans la zone prévue avant de soumettre.',
        isError: true
      });
      return;
    }

    const selectedExam = exams.find(ex => ex.id === (studentForm.examId || exams[0]?.id));
    
    if (!selectedExam) {
      setModalConfig({
        isOpen: true,
        title: 'Examen invalide',
        message: 'Veuillez sélectionner une épreuve valide.',
        isError: true
      });
      return;
    }

    // Vérification des doublons
    const isDuplicate = signatures.some(
      s => s.examId === selectedExam.id && s.matricule === studentForm.matricule
    );
    
    if (isDuplicate) {
      setModalConfig({
        isOpen: true,
        title: 'Déjà émargé',
        message: 'Attention : Vous avez déjà émargé pour cette épreuve avec ce matricule.',
        isError: true
      });
      return;
    }

    const newRecord = {
      id: Date.now().toString(),
      name: `${studentForm.lastname.toUpperCase()} ${studentForm.firstname}`,
      lastname: studentForm.lastname,
      firstname: studentForm.firstname,
      tableNumber: studentForm.tableNumber,
      matricule: studentForm.matricule,
      class: studentForm.class,
      major: studentForm.major,
      examId: selectedExam.id,
      examName: `${selectedExam.subject} (${selectedExam.session})`,
      signatureUrl: studentForm.signatureData,
      timestamp: new Date().toISOString()
    };

    addSignature(newRecord);
    setIsSubmitted(true);
    
    // Réinitialisation après 3 secondes
    setTimeout(() => {
      setIsSubmitted(false);
      setStudentForm(prev => ({ 
        ...prev, 
        lastname: '',
        firstname: '',
        tableNumber: '',
        matricule: '',
        class: '',
        major: '',
        signatureData: null 
      }));
    }, 3000);
  };

  return (
    <div className="max-w-3xl mx-auto bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden border border-slate-200/60 transition-all duration-300">
      <div className="bg-gradient-to-r from-[#003366] to-[#004080] p-6 sm:p-8 text-white text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-white/5 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-white/5 blur-3xl"></div>
        
        <h2 className="text-2xl sm:text-3xl font-bold flex flex-col sm:flex-row items-center justify-center relative z-10 font-heading tracking-wide">
          <div className="bg-white/10 p-2 rounded-xl mb-3 sm:mb-0 sm:mr-4 shadow-inner border border-white/20">
            <FileSignature className="w-8 h-8 text-white" strokeWidth={1.5} />
          </div>
          Feuille de Présence
        </h2>
        <p className="mt-3 text-blue-100 font-light text-sm tracking-wide uppercase opacity-90 relative z-10">
          Veuillez remplir vos informations et signer
        </p>
      </div>

      {isSubmitted ? (
        <div className="p-8 sm:p-16 flex flex-col items-center justify-center text-center">
          <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-6 animate-bounce-short shadow-xl border border-green-100">
            <CheckCircle2 className="w-12 h-12 text-green-600" strokeWidth={2} />
          </div>
          <h3 className="text-2xl font-bold text-slate-800">Émargement Confirmé</h3>
          <p className="text-slate-500 mt-3 max-w-sm mx-auto">
            Votre présence a été enregistrée avec succès. Bonne chance pour votre examen.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="p-4 sm:p-8 space-y-6 sm:space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-x-8 sm:gap-y-6">
            <div className="relative">
              <label className="block text-sm font-semibold text-slate-700 mb-2 ml-1">Nom <span className="text-red-500">*</span></label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400" strokeWidth={1.5} />
                </div>
                <input
                  type="text"
                  required
                  className="pl-10 w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] transition-all duration-200 uppercase font-medium placeholder-slate-400"
                  placeholder="EX: KONAN"
                  value={studentForm.lastname}
                  onChange={(e) => setStudentForm({ ...studentForm, lastname: e.target.value })}
                />
              </div>
            </div>
            <div className="relative">
              <label className="block text-sm font-semibold text-slate-700 mb-2 ml-1">Prénom(s) <span className="text-red-500">*</span></label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400" strokeWidth={1.5} />
                </div>
                <input
                  type="text"
                  required
                  className="pl-10 w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] transition-all duration-200 font-medium placeholder-slate-400"
                  placeholder="Ex: Jean"
                  value={studentForm.firstname}
                  onChange={(e) => setStudentForm({ ...studentForm, firstname: e.target.value })}
                />
              </div>
            </div>
            <div className="relative">
              <label className="block text-sm font-semibold text-slate-700 mb-2 ml-1">N° Salle Virtuelle <span className="text-red-500">*</span></label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Hash className="h-5 w-5 text-slate-400" strokeWidth={1.5} />
                </div>
                <input
                  type="text"
                  required
                  className="pl-10 w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] transition-all duration-200 font-medium placeholder-slate-400"
                  placeholder="Ex: Salle 1"
                  value={studentForm.tableNumber}
                  onChange={(e) => setStudentForm({ ...studentForm, tableNumber: e.target.value })}
                />
              </div>
            </div>
            <div className="relative">
              <label className="block text-sm font-semibold text-slate-700 mb-2 ml-1">Matricule <span className="text-red-500">*</span></label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Hash className="h-5 w-5 text-slate-400" strokeWidth={1.5} />
                </div>
                <input
                  type="text"
                  required
                  className="pl-10 w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] transition-all duration-200 font-medium placeholder-slate-400"
                  placeholder="Ex: ETU-2026-890"
                  value={studentForm.matricule}
                  onChange={(e) => setStudentForm({ ...studentForm, matricule: e.target.value })}
                />
              </div>
            </div>
            <div className="relative">
              <label className="block text-sm font-semibold text-slate-700 mb-2 ml-1">Classe <span className="text-red-500">*</span></label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <School className="h-5 w-5 text-slate-400" strokeWidth={1.5} />
                </div>
                <input
                  type="text"
                  required
                  className="pl-10 w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] transition-all duration-200 font-medium placeholder-slate-400"
                  placeholder="Ex: L3 INFO"
                  value={studentForm.class}
                  onChange={(e) => setStudentForm({ ...studentForm, class: e.target.value })}
                />
              </div>
            </div>
            <div className="relative">
              <label className="block text-sm font-semibold text-slate-700 mb-2 ml-1">Filière <span className="text-red-500">*</span></label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <BookOpen className="h-5 w-5 text-slate-400" strokeWidth={1.5} />
                </div>
                <select
                  required
                  className="pl-10 w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] transition-all duration-200 font-medium text-slate-700 appearance-none"
                  value={studentForm.major}
                  onChange={(e) => setStudentForm({ ...studentForm, major: e.target.value })}
                >
                  <option value="">Sélectionnez la filière</option>
                  {majors.map((m) => (
                    <option key={m.id} value={m.name}>{m.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="relative bg-blue-50/50 p-6 rounded-xl border border-blue-100">
            <label className="block text-sm font-semibold text-slate-700 mb-3 ml-1">Sélectionnez l'épreuve <span className="text-red-500">*</span></label>
            <select
              required
              className="w-full px-4 py-3 bg-white border border-blue-200 rounded-xl focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] transition-all duration-200 font-medium text-slate-800 shadow-sm"
              value={studentForm.examId}
              onChange={(e) => setStudentForm({ ...studentForm, examId: e.target.value })}
            >
              {exams.length === 0 && <option value="">Aucun examen disponible</option>}
              {exams.map(ex => (
                <option key={ex.id} value={ex.id}>
                  {ex.subject} - {ex.semester} ({ex.session})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3 ml-1">Signature Numérique <span className="text-red-500">*</span></label>
            <div className="bg-slate-50 p-1 rounded-2xl border border-slate-200 shadow-inner">
               <SignaturePad 
                onSignatureChange={(data) => setStudentForm({ ...studentForm, signatureData: data })} 
              /> 
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100">
            <button
              type="submit"
              disabled={!isConfirmationActive}
              className={`relative w-full flex justify-center items-center py-4 px-6 border-0 rounded-lg shadow-xl text-base font-bold text-white transition-all duration-200 mt-4 
                ${!isConfirmationActive 
                  ? 'bg-slate-400 cursor-not-allowed opacity-70' 
                  : 'bg-gradient-to-br from-[#003366] to-[#0055aa] hover:from-[#002244] hover:to-[#004488] transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#003366]'
                }`}
            >
              <div className={`absolute inset-0 bg-white/10 rounded-lg opacity-0 transition-opacity ${isConfirmationActive ? 'hover:opacity-100' : ''}`}></div>
              {isConfirmationActive ? "Confirmer ma présence" : "Émargement clôturé"}
            </button>
            <p className="text-xs text-center text-slate-500 mt-4 leading-relaxed font-medium">
              En cliquant sur "Confirmer", vous certifiez sur l'honneur être l'auteur de cette signature. L'adresse IP et l'horodatage sont enregistrés.
            </p>
          </div>
        </form>
      )}

      {/* Modal d'Alerte */}
      <Modal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
        title={modalConfig.title}
      >
        <div className="flex flex-col items-center text-center space-y-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${modalConfig.isError ? 'bg-amber-100' : 'bg-blue-100'}`}>
            <AlertTriangle className={`w-6 h-6 ${modalConfig.isError ? 'text-amber-600' : 'text-blue-600'}`} />
          </div>
          <p className="text-slate-600 font-medium">
            {modalConfig.message}
          </p>
          <button
            onClick={() => setModalConfig({ ...modalConfig, isOpen: false })}
            className="w-full px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-md font-medium transition-colors"
          >
            D'accord
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default StudentView;
