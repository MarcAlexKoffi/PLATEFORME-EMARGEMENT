import React, { createContext, useState, useEffect, useContext } from 'react';
import { db } from '../firebase-config'; // Import de la configuration Firebase
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  query, 
  orderBy,
  runTransaction,
  writeBatch
} from 'firebase/firestore';

// Création du Context
const AttendanceContext = createContext();

// Hook personnalisé pour utiliser le Context plus facilement
export const useAttendance = () => useContext(AttendanceContext);

export const AttendanceProvider = ({ children }) => {
  // --- ÉTATS ---
  const [exams, setExams] = useState([]);
  const [signatures, setSignatures] = useState([]);
  const [majors, setMajors] = useState([]);
  // On stocke l'ID du doc de config pour pouvoir le mettre à jour
  const [configId, setConfigId] = useState(null); 
  const [isConfirmationActive, setIsConfirmationActive] = useState(true);
  const [loading, setLoading] = useState(true);

  // --- SYNCHRONISATION TEMPS RÉEL (FIRESTORE) ---

  // 1. Écouter les Examens
  useEffect(() => {
    // onSnapshot écoute les changements en direct
    const q = query(collection(db, 'exams'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const examsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setExams(examsData);
    });
    return unsubscribe;
  }, []);

  // 2. Écouter les Signatures (ordre décroissant par timestamp si souhaité)
  useEffect(() => {
    const q = query(collection(db, 'signatures'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const sigsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setSignatures(sigsData);
    });
    return unsubscribe;
  }, []);

  // 3. Écouter les Filières
  useEffect(() => {
    const q = query(collection(db, 'majors'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const majorsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMajors(majorsData);
    });
    return unsubscribe;
  }, []);

  // 4. Écouter la Configuration (pour le bouton actif/inactif)
  useEffect(() => {
    const q = query(collection(db, 'config'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const configDoc = snapshot.docs[0];
        setConfigId(configDoc.id);
        setIsConfirmationActive(configDoc.data().isConfirmationActive);
      } else {
        // Si aucune config n'existe, on en crée une par défaut
        addDoc(collection(db, 'config'), { isConfirmationActive: true });
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);


  // --- ACTIONS (Écriture dans Firestore) ---

  const addSignature = async (newRecord) => {
    try {
      // On retire l'ID généré localement car Firestore en crée un automatiquement
      const { id, ...recordData } = newRecord;
      
      // Ajout de métadonnées pour mieux structurer (date de création précise)
      const enrichedRecord = {
        ...recordData,
        createdAt: new Date().toISOString(), // Format ISO standard pour tri
        verified: false // Statut par défaut
      };

      await addDoc(collection(db, 'signatures'), enrichedRecord);
    } catch (error) {
      console.error("Erreur lors de l'ajout de la signature:", error);
      alert("Erreur de connexion. La signature n'a pas pu être envoyée.");
    }
  };

  const addExam = async (newExam) => {
    try {
      const { id, ...examData } = newExam; 
      
      const enrichedExam = {
        ...examData,
        createdAt: new Date().toISOString(),
        isActive: true // Pour pouvoir archiver des examens plus tard sans les supprimer
      };

      await addDoc(collection(db, 'exams'), enrichedExam);
    } catch (error) {
      console.error("Erreur ajout examen:", error);
    }
  };

  const deleteExam = async (id) => {
    try {
      await deleteDoc(doc(db, 'exams', id));
      // Optionnel : Supprimer les signatures orphelines (complexe à faire côté client sans Cloud Functions, 
      // mais on peut le faire ici si le volume est faible)
    } catch (error) {
      console.error("Erreur suppression examen:", error);
    }
  };

  const addMajor = async (majorName) => {
    try {
      await addDoc(collection(db, 'majors'), { 
        name: majorName,
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("Erreur ajout filière:", error);
    }
  };

  const deleteMajor = async (id) => {
    try {
      await deleteDoc(doc(db, 'majors', id));
    } catch (error) {
      console.error("Erreur suppression filière:", error);
    }
  };

  const updateSignature = async (id, updatedData) => {
    try {
      const signatureRef = doc(db, 'signatures', id);
      await updateDoc(signatureRef, updatedData);
    } catch (error) {
      console.error("Erreur mise à jour signature:", error);
    }
  };

  const deleteSignature = async (id) => {
    try {
      await deleteDoc(doc(db, 'signatures', id));
    } catch (error) {
      console.error("Erreur suppression signature:", error);
    }
  };

  const resetAllData = async () => {
    try {
      const batch = writeBatch(db);
      
      // Attention: Firestore ne permet pas de supprimer une collection entière d'un coup.
      // Il faut supprimer document par document.
      // Limité à 500 opérations par batch.

      // 1. Supprimer signatures
      signatures.forEach(sig => {
        batch.delete(doc(db, 'signatures', sig.id));
      });
      
      // 2. Supprimer examens
      exams.forEach(ex => {
        batch.delete(doc(db, 'exams', ex.id));
      });

      // 3. Supprimer filières
      majors.forEach(m => {
        batch.delete(doc(db, 'majors', m.id));
      });

      await batch.commit();
      
      // Reset localStorage pour être propre
      localStorage.removeItem('exams');
      localStorage.removeItem('signatures');
      localStorage.removeItem('majors');
    } catch (error) {
      console.error("Erreur reset:", error);
      alert("Erreur lors de la réinitialisation. Vérifiez la console.");
    }
  };

  const toggleConfirmation = async () => {
    if (configId) {
      try {
        const configRef = doc(db, 'config', configId);
        await updateDoc(configRef, { 
          isConfirmationActive: !isConfirmationActive 
        });
        // L'état local se mettra à jour automatiquement grâce au onSnapshot
      } catch (error) {
        console.error("Erreur toggle confirmation:", error);
      }
    }
  };

  const getSignaturesByExam = (examId) => {
    if (examId === 'all') return signatures;
    return signatures.filter(s => s.examId === examId);
  };

  // Valeurs exposées par le Context
  const value = {
    exams,
    signatures,
    majors,
    isConfirmationActive,
    loading, // Pour pouvoir afficher un chargement global si besoin
    addSignature,
    addExam,
    deleteExam,
    addMajor,
    deleteMajor,
    deleteSignature,
    updateSignature,
    resetAllData,
    getSignaturesByExam,
    toggleConfirmation
  };

  return (
    <AttendanceContext.Provider value={value}>
      {children}
    </AttendanceContext.Provider>
  );
};
