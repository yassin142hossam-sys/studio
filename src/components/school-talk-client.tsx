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
import { students as initialStudents } from "@/lib/data";
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
  Search,
  User,
  Phone,
  LoaderCircle,
  Send,
  PlusCircle,
  BookOpen,
  ClipboardCheck as QuizzesIcon,
  CalendarDays,
} from "lucide-react";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";

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
  const [foundStudent, setFoundStudent] = useState<Student | null>(null);
  const [isLoadingStudent, setIsLoadingStudent] = useState(false);
  const [teacherWhatsapp, setTeacherWhatsapp] = useState("");
  const [showWhatsappModal, setShowWhatsappModal] = useState(false);
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [isAddingStudent, setIsAddingStudent] = useState(false);

  useEffect(() => {
    const storedWhatsapp = localStorage.getItem("teacherWhatsapp");
    if (storedWhatsapp) {
      setTeacherWhatsapp(storedWhatsapp);
    } else {
      setShowWhatsappModal(true);
    }
  }, []);

  const handleSaveWhatsapp = () => {
    if (teacherWhatsapp.length >= 10) {
      localStorage.setItem("teacherWhatsapp", teacherWhatsapp);
      setShowWhatsappModal(false);
      toast({
        title: "WhatsApp Number Saved",
        description: "Your WhatsApp number has been saved successfully.",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Invalid Number",
        description: "Please enter a valid WhatsApp number.",
      });
    }
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
            description: `${data.name} has been added to the list.`,
        });
        addStudentForm.reset();
        setIsAddingStudent(false);
    }, 500);
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
    const message = `[${date}] مع حضرتك اسيستنت Mrs. Hanaa Abdel-Majid بنبلغ حضرتك بأداء الطالب/ة: ${foundStudent.name}\n\n- ${messageParts.join('\n- ')}`;

    const url = `whatsapp://send?phone=${foundStudent.parentWhatsApp}&text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="space-y-8">
        <Dialog open={showWhatsappModal} onOpenChange={setShowWhatsappModal}>
            <DialogContent>
            <DialogHeader>
                <DialogTitle>Enter Your WhatsApp Number</DialogTitle>
                <DialogDescription>
                Please enter your WhatsApp number to send messages to parents. This will be stored locally on your device.
                </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <Input
                placeholder="Your WhatsApp Number"
                value={teacherWhatsapp}
                onChange={(e) => setTeacherWhatsapp(e.target.value)}
                />
            </div>
            <DialogFooter>
                <Button onClick={handleSaveWhatsapp}>Save Number</Button>
            </DialogFooter>
            </DialogContent>
      </Dialog>
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
              <Button type="submit" disabled={isLoadingStudent}>
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
            Add a new student to the records.
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
                <CardTitle className="flex items-center gap-2">
                <User /> {foundStudent.name}
                </CardTitle>
                <CardDescription className="flex items-center gap-2 pt-1">
                    <Phone size={16} />
                    {`Parent's WhatsApp: ...${foundStudent.parentWhatsApp.slice(-4)}`}
                </CardDescription>
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
