import React, { createContext, useState, useEffect, useContext } from 'react';

// Création du Context
const AttendanceContext = createContext();

// Hook personnalisé pour utiliser le Context plus facilement
export const useAttendance = () => useContext(AttendanceContext);

export const AttendanceProvider = ({ children }) => {
  // --- ÉTATS ---
  // Charger les données depuis le localStorage s'il y en a, sinon utiliser les valeurs par défaut
  const [exams, setExams] = useState(() => {
    const savedExams = localStorage.getItem('exams');
    return savedExams ? JSON.parse(savedExams) : [
      { id: '1', subject: 'Mathématiques Avancées', semester: 'S1', session: 'Session Normale' }
    ];
  });

  const [signatures, setSignatures] = useState(() => {
    const savedSignatures = localStorage.getItem('signatures');
    return savedSignatures ? JSON.parse(savedSignatures) : [];
  });

  const [majors, setMajors] = useState(() => {
    const savedMajors = localStorage.getItem('majors');
    return savedMajors ? JSON.parse(savedMajors) : [
      { id: '1', name: 'Informatique de Gestion' },
      { id: '2', name: 'Réseaux et Télécoms' },
      { id: '3', name: 'Droit des Affaires' },
      { id: '4', name: 'Marketing et Communication' }
    ];
  });

  const [isConfirmationActive, setIsConfirmationActive] = useState(() => {
    const savedState = localStorage.getItem('isConfirmationActive');
    return savedState ? JSON.parse(savedState) : true;
  });

  // --- PERSISTANCE ---
  // Sauvegarder dans le localStorage à chaque changement
  useEffect(() => {
    localStorage.setItem('exams', JSON.stringify(exams));
  }, [exams]);

  useEffect(() => {
    localStorage.setItem('signatures', JSON.stringify(signatures));
  }, [signatures]);

  useEffect(() => {
    localStorage.setItem('majors', JSON.stringify(majors));
  }, [majors]);

  useEffect(() => {
    localStorage.setItem('isConfirmationActive', JSON.stringify(isConfirmationActive));
  }, [isConfirmationActive]);

  // --- ACTIONS ---
  const addSignature = (newRecord) => {
    setSignatures(prev => [newRecord, ...prev]);
  };

  const addExam = (newExam) => {
    setExams(prev => [...prev, newExam]);
  };

  const deleteExam = (id) => {
    setExams(prev => prev.filter(exam => exam.id !== id));
    // Supprimer aussi les signatures associées à cet examen pour éviter les orphelins
    setSignatures(prev => prev.filter(sig => sig.examId !== id));
  };

  const addMajor = (majorName) => {
    setMajors(prev => [...prev, { id: Date.now().toString(), name: majorName }]);
  };

  const deleteMajor = (id) => {
    setMajors(prev => prev.filter(major => major.id !== id));
  };

  const updateSignature = (id, updatedData) => {
    setSignatures(prev => prev.map(sig => sig.id === id ? { ...sig, ...updatedData } : sig));
  };

  const resetAllData = () => {
    setExams([]);
    setSignatures([]);
    setMajors([]);
    localStorage.removeItem('exams');
    localStorage.removeItem('signatures');
    localStorage.removeItem('majors');
  };

  const getSignaturesByExam = (examId) => {
    if (examId === 'all') return signatures;
    return signatures.filter(s => s.examId === examId);
  };

  const toggleConfirmation = () => {
    setIsConfirmationActive(prev => !prev);
  };

  // Valeurs exposées par le Context
  const value = {
    exams,
    signatures,
    majors,
    isConfirmationActive, // Nouvel état
    addSignature,
    addExam,
    deleteExam,
    addMajor,
    deleteMajor,
    updateSignature,
    resetAllData,
    getSignaturesByExam,
    toggleConfirmation // Nouvelle fonction
  };

  return (
    <AttendanceContext.Provider value={value}>
      {children}
    </AttendanceContext.Provider>
  );
};
