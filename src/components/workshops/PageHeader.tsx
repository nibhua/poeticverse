import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PageHeaderProps {
  title: string;
  backPath: string;
}

export function PageHeader({ title, backPath }: PageHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="mb-6 flex items-center">
      <Button 
        variant="ghost" 
        className="mr-4"
        onClick={() => navigate(backPath)}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>
      <h1 className="text-2xl font-bold">{title}</h1>
    </div>
  );
}