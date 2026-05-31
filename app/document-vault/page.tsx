import { TopicPage } from "@/components/roadmap-sections";
import { UploadedVaultFiles } from "@/components/uploaded-vault-files";

export default function Page() {
  return (
    <div className="space-y-10">
      <UploadedVaultFiles
        grouped
        showUpload
        title={{
          en: "Real Uploaded Files & Documents",
          bn: "Real Uploaded File & Document",
        }}
        body={{
          en: "Upload certificates, documents, code files, images, PDFs, ZIPs and other proof files. Everything is separated by field.",
          bn: "Certificate, document, code file, image, PDF, ZIP এবং proof file upload করো। সব field অনুযায়ী separate থাকবে।",
        }}
        uploadTitle={{
          en: "Upload Any File by Field",
          bn: "Field অনুযায়ী Any File Upload",
        }}
      />
      <TopicPage type="documents" />
    </div>
  );
}
