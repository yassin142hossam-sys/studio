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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { students as initialStudents } from "@/lib/data";
import type { Student } from "@/lib/types";
import {
  checkMessageTone,
  type CheckMessageToneOutput,
} from "@/ai/flows/check-message-tone";
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
  BookOpen,
  ClipboardCheck as QuizzesIcon,
  CalendarDays,
  Sparkles,
  LoaderCircle,
  Send,
  AlertTriangle,
  Smile,
  Frown,
  Meh,
  CheckCircle,
  XCircle,
  PlusCircle,
} from "lucide-react";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";

const FormSchema = z.object({
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

export function SchoolTalkClient() {
  const { toast } = useToast();
  const [foundStudent, setFoundStudent] = useState<Student | null>(null);
  const [message, setMessage] = useState("");
  const [toneAnalysis, setToneAnalysis] =
    useState<CheckMessageToneOutput | null>(null);
  const [isCheckingTone, setIsCheckingTone] = useState(false);
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

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: { studentCode: "" },
  });

  const addStudentForm = useForm<z.infer<typeof AddStudentSchema>>({
    resolver: zodResolver(AddStudentSchema),
    defaultValues: { code: "", name: "", parentWhatsApp: "" },
  });

  function onStudentSearch(data: z.infer<typeof FormSchema>) {
    setIsLoadingStudent(true);
    // Simulate API call
    setTimeout(() => {
      const student = students.find(
        (s) => s.code.toLowerCase() === data.studentCode.toLowerCase()
      );
      if (student) {
        setFoundStudent(student);
        setToneAnalysis(null);
        setMessage("");
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

  const handleCheckTone = async () => {
    if (!message) {
      toast({
        variant: "destructive",
        title: "Empty Message",
        description: "Please write a message before checking the tone.",
      });
      return;
    }
    setIsCheckingTone(true);
    setToneAnalysis(null);
    try {
      const result = await checkMessageTone({ message });
      setToneAnalysis(result);
    } catch (error) {
      console.error("Error checking message tone:", error);
      toast({
        variant: "destructive",
        title: "AI Error",
        description: "Could not analyze the message tone.",
      });
    } finally {
      setIsCheckingTone(false);
    }
  };

  const handleSendWhatsApp = () => {
    if (!foundStudent) return;
    if (!message) {
      toast({
        variant: "destructive",
        title: "Empty Message",
        description: "Please write a message to send.",
      });
      return;
    }
    const date = new Date().toLocaleDateString();
    const messageWithDate = `[${date}] ${message}`;

    const url = `https://wa.me/${
      foundStudent.parentWhatsApp
    }?text=${encodeURIComponent(messageWithDate)}`;
    window.open(url, "_blank");
  };
  
  const getToneIcon = (tone: string) => {
    const lowerTone = tone.toLowerCase();
    if (lowerTone.includes("positive")) return <Smile className="text-green-600" />;
    if (lowerTone.includes("negative")) return <Frown className="text-red-600" />;
    if (lowerTone.includes("neutral")) return <Meh className="text-yellow-600" />;
    return <AlertTriangle className="text-gray-500" />;
  };

  const handleHomeworkMarkChange = (index: number, mark: string) => {
    if (!foundStudent) return;
    const updatedStudent = { ...foundStudent };
    updatedStudent.homework[index].mark = mark;
    setFoundStudent(updatedStudent);
  };

  const handleQuizMarkChange = (index: number, mark: string) => {
    if (!foundStudent) return;
    const updatedStudent = { ...foundStudent };
    updatedStudent.quizzes[index].mark = mark;
    setFoundStudent(updatedStudent);
  };
  
  const handleAttendanceChange = (index: number, status: 'Late' | 'On Time') => {
    if (!foundStudent) return;
    const updatedStudent = { ...foundStudent };
    updatedStudent.attendance[index].status = status;
    setFoundStudent(updatedStudent);
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
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onStudentSearch)} className="flex gap-4">
              <FormField
                control={form.control}
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
              <User /> Student Information
            </CardTitle>
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 pt-2">
              <p className="text-xl font-semibold text-foreground">
                {foundStudent.name}
              </p>
              <p className="flex items-center gap-2 text-muted-foreground">
                <Phone size={16} />
                {`Parent's WhatsApp: ...${foundStudent.parentWhatsApp.slice(-4)}`}
              </p>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="homework">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="homework">
                  <BookOpen className="mr-2" /> Homework
                </TabsTrigger>
                <TabsTrigger value="quizzes">
                  <QuizzesIcon className="mr-2" /> Quizzes
                </TabsTrigger>
                <TabsTrigger value="attendance">
                  <CalendarDays className="mr-2" /> Attendance
                </TabsTrigger>
              </TabsList>
              <TabsContent value="homework" className="mt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Subject</TableHead>
                      <TableHead>Task</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Mark</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {foundStudent.homework.map((hw, i) => (
                      <TableRow key={i}>
                        <TableCell>{hw.subject}</TableCell>
                        <TableCell>{hw.task}</TableCell>
                        <TableCell>{hw.dueDate}</TableCell>
                        <TableCell>
                          <Badge
                            variant={hw.completed ? "secondary" : "destructive"}
                          >
                            {hw.completed ? "Completed" : "Pending"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                            <Input
                                value={hw.mark ?? ''}
                                onChange={(e) => handleHomeworkMarkChange(i, e.target.value)}
                                placeholder="Add mark"
                                className="w-28"
                            />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>
              <TabsContent value="quizzes" className="mt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Subject</TableHead>
                      <TableHead>Topic</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Mark</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {foundStudent.quizzes.map((quiz, i) => (
                      <TableRow key={i}>
                        <TableCell>{quiz.subject}</TableCell>
                        <TableCell>{quiz.topic}</TableCell>
                        <TableCell>{quiz.date}</TableCell>
                        <TableCell>
                          {quiz.score !== null ? `${quiz.score}%` : "N/A"}
                        </TableCell>
                        <TableCell>
                            <Input
                                value={quiz.mark ?? ''}
                                onChange={(e) => handleQuizMarkChange(i, e.target.value)}
                                placeholder="Add mark"
                                className="w-28"
                            />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>
              <TabsContent value="attendance" className="mt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {foundStudent.attendance.map((att, i) => (
                      <TableRow key={i}>
                        <TableCell>{att.date}</TableCell>
                        <TableCell>
                           <RadioGroup
                             value={att.status}
                             onValueChange={(value: 'Late' | 'On Time') => handleAttendanceChange(i, value)}
                             className="flex space-x-4"
                           >
                             <div className="flex items-center space-x-2">
                               <RadioGroupItem value="On Time" id={`on-time-${i}`} />
                               <Label htmlFor={`on-time-${i}`}>On Time</Label>
                             </div>
                             <div className="flex items-center space-x-2">
                               <RadioGroupItem value="Late" id={`late-${i}`} />
                               <Label htmlFor={`late-${i}`}>Late</Label>
                             </div>
                           </RadioGroup>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {foundStudent && (
        <Card>
          <CardHeader>
            <CardTitle>Compose Message</CardTitle>
            <CardDescription>
              Write your message to {foundStudent.name}'s parent.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Type your message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              className="text-base"
            />
          </CardContent>
          <CardFooter className="flex flex-wrap justify-end gap-4">
            <Button
              variant="outline"
              onClick={handleCheckTone}
              disabled={isCheckingTone}
            >
              {isCheckingTone ? (
                <LoaderCircle className="animate-spin" />
              ) : (
                <Sparkles />
              )}
              <span className="ml-2">Check Tone</span>
            </Button>
            <Button onClick={handleSendWhatsApp}>
              <Send />
              <span className="ml-2">Send via WhatsApp</span>
            </Button>
          </CardFooter>
        </Card>
      )}

      {isCheckingTone && (
         <Card className="flex items-center justify-center p-8">
            <LoaderCircle className="mr-4 h-8 w-8 animate-spin text-primary" />
            <p className="text-lg text-muted-foreground">Analyzing tone...</p>
        </Card>
      )}

      {toneAnalysis && (
        <Card className="bg-secondary/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles /> AI Tone Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 rounded-lg border bg-card p-4">
              {getToneIcon(toneAnalysis.tone)}
              <div>
                <h4 className="font-semibold">Tone</h4>
                <p className="text-muted-foreground">{toneAnalysis.tone}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border bg-card p-4">
               {toneAnalysis.appropriateness.toLowerCase().includes("appropriate") ? <CheckCircle className="text-green-600"/> : <XCircle className="text-red-600"/>}
              <div>
                <h4 className="font-semibold">Appropriateness</h4>
                <p className="text-muted-foreground">{toneAnalysis.appropriateness}</p>
              </div>
            </div>
             <div className="rounded-lg border bg-card p-4">
                <h4 className="font-semibold mb-2">Suggestions</h4>
                <p className="text-muted-foreground whitespace-pre-wrap">{toneAnalysis.suggestions}</p>
              </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
