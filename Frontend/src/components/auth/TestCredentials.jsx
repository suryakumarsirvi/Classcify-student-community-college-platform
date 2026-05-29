import React, { useState } from "react";
import { ClipboardCopy, Shield, GraduationCap, User, KeyRound, Mail, CheckCircle2, FlaskConical } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const credentials = {
  admin: {
    role: "Admin",
    email: "admin@classcify.edu.in",
    password: "123456",
    icon: Shield,
  },
  teacher: {
    role: "Teacher",
    email: "6102236@classcify.in",
    password: "123456",
    icon: User,
  },
  student: {
    role: "Student",
    email: "suryakumarsirvi@gmail.com",
    password: "12345678",
    icon: GraduationCap,
  },
};

export default function TestCredentials() {
  const [open, setOpen] = useState(false);
  const [copiedField, setCopiedField] = useState(null);

  const handleCopy = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success(`${field} copied successfully`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleCopyAll = (email, pass) => {
    navigator.clipboard.writeText(`Email: ${email}\nPassword: ${pass}`);
    toast.success("All credentials copied successfully");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          className="gap-2 shadow-sm rounded-full transition-all hover:shadow-md hover:bg-slate-50 dark:hover:bg-slate-800"
        >
          <FlaskConical className="h-4 w-4" />
          Test Credentials
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[90vw] sm:w-[400px] p-0 rounded-2xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800" 
        align="center" 
        sideOffset={10}
      >
        <div className="bg-slate-50 dark:bg-slate-900 p-4 border-b border-slate-200 dark:border-slate-800">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <FlaskConical className="h-5 w-5 text-indigo-500" />
            Test Credentials
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Quickly explore the platform using these test accounts.
          </p>
        </div>
        
        <Tabs defaultValue="student" className="w-full">
          <TabsList className="w-full grid grid-cols-3 rounded-none bg-transparent h-12 p-1 border-b border-slate-100 dark:border-slate-800">
            {Object.entries(credentials).map(([key, { role, icon: Icon }]) => (
              <TabsTrigger 
                key={key} 
                value={key}
                className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm rounded-lg flex items-center gap-2 transition-all"
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{role}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="p-4">
            {Object.entries(credentials).map(([key, cred]) => (
              <TabsContent key={key} value={key} className="mt-0 outline-none">
                <Card className="border-none shadow-none">
                  <CardContent className="p-0 space-y-4">
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="font-normal flex items-center gap-1.5">
                        <cred.icon className="h-3.5 w-3.5" />
                        {cred.role} Access
                      </Badge>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleCopyAll(cred.email, cred.password)}
                        className="h-8 text-xs text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950/50"
                      >
                        Copy All
                      </Button>
                    </div>

                    <Separator className="bg-slate-100 dark:bg-slate-800" />

                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                          <Mail className="h-3.5 w-3.5" /> Email
                        </label>
                        <div className="flex gap-2">
                          <Input 
                            readOnly 
                            value={cred.email} 
                            className="h-9 bg-slate-50 dark:bg-slate-900 focus-visible:ring-0 focus-visible:ring-offset-0 cursor-text selection:bg-indigo-100 dark:selection:bg-indigo-900/50 text-sm"
                          />
                          <Button 
                            variant="secondary" 
                            size="icon" 
                            className="h-9 w-9 shrink-0"
                            onClick={() => handleCopy(cred.email, 'Email')}
                            title="Copy Email"
                          >
                            {copiedField === 'Email' ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <ClipboardCopy className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                          <KeyRound className="h-3.5 w-3.5" /> Password
                        </label>
                        <div className="flex gap-2">
                          <Input 
                            readOnly 
                            value={cred.password} 
                            type="text"
                            className="h-9 bg-slate-50 dark:bg-slate-900 focus-visible:ring-0 focus-visible:ring-offset-0 cursor-text selection:bg-indigo-100 dark:selection:bg-indigo-900/50 font-mono text-sm"
                          />
                          <Button 
                            variant="secondary" 
                            size="icon" 
                            className="h-9 w-9 shrink-0"
                            onClick={() => handleCopy(cred.password, 'Password')}
                            title="Copy Password"
                          >
                            {copiedField === 'Password' ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <ClipboardCopy className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </div>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
}
