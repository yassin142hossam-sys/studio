"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "@/lib/firebase-config";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  doc,
  deleteDoc,
  writeBatch,
} from "firebase/firestore";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import type { Student } from "@/lib/types";
import { PhoneAuth } from "@/components/phone-auth";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
  } from "@/components/ui/alert-dialog";
import {
  Search,
  User,
  Phone,
  LoaderCircle,
  Send,
  PlusCircle,
  BookOpen,
  ClipboardCheck as QuizzesIcon,
  CalendarDays,
  Trash2,
  LogOut,
} from "lucide-react";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { signOut } from "firebase/auth";

const StudentSearchSchema = z.object({
  studentCode: z
    .string()
    .min(1, { message: "Student code cannot be empty." })
    .max(10, { message: "Student code is too long." }),
});

const AddStudentSchema = z.object({
    code: z.string().min(1, "Code is required."),
    name: z.string().min(1, "Name is required."),
    parentWhatsApp: z.string().min(10, "A valid WhatsApp number is required."),
});

const MessageFormSchema = z.object({
    homework: z.string(),
    quiz: z.string(),
    attendance: z.enum(["On Time", "Late"]).optional(),
});

export function SchoolTalkClient() {
  const { toast } = useToast();
  const [user, loadingAuth] = useAuthState(auth);
  const [students, setStudents] = useState<Student[]>([]);
  const [foundStudent, setFoundStudent] = useState<Student | null>(null);
  const [isLoadingStudents, setIsLoadingStudents] = useState(true);
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [isSearching, setIsSearching] = useState(false);


  // Fetch students from Firestore when user is authenticated
  useEffect(() => {
    if (user) {
      const fetchStudents = async () => {
        setIsLoadingStudents(true);
        try {
          const studentsCollection = collection(db, "teachers", user.uid, "students");
          const studentSnapshot = await getDocs(studentsCollection);
          const studentList = studentSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          } as Student));
          setStudents(studentList);
        } catch (error) {
          console.error("Error fetching students:", error);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Could not fetch student data.",
          });
        }
        setIsLoadingStudents(false);
      };

      fetchStudents();
    } else {
      // Clear students when user logs out
      setStudents([]);
      setFoundStudent(null);
      setIsLoadingStudents(false);
    }
  }, [user, toast]);


  const handleLogout = async () => {
    await signOut(auth);
    toast({
        title: "Signed Out",
        description: "You have been successfully signed out.",
    });
  };

  const studentSearchForm = useForm<z.infer<typeof StudentSearchSchema>>({
    resolver: zodResolver(StudentSearchSchema),
    defaultValues: { studentCode: "" },
  });

  const addStudentForm = useForm<z.infer<typeof AddStudentSchema>>({
    resolver: zodResolver(AddStudentSchema),
    defaultValues: { code: "", name: "", parentWhatsApp: "" },
  });
  
  const messageForm = useForm<z.infer<typeof MessageFormSchema>>({
    resolver: zodResolver(MessageFormSchema),
    defaultValues: {
        homework: "",
        quiz: "",
    }
  });


  async function onStudentSearch(data: z.infer<typeof StudentSearchSchema>) {
    if (!user) return;
    setIsSearching(true);
    
    try {
        const studentsCollection = collection(db, "teachers", user.uid, "students");
        const q = query(studentsCollection, where("code", "==", data.studentCode.toLowerCase()));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const studentDoc = querySnapshot.docs[0];
            const found = { id: studentDoc.id, ...studentDoc.data() } as Student;
            setFoundStudent(found);
            messageForm.reset({ homework: "", quiz: "", attendance: undefined });
        } else {
            setFoundStudent(null);
            toast({
            variant: "destructive",
            title: "Student Not Found",
            description: "No student found with that code. Please try again.",
            });
        }
    } catch(error) {
        console.error("Error searching for student:", error);
        toast({ variant: "destructive", title: "Search Error", description: "An error occurred while searching." });
    }
    setIsSearching(false);
  }

  async function onAddStudent(data: z.infer<typeof AddStudentSchema>) {
    if (!user) return;
    setIsAddingStudent(true);

    try {
        // Check for duplicate code
        const studentsCollection = collection(db, "teachers", user.uid, "students");
        const q = query(studentsCollection, where("code", "==", data.code.toLowerCase()));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
            toast({
                variant: "destructive",
                title: "Student Code Exists",
                description: "A student with this code already exists.",
            });
            setIsAddingStudent(false);
            return;
        }

        const newStudentData = {
            ...data,
            code: data.code.toLowerCase(), // store code in lowercase for case-insensitive search
        };

        const docRef = await addDoc(studentsCollection, newStudentData);
        
        const newStudent: Student = { id: docRef.id, ...newStudentData };
        setStudents([...students, newStudent]);
        
        toast({
            title: "Student Added",
            description: `${data.name} has been added to your account.`,
        });
        addStudentForm.reset();

    } catch(error) {
        console.error("Error adding student:", error);
        toast({ variant: "destructive", title: "Error", description: "Could not add student." });
    }
    setIsAddingStudent(false);
  }

  async function onDeleteStudent(studentId: string) {
    if(!user) return;
    try {
        await deleteDoc(doc(db, "teachers", user.uid, "students", studentId));
        setStudents(students.filter(s => s.id !== studentId));
        setFoundStudent(null);
        toast({
            title: "Student Deleted",
            description: "The student has been removed from your account.",
        });
    } catch (error) {
        console.error("Error deleting student:", error);
        toast({ variant: "destructive", title: "Error", description: "Could not delete student." });
    }
  }


  const handleSendWhatsApp = (data: z.infer<typeof MessageFormSchema>) => {
    if (!foundStudent) return;
    
    let messageParts: string[] = [];
    if(data.homework) messageParts.push(`Homework: ${data.homework}`);
    if(data.quiz) messageParts.push(`Quiz: ${data.quiz}`);
    if(data.attendance) messageParts.push(`Attendance: ${data.attendance}`);

    if (messageParts.length === 0) {
        toast({
            variant: "destructive",
            title: "Empty Message",
            description: "Please fill out at least one field to send a message.",
        });
        return;
    }

    const date = new Date().toLocaleDateString();
    const message = `[${date}] مع حضرتك اسيستنت Mrs. Hanaa Abdel-Majid بنبلغ حضرتك بأداء الطالب/ة: ${foundStudent.name}\n\n- ${messageParts.join('\n\n- ')}`;

    const url = `whatsapp://send?phone=${foundStudent.parentWhatsApp}&text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  if (loadingAuth) {
    return (
        <div className="flex justify-center items-center h-64">
            <LoaderCircle className="animate-spin text-primary" size={48} />
        </div>
    );
  }
  
  if (!user) {
    return <PhoneAuth />;
  }

  return (
    <div className="space-y-8">

      <Card>
          <CardHeader className="flex-row justify-between items-center">
              <div>
                  <CardTitle>Teacher Account</CardTitle>
                  <CardDescription>
                      Signed in as {user.phoneNumber}
                  </CardDescription>
              </div>
              <Button variant="outline" onClick={handleLogout}>
                  <LogOut /> <span className="hidden sm:inline ml-2">Sign Out</span>
              </Button>
          </CardHeader>
      </Card>
      
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Find Student</CardTitle>
          <CardDescription>
            Enter a student's unique code to retrieve their information.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...studentSearchForm}>
            <form onSubmit={studentSearchForm.handleSubmit(onStudentSearch)} className="flex gap-4">
              <FormField
                control={studentSearchForm.control}
                name="studentCode"
                render={({ field }) => (
                  <FormItem className="flex-grow">
                    <FormLabel className="sr-only">Student Code</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., st001"
                        {...field}
                        className="text-base"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isSearching}>
                {isSearching ? (
                  <LoaderCircle className="animate-spin" />
                ) : (
                  <Search />
                )}
                <span className="hidden sm:inline ml-2">Find Student</span>
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Add New Student</CardTitle>
          <CardDescription>
            Add a new student to your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <Form {...addStudentForm}>
                <form onSubmit={addStudentForm.handleSubmit(onAddStudent)} className="space-y-4">
                    <FormField
                        control={addStudentForm.control}
                        name="code"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Student Code</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g., ST004" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={addStudentForm.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Student Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g., John Doe" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={addStudentForm.control}
                        name="parentWhatsApp"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Parent's WhatsApp Number</FormLabel>
                                <FormControl>
                                    <Input placeholder="e.g., +1234567890" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button type="submit" disabled={isAddingStudent}>
                        {isAddingStudent ? (
                        <LoaderCircle className="animate-spin" />
                        ) : (
                        <PlusCircle />
                        )}
                        <span className="ml-2">Add Student</span>
                    </Button>
                </form>
            </Form>
        </CardContent>
      </Card>

      {foundStudent && (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                        <User /> {foundStudent.name}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2 pt-1">
                            <Phone size={16} />
                            {`Parent's WhatsApp: ${foundStudent.parentWhatsApp}`}
                        </CardDescription>
                    </div>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="icon">
                                <Trash2 />
                                <span className="sr-only">Delete Student</span>
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the student
                                from your account.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => onDeleteStudent(foundStudent.id)}>
                                Delete
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </CardHeader>
          <CardContent>
            <Form {...messageForm}>
                <form onSubmit={messageForm.handleSubmit(handleSendWhatsApp)} className="space-y-6">
                    <FormField
                        control={messageForm.control}
                        name="homework"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="flex items-center gap-2"><BookOpen/> Homework</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="Enter homework details or mark..." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={messageForm.control}
                        name="quiz"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="flex items-center gap-2"><QuizzesIcon/> Quiz</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="Enter quiz details or score..." {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={messageForm.control}
                        name="attendance"
                        render={({ field }) => (
                            <FormItem className="space-y-3">
                                <FormLabel className="flex items-center gap-2"><CalendarDays/> Attendance</FormLabel>
                                <FormControl>
                                    <RadioGroup
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    className="flex items-center space-x-4"
                                    >
                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                        <FormControl>
                                        <RadioGroupItem value="On Time" />
                                        </FormControl>
                                        <FormLabel className="font-normal">
                                        On Time
                                        </FormLabel>
                                    </FormItem>
                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                        <FormControl>
                                        <RadioGroupItem value="Late" />
                                        </FormControl>
                                        <FormLabel className="font-normal">
                                        Late
                                        </FormLabel>
                                    </FormItem>
                                    </RadioGroup>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <CardFooter className="px-0 pt-4 justify-end">
                        <Button type="submit">
                            <Send />
                            <span className="ml-2">Send via WhatsApp</span>
                        </Button>
                    </CardFooter>
                </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {user && !isLoadingStudents && students.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Students</CardTitle>
            <CardDescription>A list of all students in your account.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {students.map(s => (
                <li key={s.id} className="flex justify-between items-center p-2 rounded-md hover:bg-muted">
                    <div>
                        <p className="font-semibold">{s.name}</p>
                        <p className="text-sm text-muted-foreground">Code: {s.code}</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => studentSearchForm.handleSubmit(onStudentSearch)({ studentCode: s.code })}>
                        View
                    </Button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

    </div>
  );
}
