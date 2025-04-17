import { useState } from "react";
import { SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { UserCircle2, Plus, Search, ShieldAlert, Calendar, MessageCircle, Send, Check, HelpCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "./ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { UserRole, Doubt } from "@/types/test";

const initialDoubts: Doubt[] = [
  {
    id: "1",
    question: "How do I solve problems on projectile motion with air resistance?",
    askedBy: "Student123",
    date: "2025/01/15",
    subject: "Physics",
    status: "answered",
    answers: [
      {
        id: "1a",
        text: "Solving projectile motion with air resistance requires considering drag force proportional to velocity (or velocity squared). You need to set up differential equations and typically solve them numerically. For JEE, focus on conceptual understanding rather than complex calculations.",
        answeredBy: "LAKSHYA Instructor",
        date: "2025/01/16"
      }
    ]
  },
  {
    id: "2",
    question: "What's the difference between s, p, d, and f orbitals in atoms?",
    askedBy: "ChemWhiz",
    date: "2025/01/10",
    subject: "Chemistry",
    status: "answered",
    answers: [
      {
        id: "2a",
        text: "These letters refer to the shape of the orbitals. s-orbitals are spherical, p-orbitals are dumbbell-shaped, d-orbitals have complex four-lobed shapes, and f-orbitals are even more complex. They correspond to different angular momentum quantum numbers: s=0, p=1, d=2, f=3.",
        answeredBy: "LAKSHYA Instructor",
        date: "2025/01/11"
      }
    ]
  },
  {
    id: "3",
    question: "I'm having trouble understanding integration by parts. Can someone explain when to use it?",
    askedBy: "MathStudent",
    date: "2025/01/05",
    subject: "Mathematics",
    status: "pending"
  }
];

interface DoubtsContentProps {
  userRole: UserRole;
}

const DoubtsContent = ({ userRole }: DoubtsContentProps) => {
  const [doubts, setDoubts] = useState<Doubt[]>(initialDoubts);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAnswerDialogOpen, setIsAnswerDialogOpen] = useState(false);
  const [currentDoubt, setCurrentDoubt] = useState<Doubt | null>(null);
  
  const isAdmin = userRole === "ADMIN";
  const doubtForm = useForm<{
    question: string;
    subject: string;
  }>({
    defaultValues: {
      question: "",
      subject: "Physics"
    }
  });

  const answerForm = useForm<{
    answer: string;
  }>({
    defaultValues: {
      answer: ""
    }
  });

  const handleAddDoubt = () => {
    doubtForm.reset({
      question: "",
      subject: "Physics"
    });
    setIsDialogOpen(true);
  };

  const handleSaveDoubt = (values: { question: string; subject: string }) => {
    const newDoubt: Doubt = {
      id: (doubts.length + 1).toString(),
      question: values.question,
      askedBy: "CurrentUser",
      date: new Date().toISOString().split('T')[0].replace(/-/g, '/'),
      subject: values.subject,
      status: "pending"
    };
    
    setDoubts([newDoubt, ...doubts]);
    toast.success("Your doubt has been submitted");
    setIsDialogOpen(false);
  };

  const handleAnswerDoubt = (doubt: Doubt) => {
    if (!isAdmin) {
      toast.error("Only instructors can answer doubts");
      return;
    }
    
    setCurrentDoubt(doubt);
    answerForm.reset({
      answer: ""
    });
    setIsAnswerDialogOpen(true);
  };

  const handleSubmitAnswer = (values: { answer: string }) => {
    if (!currentDoubt) return;
    
    const answer = {
      id: `${currentDoubt.id}a${(currentDoubt.answers?.length || 0) + 1}`,
      text: values.answer,
      answeredBy: "LAKSHYA Instructor",
      date: new Date().toISOString().split('T')[0].replace(/-/g, '/')
    };
    
    setDoubts(doubts.map(d => {
      if (d.id === currentDoubt.id) {
        return {
          ...d,
          status: "answered",
          answers: [...(d.answers || []), answer]
        };
      }
      return d;
    }));
    
    toast.success("Answer submitted successfully");
    setIsAnswerDialogOpen(false);
  };

  const filteredDoubts = doubts.filter(d => 
    d.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.askedBy.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SidebarInset className="bg-light">
      <header className="sticky top-0 z-90 bg-white shadow-sm py-5 px-8 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <SidebarTrigger className="text-primary" />
          <h1 className="text-2xl font-playfair text-primary">Doubts & Questions</h1>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <div className="flex items-center gap-2 bg-amber-100 text-amber-600 px-3 py-1 rounded-full mr-3">
              <ShieldAlert className="h-4 w-4" />
              <span className="text-xs font-semibold">Instructor Mode</span>
            </div>
          )}
          <div className="flex items-center gap-2 bg-gold/10 px-4 py-2 rounded-full">
            <UserCircle2 className="text-gold h-5 w-5" />
            <span className="text-primary font-semibold text-sm">SG - Sarvagya Gupta</span>
          </div>
        </div>
      </header>
      
      <main className="px-8 py-6">
        <div className="flex justify-between items-center mb-6">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search doubts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button onClick={handleAddDoubt} className="bg-gold hover:bg-gold/90 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Ask a Question
          </Button>
        </div>
        
        <div className="space-y-6">
          {filteredDoubts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No doubts found. Ask a question to get started.
            </div>
          ) : (
            filteredDoubts.map((doubt) => (
              <div key={doubt.id} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start">
                      <div className={`p-2 rounded-full mr-4 ${doubt.status === "answered" ? "bg-green-100" : "bg-yellow-100"}`}>
                        {doubt.status === "answered" ? (
                          <Check className="h-6 w-6 text-green-500" />
                        ) : (
                          <HelpCircle className="h-6 w-6 text-yellow-500" />
                        )}
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold mb-2">{doubt.question}</h2>
                        <div className="flex items-center text-sm text-gray-500 mb-4">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span>Asked on {doubt.date}</span>
                          <span className="mx-2">•</span>
                          <span>by {doubt.askedBy}</span>
                          <span className="mx-2">•</span>
                          <span>Subject: {doubt.subject}</span>
                          <span className="mx-2">•</span>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            doubt.status === "answered" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                          }`}>
                            {doubt.status === "answered" ? "Answered" : "Pending"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {doubt.answers && doubt.answers.length > 0 && (
                    <div className="mt-4 pl-12">
                      <h3 className="text-md font-semibold mb-2">Answers:</h3>
                      {doubt.answers.map((answer) => (
                        <div key={answer.id} className="bg-blue-50 p-4 rounded-lg mb-3">
                          <p className="text-gray-800 mb-2">{answer.text}</p>
                          <div className="flex items-center text-xs text-gray-500">
                            <span>Answered by {answer.answeredBy}</span>
                            <span className="mx-2">•</span>
                            <span>{answer.date}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {isAdmin && doubt.status === "pending" && (
                    <div className="mt-4 flex justify-end">
                      <Button 
                        onClick={() => handleAnswerDoubt(doubt)} 
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Answer This Question
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Ask a Question</DialogTitle>
            </DialogHeader>
            <Form {...doubtForm}>
              <form onSubmit={doubtForm.handleSubmit(handleSaveDoubt)} className="space-y-4">
                <FormField
                  control={doubtForm.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a subject" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Physics">Physics</SelectItem>
                          <SelectItem value="Chemistry">Chemistry</SelectItem>
                          <SelectItem value="Mathematics">Mathematics</SelectItem>
                          <SelectItem value="Biology">Biology</SelectItem>
                          <SelectItem value="General">General</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={doubtForm.control}
                  name="question"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Question</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Type your question here..." 
                          className="min-h-[120px]" 
                          {...field} 
                          required 
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-primary">
                    <Send className="h-4 w-4 mr-2" />
                    Submit Question
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
        
        <Dialog open={isAnswerDialogOpen} onOpenChange={setIsAnswerDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Answer Question</DialogTitle>
            </DialogHeader>
            <div className="mb-6 bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium mb-1">Question:</h3>
              <p>{currentDoubt?.question}</p>
              <div className="text-sm text-gray-500 mt-2">
                <span>Subject: {currentDoubt?.subject}</span>
                <span className="mx-2">•</span>
                <span>Asked by: {currentDoubt?.askedBy}</span>
              </div>
            </div>
            <Form {...answerForm}>
              <form onSubmit={answerForm.handleSubmit(handleSubmitAnswer)} className="space-y-4">
                <FormField
                  control={answerForm.control}
                  name="answer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Answer</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Type your answer here..." 
                          className="min-h-[150px]" 
                          {...field} 
                          required 
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAnswerDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white">
                    <Send className="h-4 w-4 mr-2" />
                    Submit Answer
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </main>
    </SidebarInset>
  );
};

export default DoubtsContent;
