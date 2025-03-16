'use client';

import { withAuth } from '../../../context/AuthContext';
import AgentPage from '../../../components/agent/AgentPage';
import Navbar from '../../../components/Navbar';

function AgentDetails({ params }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="md:mr-64 p-4">
        <AgentPage agentId={params.id} />
      </div>
    </div>
  );
}

export default withAuth(AgentDetails);
