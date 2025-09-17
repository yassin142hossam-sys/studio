export type Student = {
  id: string; // Firestore document ID
  code: string;
  name: string;
  parentWhatsApp: string;
  // These fields are not stored on the main student object in Firestore
  // but can be subcollections. For simplicity, we'll keep them here for now
  // but they won't be directly populated from the main student doc.
  homework?: { subject: string; task: string; dueDate: string; completed: boolean; mark: string | null; }[];
  quizzes?: { subject: string; topic: string; score: number | null; date: string; mark: string | null; }[];
  attendance?: { date: string; status: 'Late' | 'On Time' }[];
};
