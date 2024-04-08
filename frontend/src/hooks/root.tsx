import { useEffect, useState } from "react";
import { UrlString, WithServerResourceInfo, getLinkedResourceUrlAll, getResourceInfo, getSourceUrl } from "@inrupt/solid-client";
import { space } from "rdf-namespaces";
import { fetch } from '@inrupt/solid-client-authn-browser';

export function useRoot(url: UrlString) {
    const [root, setRoot] = useState<string | undefined | null>();

    useEffect(() => {
        getRoot(url).then((root) => {
            setRoot(root)
        })
    }, [])

    return root;
}

async function getRoot(
    url: UrlString | WithServerResourceInfo,
  ): Promise<UrlString | null> {
    try {
      const resourceInfo =
        typeof url === "string"
          ? await getResourceInfo(url, { fetch: fetch })
          : url;
      const urlString = typeof url === "string" ? url : getSourceUrl(url);
  
      if (
        resourceInfo &&
        getLinkedResourceUrlAll(resourceInfo)
          ["type"]?.map((url) => url.toLowerCase())
          .includes(space.storage.toLowerCase())
      ) {
        return getSourceUrl(resourceInfo);
      }
  
      const parentUrl = getParentUrl(urlString);
      if (!parentUrl) {
        return null;
      }
  
      return getRoot(parentUrl);
    } catch {
      return null;
    }
  }
  
  function getParentUrl(url: UrlString | null): UrlString | null {
    if (url === null) {
      return null;
    }
    const urlObject = new URL(url);
    const path = urlObject.pathname;
    if (path === "/") {
      return null;
    }
  
    const pathWithoutTrailingSlash = path.endsWith("/")
      ? path.substring(0, path.length - 1)
      : path;
    const parentPath = pathWithoutTrailingSlash.substring(
      0,
      pathWithoutTrailingSlash.lastIndexOf("/"),
    );
  
    return urlObject.origin + parentPath + "/";
  }
  