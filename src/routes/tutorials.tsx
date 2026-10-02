import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getAllTutorials, addTutorial, removeTutorial, getDeletedIds, getApiBaseUrl, type Tutorial } from "@/lib/data";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

// The public list and tutorial detail pages render through this parent route.
export const Route = createFileRoute("/tutorials")({
  head: () => ({
    meta: [
      { title: "Crochet Tutorials — CozyKnots" },
      {
        name: "description",
        content:
          "Beginner to advanced crochet tutorials with step-by-step videos, pattern PDFs, material lists and written instructions.",
      },
      { property: "og:title", content: "Crochet Tutorials — CozyKnots" },
      {
        property: "og:description",
        content: "Learn crochet at your own pace with cozy, easy-to-follow video lessons and pattern PDFs.",
      },
    ],
  }),
  component: TutorialsLayout,
});

function TutorialsLayout() {
  const { user } = useAuth();
  const [tutorialList, setTutorialList] = useState<Tutorial[]>([]);

  const loadTutorials = async () => {
    const deleted = getDeletedIds();
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/tutorials`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          data.forEach((t: Tutorial) => addTutorial(t));
        }
      }
    } catch (err) {
      console.log("Backend notice, loading local store");
    }
    const local = getAllTutorials();
    setTutorialList(Array.isArray(local) ? local.filter((t) => !deleted.includes(t.id)) : []);
  };

  useEffect(() => {
    loadTutorials();
  }, []);

  return <Outlet />;
}
