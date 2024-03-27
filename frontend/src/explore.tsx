import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Explorer from "./components/Explorer";
import Toolbar from "./components/ui/ToolBar";
import { useResource } from "./contexts/resource";

export default function Explore() {
  const { url } = useResource()
  const navigate = useNavigate()

  const [urlValue, setUrlValue] = useState(url || "")

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