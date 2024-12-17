import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, subDays } from 'date-fns';
import { useEffect, useState } from 'react';
import { supabase } from "@/integrations/supabase/client";

interface MetricsGraphProps {
  userId: number | null;
  userRole: string | null;
}

interface DailyMetrics {
  date: string;
  totalProspects: number;
  newProspects: number;
  emailsSent: number;
  callsMade: number;
}

const MetricsGraph = ({ userId, userRole }: MetricsGraphProps) => {
  const [data, setData] = useState<DailyMetrics[]>([]);

  useEffect(() => {
    const fetchMetricsData = async () => {
      if (!userId) return;

      try {
        console.log('Fetching metrics data for user:', userId);
        let query = supabase.from('prospects').select('*');
        
        if (userRole === 'user') {
          query = query.eq('user_id', userId);
        } else if (userRole === 'supervisor') {
          const { data: supervisedUsers } = await supabase
            .from('users')
            .select('id')
            .eq('supervisor_id', userId);
          
          if (supervisedUsers) {
            const userIds = supervisedUsers.map(user => user.id);
            userIds.push(userId);
            query = query.in('user_id', userIds);
          }
        }

        const { data: prospectsData, error } = await query;

        if (error) {
          console.error('Error fetching prospects:', error);
          return;
        }

        // Generate data for the last 7 days
        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const date = subDays(new Date(), i);
          return format(date, 'yyyy-MM-dd');
        }).reverse();

        const metricsData = last7Days.map(date => {
          const dayStart = new Date(date);
          const dayEnd = new Date(date);
          dayEnd.setHours(23, 59, 59, 999);

          const dayProspects = prospectsData?.filter(
            prospect => {
              const prospectDate = new Date(prospect.created_at);
              return prospectDate >= dayStart && prospectDate <= dayEnd;
            }
          ) || [];

          let emailCount = 0;
          let callCount = 0;

          dayProspects.forEach(prospect => {
            if (prospect.activity_log) {
              prospect.activity_log.forEach((activity: any) => {
                const activityDate = new Date(activity.timestamp);
                if (activityDate >= dayStart && activityDate <= dayEnd) {
                  if (activity.type === 'Email') emailCount++;
                  if (activity.type === 'Phone Call') callCount++;
                }
              });
            }
          });

          return {
            date: format(dayStart, 'MMM dd'),
            totalProspects: prospectsData?.filter(
              prospect => new Date(prospect.created_at) <= dayEnd
            ).length || 0,
            newProspects: dayProspects.length,
            emailsSent: emailCount,
            callsMade: callCount,
          };
        });

        console.log('Generated metrics data:', metricsData);
        setData(metricsData);
      } catch (error) {
        console.error('Error processing metrics data:', error);
      }
    };

    fetchMetricsData();
  }, [userId, userRole]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold mb-4">7-Day Activity Overview</h3>
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="totalProspects" 
              stroke="#8884d8" 
              name="Total Prospects"
            />
            <Line 
              type="monotone" 
              dataKey="newProspects" 
              stroke="#82ca9d" 
              name="New Prospects"
            />
            <Line 
              type="monotone" 
              dataKey="emailsSent" 
              stroke="#ffc658" 
              name="Emails Sent"
            />
            <Line 
              type="monotone" 
              dataKey="callsMade" 
              stroke="#ff7300" 
              name="Calls Made"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MetricsGraph;