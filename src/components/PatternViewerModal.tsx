import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Tutorial } from "@/lib/data";

type PatternViewerModalProps = {
  tutorial: Tutorial | null;
  onClose: () => void;
};

export function PatternViewerModal({ tutorial, onClose }: PatternViewerModalProps) {
  return (
    <Dialog open={tutorial !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        {tutorial && (
          <>
            <DialogHeader>
              <DialogTitle>{tutorial.title}</DialogTitle>
              <DialogDescription>{tutorial.level} · {tutorial.duration}</DialogDescription>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">{tutorial.description}</p>
            <section>
              <h3 className="font-semibold">Materials</h3>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
                {tutorial.materials.map((material) => <li key={material}>{material}</li>)}
              </ul>
            </section>
            <section>
              <h3 className="font-semibold">Pattern steps</h3>
              <ol className="mt-2 list-decimal space-y-2 pl-5 text-sm">
                {tutorial.steps.map((step, index) => <li key={`${index}-${step}`}>{step}</li>)}
              </ol>
            </section>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
