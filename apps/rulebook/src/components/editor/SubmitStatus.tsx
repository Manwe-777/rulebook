/** Why the record can't be sent, or that sending failed. */
export default function SubmitStatus({
  blocked,
  offline,
  failed,
}: {
  blocked: boolean;
  offline: string | null;
  failed: boolean;
}) {
  return (
    <>
      {blocked && <span className="text-sm text-red-800">Fix the errors first.</span>}
      {offline && <span className="text-sm text-red-800">{offline}.</span>}
      {failed && <span className="text-sm text-red-800">Could not send. Try again.</span>}
    </>
  );
}
