"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

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
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
  } from "@/components/ui/dialog";
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
  ArrowRightLeft,
} from "lucide-react";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";

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

const TransferStudentsSchema = z.object({
    fromNumber: z.string().min(10, "A valid WhatsApp number is required."),
});


export function SchoolTalkClient() {
  const { toast } = useToast();
  const [foundStudent, setFoundStudent] = useState<Student | null>(null);
  const [isLoadingStudent, setIsLoadingStudent] = useState(false);
  const [teacherWhatsapp, setTeacherWhatsapp] = useState("");
  const [previousTeacherWhatsapp, setPreviousTeacherWhatsapp] = useState("");
  const [showWhatsappModal, setShowWhatsappModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showNewNumberAlert, setShowNewNumberAlert] = useState(false);
  const [newNumber, setNewNumber] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [isAddingStudent, setIsAddingStudent] = useState(false);

  // Load teacher's number and their students from localStorage
  useEffect(() => {
    const storedWhatsapp = localStorage.getItem("teacherWhatsapp");
    if (storedWhatsapp) {
      setTeacherWhatsapp(storedWhatsapp);
      const allStudentsData = JSON.parse(localStorage.getItem("allStudents") || "{}");
      setStudents(allStudentsData[storedWhatsapp] || []);
    } else {
      setShowWhatsappModal(true);
    }
  }, []);

  // Effect to save students to localStorage whenever the list changes
  useEffect(() => {
    if (teacherWhatsapp) {
      const allStudentsData = JSON.parse(localStorage.getItem("allStudents") || "{}");
      allStudentsData[teacherWhatsapp] = students;
      localStorage.setItem("allStudents", JSON.stringify(allStudentsData));
    }
  }, [students, teacherWhatsapp]);

  const handleSaveWhatsapp = (numberToSave: string) => {
    if (numberToSave.length >= 10) {
        const allStudentsData = JSON.parse(localStorage.getItem("allStudents") || "{}");
        
        if (allStudentsData[numberToSave]) {
            // Number exists, sign in to this account
            setTeacherWhatsapp(numberToSave);
            setStudents(allStudentsData[numberToSave]);
            localStorage.setItem("teacherWhatsapp", numberToSave);
            setShowWhatsappModal(false);
            toast({
                title: "Account Switched",
                description: `Signed in to account for ...${numberToSave.slice(-4)}.`,
            });
        } else {
            // This is a new number
            setNewNumber(numberToSave);
            if (teacherWhatsapp) {
                // We are changing from an existing number, ask to transfer
                setPreviousTeacherWhatsapp(teacherWhatsapp);
                setShowNewNumberAlert(true);
            } else {
                // First time setup
                switchAccount(numberToSave, false);
            }
        }
    } else {
      toast({
        variant: "destructive",
        title: "Invalid Number",
        description: "Please enter a valid WhatsApp number.",
      });
    }
  };

  const switchAccount = (newNumber: string, transfer: boolean) => {
    const allStudentsData = JSON.parse(localStorage.getItem("allStudents") || "{}");
    let studentsToSet = [];

    if (transfer && previousTeacherWhatsapp && allStudentsData[previousTeacherWhatsapp]) {
        studentsToSet = allStudentsData[previousTeacherWhatsapp];
        allStudentsData[newNumber] = studentsToSet;
        delete allStudentsData[previousTeacherWhatsapp]; // Move data
        toast({
            title: "Account and Data Transferred",
            description: `Moved student data to new number ...${newNumber.slice(-4)}.`,
        });
    } else {
        toast({
            title: "New Account Created",
            description: `Your new WhatsApp number ...${newNumber.slice(-4)} has been saved.`,
        });
    }

    setTeacherWhatsapp(newNumber);
    setStudents(studentsToSet);
    localStorage.setItem("teacherWhatsapp", newNumber);
    localStorage.setItem("allStudents", JSON.stringify(allStudentsData));
    
    setShowWhatsappModal(false);
    setShowNewNumberAlert(false);
    setNewNumber("");
    setPreviousTeacherWhatsapp("");
  }
  
  const handleLogout = () => {
    setPreviousTeacherWhatsapp(teacherWhatsapp);
    setTeacherWhatsapp("");
    setFoundStudent(null);
    setStudents([]);
    setShowWhatsappModal(true);
  }

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

  const transferStudentsForm = useForm<z.infer<typeof TransferStudentsSchema>>({
    resolver: zodResolver(TransferStudentsSchema),
    defaultValues: { fromNumber: "" },
  });


  function onStudentSearch(data: z.infer<typeof StudentSearchSchema>) {
    setIsLoadingStudent(true);
    // Simulate API call
    setTimeout(() => {
      const student = students.find(
        (s) => s.code.toLowerCase() === data.studentCode.toLowerCase()
      );
      if (student) {
        setFoundStudent(student);
        messageForm.reset({ homework: "", quiz: "", attendance: undefined });
      } else {
        setFoundStudent(null);
        toast({
          variant: "destructive",
          title: "Student Not Found",
          description: "No student found with that code. Please try again.",
        });
      }
      setIsLoadingStudent(false);
    }, 500);
  }

  function onAddStudent(data: z.infer<typeof AddStudentSchema>) {
    setIsAddingStudent(true);
    setTimeout(() => {
        if (students.some(s => s.code.toLowerCase() === data.code.toLowerCase())) {
            toast({
                variant: "destructive",
                title: "Student Code Exists",
                description: "A student with this code already exists.",
            });
            setIsAddingStudent(false);
            return;
        }

        const newStudent: Student = {
            id: (students.length + 1).toString(),
            ...data,
            homework: [],
            quizzes: [],
            attendance: [],
        };
        setStudents([...students, newStudent]);
        toast({
            title: "Student Added",
            description: `${data.name} has been added to your account.`,
        });
        addStudentForm.reset();
        setIsAddingStudent(false);
    }, 500);
  }

  function onDeleteStudent(studentId: string) {
    setStudents(students.filter(s => s.id !== studentId));
    setFoundStudent(null);
    toast({
        title: "Student Deleted",
        description: "The student has been removed from your account.",
    });
  }

  function onTransferStudents(data: z.infer<typeof TransferStudentsSchema>) {
    const allStudentsData = JSON.parse(localStorage.getItem("allStudents") || "{}");
    const { fromNumber } = data;

    if (fromNumber === teacherWhatsapp) {
        toast({ variant: "destructive", title: "Cannot transfer from current account." });
        return;
    }

    if (allStudentsData[fromNumber]) {
        const studentsFromOtherAccount = allStudentsData[fromNumber];
        const currentStudentCodes = new Set(students.map(s => s.code.toLowerCase()));
        
        // Filter out students that would cause a code collision
        const newStudents = studentsFromOtherAccount.filter((s: Student) => !currentStudentCodes.has(s.code.toLowerCase()));
        const skippedCount = studentsFromOtherAccount.length - newStudents.length;

        setStudents([...students, ...newStudents]);
        delete allStudentsData[fromNumber]; // Remove old account data
        localStorage.setItem("allStudents", JSON.stringify(allStudentsData));

        toast({
            title: "Transfer Complete",
            description: `${newStudents.length} students transferred. ${skippedCount > 0 ? `${skippedCount} students skipped due to duplicate codes.` : ""}`,
        });
        setShowTransferModal(false);
        transferStudentsForm.reset();

    } else {
        toast({ variant: "destructive", title: "Account Not Found", description: "No students found for that WhatsApp number." });
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
  
  const [whatsappInputValue, setWhatsappInputValue] = useState("");
  useEffect(() => {
    setWhatsappInputValue(previousTeacherWhatsapp);
  }, [previousTeacherWhatsapp]);

  return (
    <div className="space-y-8">
        <Dialog open={showWhatsappModal} onOpenChange={(isOpen) => { if (!isOpen && !teacherWhatsapp) { setShowWhatsappModal(true) } else { setShowWhatsappModal(isOpen) }}}>
            <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
            <DialogHeader>
                <DialogTitle>Enter Your WhatsApp Number</DialogTitle>
                <DialogDescription>
                This number will act as your account. Students you add will be saved under this number.
                </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <Input
                placeholder="Your WhatsApp Number"
                value={whatsappInputValue}
                onChange={(e) => setWhatsappInputValue(e.target.value)}
                />
            </div>
            <DialogFooter>
                <Button onClick={() => handleSaveWhatsapp(whatsappInputValue)}>Save and Continue</Button>
            </DialogFooter>
            </DialogContent>
      </Dialog>
      
      <AlertDialog open={showNewNumberAlert} onOpenChange={setShowNewNumberAlert}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>New Number Detected</AlertDialogTitle>
            <AlertDialogDescription>
                It looks like this is a new number. Do you want to transfer your existing students from ...{previousTeacherWhatsapp.slice(-4)} to this new number ...{newNumber.slice(-4)}?
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <Button variant="outline" onClick={() => switchAccount(newNumber, false)}>No, Start Fresh</Button>
            <Button onClick={() => switchAccount(newNumber, true)}>Yes, Transfer Data</Button>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={showTransferModal} onOpenChange={setShowTransferModal}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Transfer Students</DialogTitle>
                    <DialogDescription>
                        Enter another WhatsApp number to transfer all its students to your current account. The other account will be deleted after transfer.
                    </DialogDescription>
                </DialogHeader>
                <Form {...transferStudentsForm}>
                    <form onSubmit={transferStudentsForm.handleSubmit(onTransferStudents)} className="space-y-4 py-4">
                        <FormField
                            control={transferStudentsForm.control}
                            name="fromNumber"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>WhatsApp Number to Transfer From</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter the old number" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <DialogFooter>
                            <Button type="submit">Transfer Students</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
      </Dialog>

      {teacherWhatsapp && (
        <Card>
            <CardHeader className="flex-row justify-between items-center">
                <div>
                    <CardTitle>Teacher Account</CardTitle>
                    <CardDescription>
                        Signed in as ...{teacherWhatsapp.slice(-4)}
                    </CardDescription>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setShowTransferModal(true)}>
                        <ArrowRightLeft /> <span className="hidden sm:inline ml-2">Transfer</span>
                    </Button>
                    <Button variant="outline" onClick={handleLogout}>
                        <LogOut /> <span className="hidden sm:inline ml-2">Change Account</span>
                    </Button>
                </div>
            </CardHeader>
        </Card>
      )}

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
                        placeholder="e.g., ST001"
                        {...field}
                        className="text-base"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoadingStudent || !teacherWhatsapp}>
                {isLoadingStudent ? (
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
                                    <Input placeholder="e.g., 1234567890" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button type="submit" disabled={isAddingStudent || !teacherWhatsapp}>
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
                            {`Parent's WhatsApp: ...${foundStudent.parentWhatsApp.slice(-4)}`}
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
    </div>
  );
}
