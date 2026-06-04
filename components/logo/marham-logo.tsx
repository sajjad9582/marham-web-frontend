import Link from "next/link"

import { MARHAM_HOME_URL } from "@/lib/constants/navigation"
import { cn } from "@/lib/utils"

type MarhamLogoProps = {
  className?: string
  width?: number
}

export function MarhamLogo({ className, width = 120 }: MarhamLogoProps) {
  return (
    <Link
      href={MARHAM_HOME_URL}
      aria-label="Marham home"
      className={cn("inline-flex shrink-0", className)}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1829.94 432.35"
        width={width}
        className="mt-1.5 h-auto"
        aria-hidden
      >
        <path
          className="fill-brandblue"
          d="M217.65,432.35C97.48,432.39,0,335,0,214.84a217.58,217.58,0,0,1,63.76-154c86.55-83.37,224.29-80.79,307.66,5.75,81.17,84.27,81.17,217.64,0,301.91a216.12,216.12,0,0,1-153.77,63.81"
        />
        <path
          className="fill-white"
          d="M327.11,313.67H266.57V207.19l-46.52,46.53-40.22-43,88.29-92h59Z"
        />
        <polygon
          className="fill-brandteal"
          points="105.19 313.67 156.41 313.67 156.41 188.19 174.94 206.66 209.92 171.82 156.89 118.8 139.81 118.8 120.47 118.68 105.19 118.68 105.19 313.67"
        />
        <path
          className="fill-brandblue"
          d="M509.16,117.06H556.5L609,201.49l52.48-84.43h47.35V316.72H665.18V186.37L609,271.65h-1.14l-55.62-84.43v129.5H509.16Z"
        />
        <path
          className="fill-brandblue"
          d="M825.17,115.63h40.5l85.57,201.09H905.32l-18.26-44.78H802.63l-18.25,44.78H739.6Zm46.21,117.52L844.85,168.4l-26.53,64.75Z"
        />
        <path
          className="fill-brandblue"
          d="M982,117.06h91.28c25.38,0,45.06,7.13,58.18,20.25,11.13,11.12,17.12,26.81,17.12,45.64v.57c0,32.23-17.4,52.48-42.79,61.89l48.78,71.31h-51.35l-42.78-63.89H1026v63.89H982Zm88.42,97c21.4,0,33.66-11.41,33.66-28.24v-.57c0-18.83-13.12-28.52-34.51-28.52H1026V214Z"
        />
        <path
          className="fill-brandblue"
          d="M1188.22,117.06h43.93v79h81v-79h43.93V316.72h-43.93V236.57h-81v80.15h-43.93Z"
        />
        <path
          className="fill-brandblue"
          d="M1473.43,115.63h40.5l85.57,201.09h-45.92l-18.26-44.78h-84.43l-18.25,44.78h-44.78Zm46.21,117.52-26.53-64.75-26.53,64.75Z"
        />
        <path
          className="fill-brandblue"
          d="M1630.28,117.06h47.35l52.48,84.43,52.48-84.43h47.35V316.72H1786.3V186.37l-56.19,85.28H1729l-55.62-84.43v129.5h-43.07Z"
        />
      </svg>
    </Link>
  )
}
