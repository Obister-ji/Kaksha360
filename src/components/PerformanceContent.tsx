
import { SidebarTrigger, SidebarInset } from "@/components/ui/sidebar";
import { UserCircle2, Home } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { LineChart, ResponsiveContainer } from 'recharts';
import { YAxis, XAxis, Line, CartesianGrid, Tooltip, Legend } from './ui/recharts-wrappers';

const performanceData = [
  { name: 'Test 1', score: 78, average: 65 },
  { name: 'Test 2', score: 82, average: 68 },
  { name: 'Test 3', score: 75, average: 70 },
  { name: 'Test 4', score: 85, average: 72 },
  { name: 'Test 5', score: 90, average: 74 },
];

const PerformanceContent = () => {
  return (
    <SidebarInset className="bg-light">
      <header className="sticky top-0 z-90 bg-white shadow-sm py-5 px-8 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <SidebarTrigger className="text-primary" />
          <h1 className="text-2xl font-playfair text-primary">Performance</h1>
        </div>
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="sm" className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Link>
          </Button>
          <div className="flex items-center gap-2 bg-gold/10 px-4 py-2 rounded-full">
            <UserCircle2 className="text-gold h-5 w-5" />
            <span className="text-primary font-semibold text-sm">SG - Sarvagya Gupta</span>
          </div>
        </div>
      </header>

      <main className="px-8 py-6">
        <div className="space-y-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-medium text-primary mb-4">Performance Trends</h2>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="score" stroke="#8884d8" activeDot={{ r: 8 }} name="Your Score" />
                  <Line type="monotone" dataKey="average" stroke="#82ca9d" name="Class Average" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-medium text-primary mb-2">Overall Average</h3>
              <p className="text-3xl font-bold text-gold">82%</p>
              <p className="text-green-500 text-sm mt-1">+5% from previous month</p>
            </div>

            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-medium text-primary mb-2">Tests Completed</h3>
              <p className="text-3xl font-bold text-gold">12/15</p>
              <p className="text-amber-500 text-sm mt-1">3 remaining this month</p>
            </div>

            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-medium text-primary mb-2">Subject Ranking</h3>
              <p className="text-3xl font-bold text-gold">#4</p>
              <p className="text-green-500 text-sm mt-1">Up 2 positions</p>
            </div>
          </div>
        </div>
      </main>
    </SidebarInset>
  );
};

export default PerformanceContent;
