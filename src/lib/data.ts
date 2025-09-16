import type { Student } from '@/lib/types';

export const students: Student[] = [
  {
    id: '1',
    code: 'ST001',
    name: 'Alex Johnson',
    parentWhatsApp: '12345678901',
    homework: [
      { subject: 'Math', task: 'Algebra II, Chapter 3 exercises', dueDate: '2024-08-15', completed: true },
      { subject: 'Science', task: 'Lab report on photosynthesis', dueDate: '2024-08-16', completed: false },
    ],
    quizzes: [
      { subject: 'History', topic: 'The Roman Empire', score: 88, date: '2024-08-10' },
      { subject: 'English', topic: 'Shakespeare\'s Sonnets', score: 92, date: '2024-08-12' },
    ],
    attendance: [
      { date: '2024-08-12', status: 'Present' },
      { date: '2024-08-11', status: 'Present' },
      { date: '2024-08-10', status: 'Late' },
      { date: '2024-08-09', status: 'Early' },
    ],
  },
  {
    id: '2',
    code: 'ST002',
    name: 'Maria Garcia',
    parentWhatsApp: '10987654321',
    homework: [
      { subject: 'Art', task: 'Sketch a still life', dueDate: '2024-08-14', completed: true },
    ],
    quizzes: [
      { subject: 'Math', topic: 'Geometry Proofs', score: 76, date: '2024-08-09' },
    ],
    attendance: [
      { date: '2024-08-12', status: 'Present' },
      { date: '2024-08-11', status: 'Absent' },
      { date: '2024-08-10', status: 'Present' },
    ],
  },
  {
    id: '3',
    code: 'ST003',
    name: 'Chen Wei',
    parentWhatsApp: '15551234567',
    homework: [
      { subject: 'Science', task: 'Read Chapter 5', dueDate: '2024-08-15', completed: true },
      { subject: 'History', task: 'Essay on the Silk Road', dueDate: '2024-08-18', completed: false },
    ],
    quizzes: [
      { subject: 'Physics', topic: 'Newtonian Mechanics', score: null, date: '2024-08-14' },
    ],
    attendance: [
      { date: '2024-08-12', status: 'Present' },
      { date: '2024-08-11', status: 'Present' },
      { date: '2024-08-10', status: 'Present' },
    ],
  },
];
