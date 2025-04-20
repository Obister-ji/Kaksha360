import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, ArrowLeft, Trophy, Clock, Medal, Users, School } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fetchTests } from "@/services/testService";
import { TestSchedule } from "@/types/test";
import { 
  getTestLeaderboard, 
  getBatchLeaderboard, 
  getInstituteLeaderboard,
  getBatches,
  getInstitutes,
  getUserBatch,
  getUserInstitute,
  getRanking
} from "@/services/rankingService";
import { LeaderboardEntry, Batch, Institute } from "@/types/ranking";
import { supabase } from "@/integrations/supabase/client";
import { formatTimeObject, secondsToTimeObject } from "@/lib/utils";
import RankSummary from "@/components/RankSummary";

const Leaderboard = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [test, setTest] = useState<TestSchedule | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [batchLeaderboard, setBatchLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [instituteLeaderboard, setInstituteLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [institutes, setInstitutes] = useState<Institute[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<string | null>(null);
  const [selectedInstitute, setSelectedInstitute] = useState<string | null>(null);
  const [userRanking, setUserRanking] = useState<{
    batchRank: number;
    batchTotal: number;
    instituteRank: number;
    instituteTotal: number;
    percentile: number;
  } | null>(null);
  const [userBatch, setUserBatch] = useState<Batch | null>(null);
  const [userInstitute, setUserInstitute] = useState<Institute | null>(null);
  
  useEffect(() => {
    const loadData = async () => {
      if (!id) {
        setError("Test ID is missing");
        setIsLoading(false);
        return;
      }

      try {
        // Get current user
        const { data: userData } = await supabase.auth.getUser();
        if (!userData?.user?.id) {
          setError("You must be logged in to view the leaderboard");
          setIsLoading(false);
          return;
        }

        // Load test data
        const allTests = await fetchTests();
        const foundTest = allTests.find(test => test.id === id);
        
        if (foundTest) {
          setTest(foundTest);
        } else {
          setError("Test not found");
          setIsLoading(false);
          return;
        }

        // Load batches and institutes
        const allBatches = await getBatches();
        setBatches(allBatches);
        
        const allInstitutes = await getInstitutes();
        setInstitutes(allInstitutes);

        // Get user's batch and institute
        const userBatchData = await getUserBatch(userData.user.id);
        setUserBatch(userBatchData);
        if (userBatchData) {
          setSelectedBatch(userBatchData.id);
        }
        
        const userInstituteData = await getUserInstitute(userData.user.id);
        setUserInstitute(userInstituteData);
        if (userInstituteData) {
          setSelectedInstitute(userInstituteData.id);
        }

        // Load global leaderboard
        const globalLeaderboard = await getTestLeaderboard(id, 50);
        setLeaderboard(globalLeaderboard);

        // Load batch leaderboard if user has a batch
        if (userBatchData) {
          const batchLeaderboardData = await getBatchLeaderboard(id, userBatchData.id, 50);
          setBatchLeaderboard(batchLeaderboardData);
        }

        // Load institute leaderboard if user has an institute
        if (userInstituteData) {
          const instituteLeaderboardData = await getInstituteLeaderboard(id, userInstituteData.id, 50);
          setInstituteLeaderboard(instituteLeaderboardData);
        }

        // Get user's ranking
        const rankingData = await getRanking(userData.user.id, id);
        if (rankingData) {
          setUserRanking({
            batchRank: rankingData.batchRank,
            batchTotal: rankingData.batchTotal,
            instituteRank: rankingData.instituteRank,
            instituteTotal: rankingData.instituteTotal,
            percentile: rankingData.percentile
          });
        }

      } catch (error: any) {
        console.error("Error loading leaderboard:", error);
        setError("Failed to load leaderboard data");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id]);

  const handleBatchChange = async (batchId: string) => {
    if (!id) return;
    
    setSelectedBatch(batchId);
    try {
      const batchLeaderboardData = await getBatchLeaderboard(id, batchId, 50);
      setBatchLeaderboard(batchLeaderboardData);
    } catch (error) {
      console.error("Error loading batch leaderboard:", error);
    }
  };

  const handleInstituteChange = async (instituteId: string) => {
    if (!id) return;
    
    setSelectedInstitute(instituteId);
    try {
      const instituteLeaderboardData = await getInstituteLeaderboard(id, instituteId, 50);
      setInstituteLeaderboard(instituteLeaderboardData);
    } catch (error) {
      console.error("Error loading institute leaderboard:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  if (error || !test) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
        <Alert variant="destructive" className="mb-6 max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error || "Test not found"}</AlertDescription>
        </Alert>
        <Button
          onClick={() => navigate("/tests")}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Tests
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen pb-12">
      {/* Header */}
      <header className="bg-white shadow-sm py-4 px-6 mb-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/tests")}
              className="flex items-center gap-1"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <h1 className="text-xl font-bold text-gray-800">{test.title} - Leaderboard</h1>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4">
        {/* User's Ranking */}
        {userRanking && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Your Ranking</h2>
            <RankSummary
              batchRank={userRanking.batchRank}
              batchTotal={userRanking.batchTotal}
              instituteRank={userRanking.instituteRank}
              instituteTotal={userRanking.instituteTotal}
              percentile={userRanking.percentile}
            />
          </div>
        )}

        {/* Leaderboard Tabs */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <Tabs defaultValue="global">
            <TabsList className="mb-6">
              <TabsTrigger value="global" className="flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                Global
              </TabsTrigger>
              <TabsTrigger value="batch" className="flex items-center gap-2" disabled={!userBatch}>
                <Users className="h-4 w-4" />
                Batch
              </TabsTrigger>
              <TabsTrigger value="institute" className="flex items-center gap-2" disabled={!userInstitute}>
                <School className="h-4 w-4" />
                Institute
              </TabsTrigger>
            </TabsList>

            {/* Global Leaderboard */}
            <TabsContent value="global">
              <h2 className="text-lg font-semibold mb-4">Global Rankings</h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Student</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Score</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Time Taken</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {leaderboard.length > 0 ? (
                      leaderboard.map((entry, index) => (
                        <tr key={index} className={index < 3 ? "bg-amber-50" : ""}>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center">
                              {index < 3 ? (
                                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                                  index === 0 ? "bg-yellow-100 text-yellow-600" :
                                  index === 1 ? "bg-gray-100 text-gray-600" :
                                  "bg-amber-100 text-amber-600"
                                }`}>
                                  <Medal className="h-4 w-4" />
                                </div>
                              ) : (
                                <div className="text-gray-900 font-medium">{entry.rank}</div>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{entry.displayName}</div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm text-gray-900 font-medium">{entry.score}</div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              {formatTimeObject(secondsToTimeObject(entry.timeTakenSeconds))}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                          No results available yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </TabsContent>

            {/* Batch Leaderboard */}
            <TabsContent value="batch">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Batch Rankings</h2>
                <Select value={selectedBatch || ""} onValueChange={handleBatchChange}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select batch" />
                  </SelectTrigger>
                  <SelectContent>
                    {batches.map((batch) => (
                      <SelectItem key={batch.id} value={batch.id}>
                        {batch.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Student</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Score</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Time Taken</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {batchLeaderboard.length > 0 ? (
                      batchLeaderboard.map((entry, index) => (
                        <tr key={index} className={index < 3 ? "bg-blue-50" : ""}>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center">
                              {index < 3 ? (
                                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                                  index === 0 ? "bg-blue-100 text-blue-600" :
                                  index === 1 ? "bg-blue-50 text-blue-500" :
                                  "bg-blue-50 text-blue-400"
                                }`}>
                                  <Medal className="h-4 w-4" />
                                </div>
                              ) : (
                                <div className="text-gray-900 font-medium">{entry.rank}</div>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{entry.displayName}</div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm text-gray-900 font-medium">{entry.score}</div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              {formatTimeObject(secondsToTimeObject(entry.timeTakenSeconds))}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                          No results available for this batch
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </TabsContent>

            {/* Institute Leaderboard */}
            <TabsContent value="institute">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Institute Rankings</h2>
                <Select value={selectedInstitute || ""} onValueChange={handleInstituteChange}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select institute" />
                  </SelectTrigger>
                  <SelectContent>
                    {institutes.map((institute) => (
                      <SelectItem key={institute.id} value={institute.id}>
                        {institute.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Student</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Score</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Time Taken</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {instituteLeaderboard.length > 0 ? (
                      instituteLeaderboard.map((entry, index) => (
                        <tr key={index} className={index < 3 ? "bg-purple-50" : ""}>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center">
                              {index < 3 ? (
                                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                                  index === 0 ? "bg-purple-100 text-purple-600" :
                                  index === 1 ? "bg-purple-50 text-purple-500" :
                                  "bg-purple-50 text-purple-400"
                                }`}>
                                  <Medal className="h-4 w-4" />
                                </div>
                              ) : (
                                <div className="text-gray-900 font-medium">{entry.rank}</div>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{entry.displayName}</div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm text-gray-900 font-medium">{entry.score}</div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm text-gray-500">
                              {formatTimeObject(secondsToTimeObject(entry.timeTakenSeconds))}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                          No results available for this institute
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
