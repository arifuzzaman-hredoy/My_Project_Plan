import { CertificatePage } from "@/components/roadmap-sections";
import { UploadedVaultFiles } from "@/components/uploaded-vault-files";

export default function Page() {
  return (
    <div className="space-y-10">
      <UploadedVaultFiles
        fileTypeFilter="certificate"
        grouped
        showUpload
        title={{
          en: "My Uploaded Certificate Files",
          bn: "My Uploaded Certificate File",
        }}
        body={{
          en: "Upload all real certificate files here. Every certificate will stay separated by field: Academic, IELTS, Cloud/DevOps, AI Automation, Debate, Rover, Olympiad, and more.",
          bn: "সব real certificate file এখানে upload করো। Academic, IELTS, Cloud/DevOps, AI Automation, Debate, Rover, Olympiad — field অনুযায়ী certificate আলাদা থাকবে।",
        }}
        uploadTitle={{
          en: "Upload New Certificate",
          bn: "New Certificate Upload",
        }}
      />
      <CertificatePage />
    </div>
  );
}
