import { openTutorialPdf, type Tutorial } from "@/lib/data";

/** Opens an uploaded pattern PDF, or the printable pattern page when none is attached. */
export function downloadPatternPDF(tutorial: Tutorial) {
  openTutorialPdf(tutorial);
}
