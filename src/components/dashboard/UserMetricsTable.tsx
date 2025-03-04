
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format, subDays } from 'date-fns';
import { fromZonedTime, toZonedTime } from 'date-fns-tz';
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";

interface UserMetric {
  id: number;
  email: string;
  full_name: string;
  totalProspects: number;
  newProspects: number;
  emailsSent: number;
  faceToFace: number;
  meetingsSet: number;
  bulkSearches: number;
  savedSearches: number;
  completedProspects: number;
}

interface UserMetricsTableProps {
  userRole: string | null;
  userId: number | null;
}

const timeZone = 'America/New_York';

const UserMetricsTable = ({ userRole, userId }: UserMetricsTableProps) => {
  const [userMetrics, setUserMetrics] = useState<UserMetric[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserMetrics = async () => {
      if (!userId || !['admin', 'supervisor'].includes(userRole || '')) return;

      try {
        console.log('Fetching user metrics for:', userId, 'role:', userRole);
        
        let query = supabase.from('users').select('*');
        if (userRole === 'supervisor') {
          query = query.eq('supervisor_id', userId);
        }
        
        const { data: users, error: usersError } = await query;
        
        if (usersError) throw usersError;
        
        const nowInEST = toZonedTime(new Date(), timeZone);
        const sevenDaysAgo = subDays(nowInEST, 7);
        
        const userIds = users.map(user => user.id);
        const { data: prospects, error: prospectsError } = await supabase
          .from('prospects')
          .select('*')
          .in('user_id', userIds);
        
        if (prospectsError) throw prospectsError;
        
        const { data: savedSearches, error: searchesError } = await supabase
          .from('saved_searches')
          .select('*')
          .in('user_id', userIds)
          .gte('created_at', sevenDaysAgo.toISOString());
          
        if (searchesError) throw searchesError;

        const metrics = users.map(user => {
          const userProspects = prospects?.filter(p => p.user_id === user.id) || [];
          const userSearches = savedSearches?.filter(s => s.user_id === user.id) || [];
          
          let emailCount = 0;
          let faceToFaceCount = 0;
          let meetingCount = 0;
          let completedCount = 0;
          
          userProspects.forEach(prospect => {
            if (prospect.activity_log) {
              prospect.activity_log.forEach((activity: any) => {
                const activityDate = new Date(activity.timestamp);
                if (activityDate >= sevenDaysAgo) {
                  if (activity.type === 'Email') {
                    emailCount++;
                  }
                  
                  // Normalize face to face activity types for consistent counting
                  const activityType = activity.type ? activity.type.toLowerCase() : '';
                  if (activityType === 'face to face') {
                    faceToFaceCount++;
                    console.log('User Table: Found face to face activity for user', user.id, ':', activity);
                  }
                  
                  if (activity.type === 'Meeting') {
                    meetingCount++;
                  }
                }
              });
            }
            
            if (['Done', 'Meeting', 'Quoted'].includes(prospect.status || '')) {
              completedCount++;
            }
          });

          return {
            id: user.id,
            email: user.email || '',
            full_name: user.full_name || 'N/A',
            totalProspects: userProspects.length,
            newProspects: userProspects.filter(p => 
              new Date(p.created_at || '') >= sevenDaysAgo
            ).length,
            emailsSent: emailCount,
            faceToFace: faceToFaceCount,
            meetingsSet: meetingCount,
            bulkSearches: user.totalSearches || 0,
            savedSearches: userSearches.length,
            completedProspects: completedCount,
          };
        });

        console.log('Calculated user metrics:', metrics);
        setUserMetrics(metrics);
      } catch (error) {
        console.error('Error fetching user metrics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserMetrics();
  }, [userId, userRole]);

  if (!['admin', 'supervisor'].includes(userRole || '')) return null;
  
  if (isLoading) {
    return <div className="text-center py-4">Loading user metrics...</div>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mt-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Team Performance (Last 7 Days)</h3>
        <Link to="/users">
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>View Team Details</span>
          </Button>
        </Link>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Total Prospects</TableHead>
              <TableHead>New Prospects</TableHead>
              <TableHead>Emails Sent</TableHead>
              <TableHead>Face To Face</TableHead>
              <TableHead>Meetings Set</TableHead>
              <TableHead>Bulk Searches</TableHead>
              <TableHead>Saved Searches</TableHead>
              <TableHead>Completed</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {userMetrics.map((metric) => (
              <TableRow key={metric.id}>
                <TableCell>{metric.full_name}</TableCell>
                <TableCell>{metric.totalProspects}</TableCell>
                <TableCell>{metric.newProspects}</TableCell>
                <TableCell>{metric.emailsSent}</TableCell>
                <TableCell>{metric.faceToFace}</TableCell>
                <TableCell>{metric.meetingsSet}</TableCell>
                <TableCell>{metric.bulkSearches}</TableCell>
                <TableCell>{metric.savedSearches}</TableCell>
                <TableCell>{metric.completedProspects}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default UserMetricsTable;
