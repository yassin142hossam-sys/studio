export type Student = {
  id: string; // Firestore document ID
  code: string;
  name: string;
  parentWhatsApp: string;
};

export type TeacherAccount = {
  id: string; // The phone number, also the document ID in Firestore
  accessCodeHash: string;
};
