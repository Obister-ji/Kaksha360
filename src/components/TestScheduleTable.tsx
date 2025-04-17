
import { TestSchedule, UserRole } from "@/types/test";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, FileQuestion } from "lucide-react";

interface TestScheduleTableProps {
  tests: TestSchedule[];
  onEdit: (test: TestSchedule) => void;
  onDelete: (id: string) => void;
  userRole: UserRole;
  onAddQuestions?: (test: TestSchedule) => void;
}

const TestScheduleTable = ({
  tests,
  onEdit,
  onDelete,
  userRole,
  onAddQuestions
}: TestScheduleTableProps) => {
  // Set isAdmin to true if userRole is ADMIN
  const isAdmin = userRole === "ADMIN";

  // Log for debugging
  console.log("TestScheduleTable props:", { userRole, isAdmin });

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Title</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Instructor</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Date</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Time</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Duration</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Status</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Participants</th>
            <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Actions</th>
          </tr>
        </thead>
        <tbody>
          {tests.length === 0 ? (
            <tr>
              <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                No tests found. Create a new test to get started.
              </td>
            </tr>
          ) : (
            tests.map((test) => (
              <tr key={test.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-4 font-medium">{test.title}</td>
                <td className="px-4 py-4">{test.instructor}</td>
                <td className="px-4 py-4">{test.date}</td>
                <td className="px-4 py-4">{test.time}</td>
                <td className="px-4 py-4">{test.duration}</td>
                <td className="px-4 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    test.status === "ONLINE"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}>
                    {test.status}
                  </span>
                </td>
                <td className="px-4 py-4">
                  {test.participants && test.participants.map((participant, index) => (
                    <span key={index} className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-1 mb-1">
                      {participant}
                    </span>
                  ))}
                </td>
                <td className="px-4 py-4 text-right flex justify-end gap-2 flex-wrap">
                  {/* Always show the Questions button if onAddQuestions is provided */}
                  {onAddQuestions && (
                    <Button
                      onClick={() => onAddQuestions(test)}
                      variant="outline"
                      size="sm"
                      className="text-primary border-primary hover:bg-primary hover:text-white"
                    >
                      <FileQuestion className="h-4 w-4 mr-1" />
                      Questions
                    </Button>
                  )}
                  {/* Always show Edit and Delete buttons */}
                  <Button
                    onClick={() => onEdit(test)}
                    variant="outline"
                    size="sm"
                    className="text-blue-500 border-blue-500 hover:bg-blue-500 hover:text-white"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    onClick={() => onDelete(test.id)}
                    variant="outline"
                    size="sm"
                    className="text-red-500 border-red-500 hover:bg-red-500 hover:text-white"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TestScheduleTable;
