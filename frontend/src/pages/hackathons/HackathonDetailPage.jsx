import React, { useMemo } from "react";
import PageContainer from "../../components/layout/PageContainer";
import HackathonInfo from "../../components/hackathons/HackathonInfo";
import Button from "../../components/common/Button";
import { useParams, useNavigate } from "../../routes/Router";
import { hackathons } from "../../data/hackathons";

export function HackathonDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const hackathon = useMemo(() => {
    if (!id) return hackathons[0];
    return hackathons.find((h) => h.id === id) || hackathons[0];
  }, [id]);

  return (
    <PageContainer>
      {/* Back to hackathons */}
      <div className="mb-4">
        <Button
          variant="ghost"
          icon="arrow"
          onClick={() => navigate("/hackathons")}
          className="text-xs font-semibold pl-0 hover:bg-transparent"
        >
          Back to all hackathons
        </Button>
      </div>

      <HackathonInfo hackathon={hackathon} />
    </PageContainer>
  );
}

export default HackathonDetailPage;
