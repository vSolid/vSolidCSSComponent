import { useEffect, useState } from "react";
import Explorer from "./components/Explorer";
import Toolbar from "./components/ui/ToolBar";
import { useResource } from "./contexts/resource";

export default function Explore() {
  const { url } = useResource()

  const [_, setUrlValue] = useState(url || "")

  if (!url) return <></>

  useEffect(() => {
    setUrlValue(url)
  }, [url])

  return (
    <>
      <Toolbar />
      <Explorer />
    </>
  )
}