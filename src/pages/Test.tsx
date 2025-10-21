import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import type { Tables } from '@/integrations/supabase/types';
import { MainLayout } from '@/components/layout/MainLayout';
import { useNavigate } from 'react-router-dom';

function TestPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [aircraft, setAircraft] = useState<Tables<'aircraft'>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function getSession() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }
      setUser(session.user);
    }
    getSession();
  }, [navigate]);

  useEffect(() => {
    async function getAircraft() {
      try {
        const { data, error } = await supabase
          .from('aircraft')
          .select('*');

        if (error) {
          throw error;
        }

        if (data) {
          setAircraft(data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    getAircraft();
  }, []);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <MainLayout user={user}>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Test Supabase Connection</h1>
        
        {loading && <p>Loading...</p>}
        {error && <p className="text-red-500">Error: {error}</p>}
        
        <div className="space-y-4">
          {aircraft.map((plane) => (
            <div key={plane.id} className="p-4 border rounded">
              <h2 className="font-bold">{plane.matricula}</h2>
              <p>Modelo: {plane.modelo}</p>
              <p>Estado: {plane.estado}</p>
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}

export default TestPage;