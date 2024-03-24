import { useSearchParams } from "react-router-dom";
import Explorer from "./components/Explorer";

function Explore() {
  const [search] = useSearchParams()
  const url = search.get('url')

  if (!url) return <></>

  return (
    <>
      <p><b>Pod:</b> {url}</p>

      <Explorer url={url} />
    </>
  )
}

export default Explore