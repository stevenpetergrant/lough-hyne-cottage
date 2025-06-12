import { Badge } from "@/components/ui/badge";

interface BreadCourseDetailsProps {
  specialRequests?: string;
}

export default function BreadCourseDetails({ specialRequests }: BreadCourseDetailsProps) {
  if (!specialRequests) return null;

  return (
    <div className="mt-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
      <h5 className="font-medium text-amber-800 mb-2">Course Experience Details</h5>
      <div className="text-sm text-gray-700">
        {(() => {
          try {
            const details = JSON.parse(specialRequests);
            return (
              <div className="space-y-2">
                {details.experienceLevel && (
                  <div>
                    <span className="font-medium">Experience Level:</span> {details.experienceLevel}
                  </div>
                )}
                {details.expectations && (
                  <div>
                    <span className="font-medium">Expectations:</span> {details.expectations}
                  </div>
                )}
                {details.dietaryRequirements && (
                  <div>
                    <span className="font-medium">Dietary Requirements:</span> {details.dietaryRequirements}
                  </div>
                )}
                {details.additionalInfo && (
                  <div>
                    <span className="font-medium">Additional Info:</span> {details.additionalInfo}
                  </div>
                )}
              </div>
            );
          } catch (e) {
            return <div className="text-gray-600">{specialRequests}</div>;
          }
        })()}
      </div>
    </div>
  );
}