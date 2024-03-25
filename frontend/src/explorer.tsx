import { useNavigate, useSearchParams } from "react-router-dom";
import Explorer from "./components/Explorer";
import { useEffect, useState } from "react";

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
      <div>
        <form onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          navigate(`/explore/?url=${encodeURIComponent(urlValue)}`)
        }}>
          <label htmlFor="pod_url"><b>Pod: </b></label>
          <input style={{ width: "210px" }} id="pod_url" value={urlValue} onChange={(e) => setUrlValue(e.target.value)} />
          <input type="submit" value="Goto" />
        </form>
      </div>

      <Explorer url={url} />
    </>
  )
}

export default Explore