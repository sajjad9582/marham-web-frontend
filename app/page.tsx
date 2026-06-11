import { redirect } from "next/navigation";

export default function Page() {
  return (
    redirect(process.env.NEXT_PUBLIC_MARHAM_HOME_URL!)
  )
}
