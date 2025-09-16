export type Student = {
  id: string;
  code: string;
  name: string;
  parentWhatsApp: string;
  homework: { subject: string; task: string; dueDate: string; completed: boolean; mark: string | null; }[];
  quizzes: { subject: string; topic: string; score: number | null; date: string; mark: string | null; }[];
  attendance: { date: string; status: 'Late' | 'On Time' };
};
