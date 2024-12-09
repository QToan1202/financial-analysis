import { RefObject, useCallback, useEffect } from 'react'

const useClickOutside = (ref: RefObject<HTMLElement | null>, callback: () => void) => {
  const handleClick = useCallback(
    (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as HTMLElement)) {
        callback()
      }
    },
    [callback, ref]
  )

  useEffect(() => {
    document.addEventListener('click', handleClick)

    return () => {
      document.removeEventListener('click', handleClick)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}

export default useClickOutside
