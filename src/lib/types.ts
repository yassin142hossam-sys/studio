export type Student = {
  id: string;
  code: string;
  name: string;
  parentWhatsApp: string;
  homework: { subject: string; task: string; dueDate: string; completed: boolean }[];
  quizzes: { subject: string; topic: string; score: number | null; date: string }[];
  attendance: { date: string; status: 'Present' | 'Late' | 'Absent' | 'Early' }[];
};
