import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { AlertCircle, Check } from "lucide-react";
import { slugify } from "../utils/helpers";

// Define the subject interface
export interface Subject {
  id: string;
  name: string;
  code?: string;
  category?: string;
  slug: string;
}

interface AddSubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (subject: Subject) => void;
  existingSubjects: Subject[];
}

const AddSubjectModal: React.FC<AddSubjectModalProps> = ({
  isOpen,
  onClose,
  onSave,
  existingSubjects,
}) => {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [category, setCategory] = useState("");
  const [customCategory, setCustomCategory] = useState("");

  const [slug, setSlug] = useState("");
  const [nameExists, setNameExists] = useState(false);
  const [codeExists, setCodeExists] = useState(false);

  // Generate slug when name changes
  useEffect(() => {
    if (name) {
      setSlug(slugify(name));
    } else {
      setSlug("");
    }
  }, [name]);

  // Check for duplicate name
  useEffect(() => {
    if (name && existingSubjects) {
      const exists = existingSubjects.some(
        (subject) => subject.name.toLowerCase() === name.toLowerCase()
      );
      setNameExists(exists);
    } else {
      setNameExists(false);
    }
  }, [name, existingSubjects]);

  // Check for duplicate code
  useEffect(() => {
    if (code && existingSubjects) {
      const exists = existingSubjects.some(
        (subject) => subject.code && subject.code.toLowerCase() === code.toLowerCase()
      );
      setCodeExists(exists);
    } else {
      setCodeExists(false);
    }
  }, [code, existingSubjects]);

  const handleSave = () => {
    if (!name || nameExists) return;

    const newSubject: Subject = {
      id: crypto.randomUUID(),
      name,
      slug,
      ...(code && { code }),
      ...(category === "custom"
        ? { category: customCategory }
        : category && { category }),
    };

    onSave(newSubject);
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setName("");
    setCode("");
    setCategory("");
    setCustomCategory("");

    setSlug("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Add New Subject</DialogTitle>
          <p className="text-sm text-gray-500">
            Expand your test library by adding a new subject.
          </p>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="subject-name" className="font-medium">
              Subject Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="subject-name"
              placeholder="E.g., 'Advanced Data Structures', 'Financial Accounting'"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={nameExists ? "border-red-500" : ""}
            />
            {nameExists && (
              <div className="flex items-center text-red-500 text-sm mt-1">
                <AlertCircle className="h-4 w-4 mr-1" />
                This subject name already exists
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject-code" className="font-medium">
              Subject Code (Optional)
            </Label>
            <Input
              id="subject-code"
              placeholder="E.g., 'ADS101', 'FA202'"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className={codeExists ? "border-red-500" : ""}
            />
            {codeExists && (
              <div className="flex items-center text-red-500 text-sm mt-1">
                <AlertCircle className="h-4 w-4 mr-1" />
                This subject code already exists
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category" className="font-medium">
              Category (Optional)
            </Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="science">Science</SelectItem>
                <SelectItem value="commerce">Commerce</SelectItem>
                <SelectItem value="humanities">Humanities</SelectItem>
                <SelectItem value="custom">Custom...</SelectItem>
              </SelectContent>
            </Select>
            {category === "custom" && (
              <Input
                placeholder="Enter custom category"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                className="mt-2"
              />
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug" className="font-medium">
              URL Slug (Auto-generated)
            </Label>
            <div className="flex items-center">
              <Input
                id="slug"
                value={slug}
                readOnly
                className="bg-gray-50"
              />
              {slug && (
                <div className="ml-2 text-green-500">
                  <Check className="h-5 w-5" />
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <div className="flex justify-between w-full">
            <div className="text-sm text-gray-500">
              <span className="text-red-500">*</span> Required fields
            </div>
            <div className="space-x-2">
              <Button variant="outline" onClick={handleClose}>
                ✖ Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={!name || nameExists}
                className="bg-blue-600 hover:bg-blue-700"
              >
                🗂️ Save Subject
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddSubjectModal;
