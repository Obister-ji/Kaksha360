import React, { useState } from "react";
import { Button } from "./ui/button";
import { Building, Users, BarChart3 } from "lucide-react";

interface RankSummaryProps {
  batchRank: number;
  batchTotal: number;
  instituteRank: number;
  instituteTotal: number;
  percentile: number;
}

const RankSummary: React.FC<RankSummaryProps> = ({
  batchRank,
  batchTotal,
  instituteRank,
  instituteTotal,
  percentile,
}) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6 my-4">
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-gray-600 font-semibold text-lg">YOUR RANK</h2>
        <h2 className="text-gray-600 font-semibold text-lg">LEADERBOARD</h2>
        <Button
          variant="link"
          className="text-blue-500 p-0 h-auto font-medium"
          onClick={() => setShowDetails(!showDetails)}
        >
          View More
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-8">
        {/* Left column - Rank details */}
        <div className="space-y-6">
          {/* Batch Rank */}
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
              <Users className="h-8 w-8 text-green-500" />
            </div>
            <div>
              <div className="text-gray-500 uppercase text-sm font-medium">BATCH RANK</div>
              <div className="flex items-baseline">
                <span className="text-3xl font-bold">{batchRank}</span>
                <span className="text-gray-500 ml-1">/ {batchTotal}</span>
              </div>
            </div>
          </div>

          {/* Institute Rank */}
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
              <Building className="h-8 w-8 text-blue-500" />
            </div>
            <div>
              <div className="text-gray-500 uppercase text-sm font-medium">INSTITUTE RANK</div>
              <div className="flex items-baseline">
                <span className="text-3xl font-bold">{instituteRank}</span>
                <span className="text-gray-500 ml-1">/ {instituteTotal}</span>
              </div>
            </div>
          </div>

          {/* Percentile */}
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-yellow-100 flex items-center justify-center">
              <BarChart3 className="h-8 w-8 text-yellow-500" />
            </div>
            <div>
              <div className="text-gray-500 uppercase text-sm font-medium">PERCENTILE</div>
              <div className="flex items-baseline">
                <span className="text-3xl font-bold">{percentile.toFixed(2)}</span>
                <span className="text-gray-500 ml-1">/ 100</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right column - Trophy image and note */}
        <div className="flex flex-col items-center justify-center">
          <div className="bg-blue-50 rounded-full p-8 mb-4">
            <svg
              width="80"
              height="80"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-blue-400"
            >
              <path
                d="M12 17C15.866 17 19 13.866 19 10V5H5V10C5 13.866 8.13401 17 12 17Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M8 21H16"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12 17V21"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M19 5H20C20.5304 5 21.0391 5.21071 21.4142 5.58579C21.7893 5.96086 22 6.46957 22 7V8C22 8.79565 21.6839 9.55871 21.1213 10.1213C20.5587 10.6839 19.7956 11 19 11"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M5 5H4C3.46957 5 2.96086 5.21071 2.58579 5.58579C2.21071 5.96086 2 6.46957 2 7V8C2 8.79565 2.31607 9.55871 2.87868 10.1213C3.44129 10.6839 4.20435 11 5 11"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <p className="text-center text-gray-600 text-sm">
            Leaderboard will be updated as more students take the test
          </p>
        </div>
      </div>

      {/* Expanded Details */}
      {showDetails && (
        <div className="mt-6 pt-6 border-t">
          <h3 className="text-gray-600 font-semibold mb-4">Top Performers</h3>
          <div className="space-y-3">
            {[
              { name: "Rahul Sharma", score: 78, rank: 1 },
              { name: "Priya Patel", score: 76, rank: 2 },
              { name: "Amit Kumar", score: 72, rank: 3 },
              { name: "Sneha Gupta", score: 70, rank: 4 },
              { name: "Vikram Singh", score: 68, rank: 5 },
            ].map((student, index) => (
              <div key={index} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="h-6 w-6 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-sm">
                    {student.rank}
                  </div>
                  <span>{student.name}</span>
                </div>
                <span className="font-medium">{student.score} points</span>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <h3 className="text-gray-600 font-semibold mb-4">Your Performance Trend</h3>
            <div className="h-40 bg-gray-100 rounded-lg flex items-center justify-center">
              <span className="text-gray-500">Performance chart will be available after multiple tests</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RankSummary;
