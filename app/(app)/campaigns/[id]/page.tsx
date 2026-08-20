"use client";

import { useParams } from "next/navigation";
import { CampaignDetailScreen } from "../../../../features/campaigns/screens/CampaignDetailScreen";

export default function CampaignDetailPage() {
  const params = useParams();
  const id = params.id as string;
  
  if (!id) return null;

  return <CampaignDetailScreen id={id} />;
}

