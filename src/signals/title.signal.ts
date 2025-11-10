import { signal } from "@preact/signals-react"

export const pageTitle = signal<string>("Cases")

export const usePageTitle = () => {
  const setPageTitle = (newPageTitle: string) => pageTitle.value = newPageTitle

  return {
    pageTitle,
    setPageTitle,
  }
}
