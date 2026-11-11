/**
 * Public visibility of the Free Evaluation feature.
 *
 * Miss Jaweria does not want an unavailable service advertised. Unless the explicit switch
 * FREE_EVALUATION_PUBLIC_LISTING=true is set (separately from the API key and from the privacy
 * approval flag, so having a key never turns it on):
 *  - no navigation, footer or homepage link points to /free-evaluation;
 *  - the page returns 404 and is left out of the sitemap;
 *  - evaluationAvailable() is false, so the submission path stays disabled.
 * The implementation and any collected data are untouched. To restore the feature, set the switch
 * once the service is operational and privacy-approved, then redeploy.
 */
export function evaluationPubliclyListed(): boolean {
  return process.env.FREE_EVALUATION_PUBLIC_LISTING === "true";
}
