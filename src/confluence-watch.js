const CONFLUENCE_BASE_URL = process.env.CONFLUENCE_BASE_URL
const CONFLUENCE_PAGE_ID = process.env.CONFLUENCE_PAGE_ID

function showToast(message, type) {
  const existing = document.getElementById('radar-toast')
  if (existing) existing.remove()

  const toast = document.createElement('div')
  toast.id = 'radar-toast'
  toast.className = `radar-toast radar-toast--${type}`
  toast.textContent = message
  document.body.appendChild(toast)

  requestAnimationFrame(() => toast.classList.add('radar-toast--visible'))

  setTimeout(() => {
    toast.classList.remove('radar-toast--visible')
    toast.addEventListener('transitionend', () => toast.remove(), { once: true })
  }, 5000)
}

function openWatchPopup() {
  const watchUrl = `${CONFLUENCE_BASE_URL}/pages/dowatch.action?pageId=${CONFLUENCE_PAGE_ID}&target=page`
  const popup = window.open(watchUrl, 'confluence-watch', 'width=700,height=500,resizable=yes')
  if (popup) {
    showToast('A Confluence window opened — you are now subscribed to updates.', 'success')
  } else {
    showToast('Could not open Confluence. Please allow popups for this site.', 'error')
  }
}

document.addEventListener('DOMContentLoaded', function () {
  const btn = document.getElementById('keep-me-posted-btn')
  if (!btn) return

  btn.addEventListener('click', async function () {
    if (!CONFLUENCE_BASE_URL || !CONFLUENCE_PAGE_ID) {
      showToast('Confluence is not configured yet.', 'error')
      return
    }

    btn.textContent = 'Subscribing…'
    btn.disabled = true

    try {
      const res = await fetch(`${CONFLUENCE_BASE_URL}/rest/api/user/watch/content/${CONFLUENCE_PAGE_ID}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      })

      if (res.ok || res.status === 204) {
        btn.textContent = "You're watching!"
        showToast('You are now watching this page. Confluence will notify you of any changes.', 'success')
      } else {
        btn.textContent = 'Keep me posted'
        btn.disabled = false
        showToast(`Subscription failed (${res.status}). Make sure you are logged in to Confluence.`, 'error')
      }
    } catch (_corsErr) {
      // CORS blocks cross-origin fetch — fall back to Confluence's native watch action
      btn.textContent = "You're watching!"
      openWatchPopup()
    }
  })
})
