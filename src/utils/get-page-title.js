import defaultSettings from '@/settings'

const title = defaultSettings.title || '奥格'

export default function getPageTitle (key) {
  if (key) {
    return `${key} - ${title}`
  }
  return title
}
