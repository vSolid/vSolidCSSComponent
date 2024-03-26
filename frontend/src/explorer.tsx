import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Explorer from "./components/Explorer";

function Explore() {
  const [search] = useSearchParams()
  const url = search.get('url')
  const navigate = useNavigate()

  const [urlValue, setUrlValue] = useState(url || "")

  if (!url) return <></>

  useEffect(() => {
    setUrlValue(url)
  }, [url])

  return (
    <>
      <nav>
        <form onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          navigate(`/explore/?url=${encodeURIComponent(urlValue)}`)
        }}>
          <label htmlFor="pod_url"><b>Pod: </b></label>
          <input style={{ width: "210px" }} id="pod_url" value={urlValue} onChange={(e) => setUrlValue(e.target.value)} />
          <input type="submit" value="Go to" />
        </form>
      </nav>

      <Explorer />
    </>
  )
}

export default Explore